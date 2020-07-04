import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { EtherKey } from './Token';
import { Input } from '../types';
import { validateTokenValue, ValidationStatus } from './actions/validators';
import { bnum } from '../utils/helpers';
import { calcSingleOutGivenPoolIn } from '../utils/math';

export enum DepositType {
    MULTI_ASSET,
    SINGLE_ASSET,
}

export default class RemoveLiquidityFormStore {
    @observable activeToken: string;
    @observable activePool: string;
    @observable activeAccount: string | undefined = undefined;
    @observable modalOpen: boolean;
    @observable shareToWithdraw: Input;
    @observable depositType: DepositType;
    @observable validationStatus: ValidationStatus;

    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.resetModal();
        this.validationStatus = ValidationStatus.EMPTY;
    }

    @action openModal(poolAddress, account, tokenAddresses: string[]) {
        this.modalOpen = true;
        this.activeToken = tokenAddresses[0];
        this.activePool = poolAddress;
        this.activeAccount = account;
        this.depositType = DepositType.MULTI_ASSET;
        this.validationStatus = ValidationStatus.EMPTY;
    }

    setShareToWithdraw(value: string) {
        this.shareToWithdraw.value = value;
        this.shareToWithdraw.validation = validateTokenValue(value);
        if (bnum(value).gt(100)) {
            this.shareToWithdraw.validation =
                ValidationStatus.MAX_VALUE_EXCEEDED;
        }
        this.validate();
    }

    setDepositType(depositType: DepositType) {
        this.depositType = depositType;
        this.validate();
    }

    setActiveToken(asset: string) {
        this.activeToken = asset;
        this.validate();
    }

    getShareToWithdraw() {
        return this.shareToWithdraw.value;
    }

    hasValidInput() {
        return this.validationStatus === ValidationStatus.VALID;
    }

    private validate() {
        const { tokenStore, poolStore } = this.rootStore;
        const pool = poolStore.getPool(this.activePool);

        this.validationStatus = ValidationStatus.VALID;
        if (this.shareToWithdraw.validation !== ValidationStatus.VALID) {
            this.validationStatus = this.shareToWithdraw.validation;
        }
        if (this.depositType === DepositType.SINGLE_ASSET) {
            const tokenOutAddress = this.activeToken;
            const tokenOut = pool.tokens.find(
                token => token.address === tokenOutAddress
            );

            const maxOutRatio = 1 / 3;
            const shareToWithdraw = this.getShareToWithdraw();
            const amount = poolStore.getUserTokenPercentage(
                pool.address,
                this.activeAccount,
                shareToWithdraw
            );

            const tokenBalanceOut = tokenStore.denormalizeBalance(
                tokenOut.balance,
                tokenOutAddress
            );
            const tokenWeightOut = tokenOut.denormWeight;
            const poolSupply = tokenStore.denormalizeBalance(
                pool.totalShares,
                EtherKey
            );
            const totalWeight = pool.totalWeight;
            const swapFee = pool.swapFee;

            if (amount.div(poolSupply).gt(0.99)) {
                // Invalidate user's attempt to withdraw the entire pool supply in a single token
                // At amounts close to 100%, solidity math freaks out
                this.validationStatus = ValidationStatus.INSUFFICIENT_LIQUIDITY;
                return;
            }

            const tokenAmountOut = calcSingleOutGivenPoolIn(
                tokenBalanceOut,
                tokenWeightOut,
                poolSupply,
                totalWeight,
                amount,
                swapFee
            );
            if (tokenAmountOut.div(tokenBalanceOut).gt(maxOutRatio)) {
                this.validationStatus = ValidationStatus.INSUFFICIENT_LIQUIDITY;
            }
        }
    }

    @action closeModal() {
        this.modalOpen = false;
        this.resetModal();
    }

    resetModal() {
        this.shareToWithdraw = {
            value: '',
            touched: false,
            validation: ValidationStatus.EMPTY,
        };
    }
}
