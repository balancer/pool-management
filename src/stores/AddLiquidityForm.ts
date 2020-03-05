import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { BigNumberMap } from '../types';
import { hasMaxApproval } from '../utils/helpers';
import { validateTokenValue, ValidationStatus } from './actions/validators';

// Token Address -> checked
interface CheckboxMap {
    [index: string]: Checkbox;
}

// Token -> amount
interface AmountInputMap {
    [index: string]: AmountInput;
}

interface AmountInput {
    value: string;
    touched: boolean;
    valid: ValidationStatus;
}

interface Checkbox {
    checked: boolean;
    touched: boolean;
}

export default class AddLiquidityFormStore {
    @observable checkboxes: CheckboxMap;
    @observable checkboxesLoaded: boolean;
    @observable amountInputs: AmountInputMap;
    @observable activeAmountInputKey: string | undefined;
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
        this.initializeCheckboxes(tokenAddresses);
        this.initializeAmountInputs(tokenAddresses);
    }

    @action closeModal() {
        this.modalOpen = false;
        this.resetApprovalCheckboxStatusMap();
    }

    @action resetApprovalCheckboxStatusMap() {
        this.checkboxes = {} as CheckboxMap;
        this.amountInputs = {} as AmountInputMap;
        this.activeAmountInputKey = undefined;
        this.checkboxesLoaded = false;
    }

    isActivePool(poolAddress: string) {
        return this.activePool === poolAddress;
    }

    isActiveAccount(account: string) {
        return this.activeAccount === account;
    }

    private validateAmountInputAddress(tokenAddress) {
        if (!this.amountInputs[tokenAddress]) {
            throw new Error(`Amount input for ${tokenAddress} not initialized`);
        }
    }

    getAmountInput(tokenAddress): AmountInput {
        this.validateAmountInputAddress(tokenAddress);
        return this.amountInputs[tokenAddress];
    }

    @action setAmountInputValue(tokenAddress: string, value: string) {
        console.log('setAmountInputValue', {
            tokenAddress,
            value,
        });
        this.validateAmountInputAddress(tokenAddress);
        this.amountInputs[tokenAddress].value = value;
        const status = validateTokenValue(value);
        this.setAmountInputStatus(tokenAddress, status);
    }

    @action setAmountInputStatus(
        tokenAddress: string,
        status: ValidationStatus
    ) {
        this.validateAmountInputAddress(tokenAddress);
        this.amountInputs[tokenAddress].valid = status;
    }

    @action setAmountInputTouched(tokenAddress: string, touched: boolean) {
        this.validateAmountInputAddress(tokenAddress);
        this.amountInputs[tokenAddress].touched = touched;
    }

    isCheckboxChecked(tokenAddress: string) {
        if (this.checkboxes[tokenAddress]) {
            return this.checkboxes[tokenAddress].checked;
        } else {
            return false;
        }
    }

    isCheckboxTouched(tokenAddress: string) {
        if (this.checkboxes[tokenAddress]) {
            return this.checkboxes[tokenAddress].touched;
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

    initApprovalCheckbox(): Checkbox {
        return {
            checked: false,
            touched: false,
        };
    }

    @action setApprovalCheckboxTouched(tokenAddress: string, touched: boolean) {
        if (!this.checkboxes[tokenAddress]) {
            this.checkboxes[tokenAddress] = this.initApprovalCheckbox();
        }

        this.checkboxes[tokenAddress].touched = touched;
    }

    @action setApprovalCheckboxChecked(tokenAddress: string, checked: boolean) {
        if (!this.checkboxes[tokenAddress]) {
            this.checkboxes[tokenAddress] = this.initApprovalCheckbox();
        }

        this.checkboxes[tokenAddress].checked = checked;
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

        this.checkboxesLoaded = true;
    }

    @action initializeCheckboxes(tokenAddresses: string[]) {
        tokenAddresses.forEach(tokenAddress => {
            this.checkboxes[tokenAddress] = {
                checked: false,
                touched: false,
            };
        });
        this.checkboxesLoaded = true;
    }

    @action initializeAmountInputs(tokenAddresses: string[]) {
        tokenAddresses.forEach(tokenAddress => {
            this.amountInputs[tokenAddress] = {
                value: '',
                touched: false,
                valid: ValidationStatus.EMPTY,
            };
        });
    }
}
