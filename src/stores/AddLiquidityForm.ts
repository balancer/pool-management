import {action, observable} from 'mobx';
import RootStore from 'stores/Root';
import {BigNumberMap, Pool, PoolToken} from '../types';
import {bnum, hasMaxApproval} from '../utils/helpers';
import {validateTokenValue, ValidationStatus} from './actions/validators';
import {BigNumber} from 'utils/bignumber';

// Token Address -> checked
interface CheckboxMap {
    [index: string]: Checkbox;
}

// Token -> amount
interface InputMap {
    [index: string]: Input;
}

interface Input {
    value: string;
    touched: boolean;
    validation: ValidationStatus;
}

interface Checkbox {
    checked: boolean;
    touched: boolean;
}

export enum ModalMode {
    ADD_LIQUIDITY,
    REMOVE_LIQUIDITY
}

export default class AddLiquidityFormStore {
    @observable checkboxes: CheckboxMap;
    @observable checkboxesLoaded: boolean;
    @observable inputs: InputMap;
    @observable activeInputKey: string | undefined;
    @observable activePool: string;
    @observable activeAccount: string | undefined = undefined;
    @observable modalOpen: boolean;
    @observable modalMode: ModalMode;
    @observable joinRatio: BigNumber;
    @observable hasInputExceedUserBalance: boolean;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.resetApprovalCheckboxStatusMap();
    }

    @action openModal(poolAddress, account, tokenAddresses: string[], modalMode: ModalMode) {
        this.modalOpen = true;
        this.modalMode = modalMode;
        this.resetApprovalCheckboxStatusMap();
        this.activePool = poolAddress;
        this.activeAccount = account;
        this.initializeCheckboxes(tokenAddresses);
        this.initializeInputs(tokenAddresses);
    }

    @action closeModal() {
        this.modalOpen = false;
        this.resetApprovalCheckboxStatusMap();
    }

    @action resetApprovalCheckboxStatusMap() {
        this.checkboxes = {} as CheckboxMap;
        this.inputs = {} as InputMap;
        this.activeInputKey = undefined;
        this.checkboxesLoaded = false;
    }

    isActivePool(poolAddress: string) {
        return this.activePool === poolAddress;
    }

    isActiveAccount(account: string) {
        return this.activeAccount === account;
    }

    // Assumes balances are loaded - don't execute without that condition already met
    private getInputValidationStatus(
        tokenAddress: string,
        account: string,
        inputBalance: BigNumber
    ): ValidationStatus {
        const { tokenStore } = this.rootStore;
        const accountBalance = tokenStore.normalizeBalance(
            tokenStore.getBalance(tokenAddress, account),
            tokenAddress
        );

        let status = validateTokenValue(inputBalance.toString());

        if (status === ValidationStatus.VALID) {
            status = inputBalance.lte(accountBalance)
                ? ValidationStatus.VALID
                : ValidationStatus.INSUFFICIENT_BALANCE;
        }

        return status;
    }

    private requireValidAddress(tokenAddress) {
        if (!this.inputs[tokenAddress]) {
            throw new Error(`Amount input for ${tokenAddress} not initialized`);
        }
    }

    getInput(tokenAddress): Input {
        this.requireValidAddress(tokenAddress);
        return this.inputs[tokenAddress];
    }

    @action setInputValue(tokenAddress: string, value: string) {
        this.requireValidAddress(tokenAddress);
        this.inputs[tokenAddress].value = value;
        const status = validateTokenValue(value);
        this.setInputStatus(tokenAddress, status);
    }

    @action setActiveInputKey(tokenAddress: string) {
        this.activeInputKey = tokenAddress;
    }

    @action setInputStatus(tokenAddress: string, status: ValidationStatus) {
        this.requireValidAddress(tokenAddress);
        this.inputs[tokenAddress].validation = status;
    }

    @action setInputTouched(tokenAddress: string, touched: boolean) {
        this.requireValidAddress(tokenAddress);
        this.inputs[tokenAddress].touched = touched;
    }

    getCheckbox(tokenAddress: string): Checkbox {
        if (!this.checkboxes[tokenAddress]) {
            throw new Error(
                `No checkbox found for tokenAddress ${tokenAddress}`
            );
        }
        return this.checkboxes[tokenAddress];
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

    calcRatio(
        pool: Pool,
        activeInputAddress: string,
        activeInputAmount: string
    ): BigNumber {
        const activeToken = pool.tokens.find(
            token => token.address === activeInputAddress
        );
        return bnum(activeInputAmount).div(activeToken.balance);
    }

    setJoinRatio(ratio: BigNumber) {
        console.log('joinRatio', ratio.toString()
        );
        this.joinRatio = ratio;
    }

    @action refreshInputAmounts(pool: Pool, account: string, ratio: BigNumber) {
        pool.tokens.forEach(token => {
            let hasInputExceedUserBalance = false;

            const hasAccount = !!account;
            const isTokenActive = token.address === this.activeInputKey;
            const isActiveInputValid = this.inputs[this.activeInputKey].validation === ValidationStatus.VALID;

            /* Only calculate other token balances if
                1. User logged in
                2. This token is not for the active input field
                3. The active input is valid
             */
            if (hasAccount && !isTokenActive && isActiveInputValid) {
                const requiredBalance = token.balance.times(ratio);
                this.inputs[token.address].value = requiredBalance.toString();

                const validationStatus = this.getInputValidationStatus(
                    token.address,
                    account,
                    requiredBalance
                );

                this.inputs[
                    token.address
                ].validation = validationStatus;

                if (validationStatus === ValidationStatus.INSUFFICIENT_BALANCE) {
                    hasInputExceedUserBalance = true;
                }
            }

            // Reset other input fields on invalid active input
            else if (hasAccount && !isTokenActive && !isActiveInputValid) {
                this.setInputValue(token.address, '');
            }

            // Check for insufficent balance on active valid input
            else if (hasAccount && isTokenActive && isActiveInputValid) {
                const {validation, value} = this.inputs[token.address];

                if (validation === ValidationStatus.VALID) {
                    this.inputs[
                        token.address
                        ].validation = this.getInputValidationStatus(
                        token.address,
                        account,
                        bnum(value)
                    );
                }
            }

            this.hasInputExceedUserBalance = hasInputExceedUserBalance;
        });
    }

    formatInputsForJoin(): string[] {
        const {tokenStore} = this.rootStore;
        return Object.keys(this.inputs).map(key => {
            const tokenAddress = key;
            return tokenStore.denormalizeBalance(bnum(this.inputs[tokenAddress].value), tokenAddress).integerValue(BigNumber.ROUND_DOWN).toString();
        });
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

    @action initializeInputs(tokenAddresses: string[]) {
        tokenAddresses.forEach(tokenAddress => {
            this.inputs[tokenAddress] = {
                value: '',
                touched: false,
                validation: ValidationStatus.EMPTY,
            };
        });
    }
}
