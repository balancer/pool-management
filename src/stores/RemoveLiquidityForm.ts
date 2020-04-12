import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { Input } from '../types';
import { validateTokenValue, ValidationStatus } from './actions/validators';
import { BigNumber } from '../utils/bignumber';
import { bnum, toPercentage } from '../utils/helpers';

export default class RemoveLiquidityFormStore {
    @observable activePool: string;
    @observable activeAccount: string | undefined = undefined;
    @observable modalOpen: boolean;
    @observable shareToWithdraw: Input;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.resetModal();
    }

    @action openModal(poolAddress, account, tokenAddresses: string[]) {
        this.modalOpen = true;
        this.activePool = poolAddress;
        this.activeAccount = account;
    }

    setShareToWithdraw(value: string) {
        this.shareToWithdraw.value = value;
        this.shareToWithdraw.validation = validateTokenValue(value);
        if (bnum(value).gt(100)) {
            this.shareToWithdraw.validation =
                ValidationStatus.MAX_VALUE_EXCEEDED;
        }
    }

    @action validateUserShareInput(poolAddress: string, account: string) {
        const { poolStore } = this.rootStore;
        const userShare = poolStore.getUserShare(poolAddress, account);
        if (userShare) {
            this.shareToWithdrawPercentageCheck(toPercentage(userShare));
        }
    }

    shareToWithdrawPercentageCheck(userShare: BigNumber) {
        if (this.shareToWithdraw.validation === ValidationStatus.VALID) {
            const formShare = bnum(this.getShareToWithdraw());
            if (formShare.gt(userShare)) {
                this.shareToWithdraw.validation =
                    ValidationStatus.INSUFFICIENT_BALANCE;
            }
        }
    }

    getShareToWithdraw() {
        return this.shareToWithdraw.value;
    }

    hasInputError() {
        const status = this.shareToWithdraw.validation;
        return (
            status !== ValidationStatus.VALID &&
            status !== ValidationStatus.EMPTY
        );
    }

    hasValidInput() {
        return (
            this.shareToWithdraw.validation === ValidationStatus.VALID ||
            this.shareToWithdraw.validation ===
                ValidationStatus.INSUFFICIENT_BALANCE
        );
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

    isActivePool(poolAddress: string) {
        return this.activePool === poolAddress;
    }

    isActiveAccount(account: string) {
        return this.activeAccount === account;
    }
}
