import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { BigNumberMap } from '../types';
import { hasMaxApproval } from '../utils/helpers';

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
    @observable activeAccount: string | undefined = undefined;
    @observable modalOpen: boolean;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.resetApprovalCheckboxStatusMap();
    }

    @action openModal(poolAddress, account, tokenAddresses: string[]) {
        this.modalOpen = true;
        this.resetApprovalCheckboxStatusMap();
        this.activePool = poolAddress;
        this.activeAccount = account;
        this.initializeApprovalCheckboxStatus(tokenAddresses);
    }

    @action closeModal() {
        this.modalOpen = false;
        this.resetApprovalCheckboxStatusMap();
    }

    @action resetApprovalCheckboxStatusMap() {
        this.approvalCheckboxStatus = {} as CheckboxStatusMap;
        this.approvalCheckboxStatusLoaded = false;
    }

    isActivePool(poolAddress: string) {
        return this.activePool === poolAddress;
    }

    isActiveAccount(account: string) {
        return this.activeAccount === account;
    }

    isChecked(tokenAddress: string) {
        if (this.approvalCheckboxStatus[tokenAddress]) {
            return this.approvalCheckboxStatus[tokenAddress].checked;
        } else {
            return false;
        }
    }

    isTouched(tokenAddress: string) {
        if (this.approvalCheckboxStatus[tokenAddress]) {
            return this.approvalCheckboxStatus[tokenAddress].touched;
        } else {
            return false;
        }
    }

    @action setActivePool(poolAddress) {
        this.activePool = poolAddress;
    }

    @action setActiveAccount(account) {
        this.activeAccount = account;
    }

    initApprovalCheckbox(): CheckboxStatus {
        return {
            checked: false,
            touched: false,
        };
    }

    @action setApprovalCheckboxTouched(tokenAddress: string, touched: boolean) {
        if (!this.approvalCheckboxStatus[tokenAddress]) {
            this.approvalCheckboxStatus[
                tokenAddress
            ] = this.initApprovalCheckbox();
        }

        this.approvalCheckboxStatus[tokenAddress].touched = touched;
    }

    @action setApprovalCheckboxChecked(tokenAddress: string, checked: boolean) {
        if (!this.approvalCheckboxStatus[tokenAddress]) {
            this.approvalCheckboxStatus[
                tokenAddress
            ] = this.initApprovalCheckbox();
        }

        this.approvalCheckboxStatus[tokenAddress].checked = checked;
    }

    @action setBulkApprovalCheckboxStatusByApprovals(
        poolAddress: string,
        tokenAddresses: string[],
        approvals: BigNumberMap
    ) {
        tokenAddresses.forEach((tokenAddress, index) => {
            if (!approvals[tokenAddress]) {
                throw new Error('Missing token address in approvals input');
            }

            this.setApprovalCheckboxChecked(
                tokenAddress,
                hasMaxApproval(approvals[tokenAddress])
            );
        });

        this.approvalCheckboxStatusLoaded = true;
    }

    @action initializeApprovalCheckboxStatus(tokenAddresses: string[]) {
        tokenAddresses.forEach(tokenAddress => {
            this.approvalCheckboxStatus[tokenAddress] = {
                checked: false,
                touched: false,
            };
        });
        this.approvalCheckboxStatusLoaded = true;
    }
}
