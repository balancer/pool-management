import {action, observable} from 'mobx';
import RootStore from 'stores/Root';
import {Input} from '../types';
import {validateTokenValue, ValidationStatus} from './actions/validators';
import {BigNumber} from "../utils/bignumber";
import {bnum} from "../utils/helpers";

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
    }

    shareToWithdrawPercentageCheck(userShare: BigNumber) {
        if (this.shareToWithdraw.validation === ValidationStatus.VALID) {
            const formShare = bnum(this.getShareToWithdraw());
            if (userShare.gt(formShare)) {
                this.shareToWithdraw.validation = ValidationStatus.INSUFFICIENT_BALANCE;
            }
        }
    }

    getShareToWithdraw() {
        return this.shareToWithdraw.value;
    }

    hasValidInput() {
        return this.shareToWithdraw.validation === ValidationStatus.VALID || this.shareToWithdraw.validation === ValidationStatus.INSUFFICIENT_BALANCE;
    }

    @action closeModal() {
        this.modalOpen = false;
        this.resetModal();
    }

    resetModal() {
        this.shareToWithdraw = {
            value: '',
            touched: false,
            validation: ValidationStatus.EMPTY
        }
    }

    isActivePool(poolAddress: string) {
        return this.activePool === poolAddress;
    }

    isActiveAccount(account: string) {
        return this.activeAccount === account;
    }
}