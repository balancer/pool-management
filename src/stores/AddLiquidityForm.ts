import { action, observable } from 'mobx';
import RootStore from 'stores/Root';

// Token Address -> checked
interface CheckboxStatusMap {
    [index: string]: CheckboxStatus;
}

interface CheckboxStatus {
    checked: boolean;
    touched: boolean;
}

export default class AddLiquidityFormStore {
    @observable approvalCheckboxStatus: CheckboxStatusMap;
    @observable approvalCheckboxStatusLoaded: boolean;
    @observable activePool: string;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.resetApprovalCheckboxStatusMap();
    }

    @action resetApprovalCheckboxStatusMap() {
        this.approvalCheckboxStatus = {} as CheckboxStatusMap;
        this.approvalCheckboxStatusLoaded = false;
        this.activePool = '';
    }

    isActivePool(poolAddress: string) {
        return this.activePool === poolAddress;
    }

    isChecked(tokenAddress: string) {
        return this.approvalCheckboxStatus[tokenAddress].checked;
    }

    isTouched(tokenAddress: string) {
        return  this.approvalCheckboxStatus[tokenAddress].touched;
    }

    @action setApprovalCheckboxTouched(tokenAddress: string, touched: boolean) {
        this.approvalCheckboxStatus[tokenAddress].touched = touched;
    }

    @action setApprovalCheckboxChecked(tokenAddress: string, checked: boolean) {
        this.approvalCheckboxStatus[tokenAddress].checked = checked;
    }

    @action setBulkApprovalCheckboxStatus(poolAddress: string, tokenAddresses: string[], checked: boolean[]) {
        if (tokenAddresses.length !== checked.length) {
            throw new Error('Length of input arrays does not match');
        }
        tokenAddresses.forEach((tokenAddress, index) => {
            this.approvalCheckboxStatus[tokenAddress] = {
                checked: checked[index],
                touched: false,
            };
        });
        this.approvalCheckboxStatusLoaded = true;
        this.activePool = poolAddress;
    }
}
