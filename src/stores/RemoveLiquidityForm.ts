import {action, observable} from 'mobx';
import RootStore from 'stores/Root';
import {Input} from '../types';
import {ValidationStatus} from './actions/validators';

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
        console.log("in open modal!," + this.modalOpen);
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