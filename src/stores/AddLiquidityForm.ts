import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import {
    BigNumberMap,
    Checkbox,
    CheckboxMap,
    Input,
    InputMap,
    Pool,
} from '../types';
import { bnum, hasMaxApproval, MAX_UINT } from '../utils/helpers';
import { validateTokenValue, ValidationStatus } from './actions/validators';
import { BigNumber } from 'utils/bignumber';

export enum DepositType {
    MULTI_ASSET,
    SINGLE_ASSET,
}

export default class AddLiquidityFormStore {
    @observable checkboxes: CheckboxMap;
    @observable checkboxesLoaded: boolean;
    @observable inputs: InputMap;
    @observable joinInputs: BigNumberMap;
    @observable confirmation: Checkbox;
    @observable activeInputKey: string | undefined;
    @observable activeToken: string;
    @observable activePool: string;
    @observable activeAccount: string | undefined = undefined;
    @observable modalOpen: boolean;
    @observable hasTransactionError: boolean;
    @observable depositType: DepositType;
    @observable joinRatio: BigNumber;
    @observable validationStatus: ValidationStatus;

    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.resetApprovalCheckboxStatusMap();
        this.resetJoinInputs();
        this.validationStatus = ValidationStatus.EMPTY;
    }

    @action openModal(poolAddress, account, tokenAddresses: string[]) {
        this.modalOpen = true;
        this.depositType = DepositType.MULTI_ASSET;
        this.resetApprovalCheckboxStatusMap();
        this.confirmation = {
            checked: false,
            touched: false,
        };
        this.activeToken = tokenAddresses[0];
        this.activePool = poolAddress;
        this.activeAccount = account;
        this.hasTransactionError = false;
        this.initializeCheckboxes(tokenAddresses);
        this.initializeInputs(tokenAddresses);
        this.validationStatus = ValidationStatus.EMPTY;
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

    @action resetJoinInputs() {
        this.joinInputs = {} as BigNumberMap;
    }

    // Assumes balances are loaded - don't execute without that condition already met
    private getInputValidationStatus(
        tokenAddress: string,
        account: string | undefined,
        inputBalance: BigNumber
    ): ValidationStatus {
        const { tokenStore } = this.rootStore;

        // Always valid if no account
        if (!account) {
            return ValidationStatus.VALID;
        }

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
        this.inputs[tokenAddress].validation = validateTokenValue(value);
    }

    @action setActiveInputKey(tokenAddress: string) {
        this.activeInputKey = tokenAddress;
    }

    @action setInputTouched(tokenAddress: string, touched: boolean) {
        this.requireValidAddress(tokenAddress);
        this.inputs[tokenAddress].touched = touched;
    }

    hasValidInput(): boolean {
        return this.validationStatus === ValidationStatus.VALID;
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

    @action setActiveToken(assetAddress) {
        this.activeToken = assetAddress;
        this.validate();
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

    setDepositType(depositType: DepositType) {
        this.depositType = depositType;
        this.validate();
    }

    @action setTransactionError() {
        this.hasTransactionError = true;
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
        this.joinRatio = ratio;
    }

    @action refreshInputAmounts(pool: Pool, account: string, ratio: BigNumber) {
        this.resetJoinInputs();

        pool.tokens.forEach(token => {
            const isTokenActive = token.address === this.activeInputKey;
            const isActiveInputValid =
                this.inputs[this.activeInputKey].validation ===
                ValidationStatus.VALID;
            const isMultiAsset = this.depositType === DepositType.MULTI_ASSET;

            if (!isMultiAsset && !isTokenActive) {
                return;
            }

            /* Only calculate other token balances if
                2. This token is not for the active input field
                3. The active input is valid
             */
            if (!isTokenActive && isActiveInputValid) {
                const requiredBalance = token.balance.times(ratio);
                this.inputs[token.address].value = requiredBalance.toString();

                const validationStatus = this.getInputValidationStatus(
                    token.address,
                    account,
                    requiredBalance
                );

                this.inputs[token.address].validation = validationStatus;

                this.setJoinInputParam(token.address, requiredBalance);
            }

            // Reset other input fields on invalid active input
            else if (!isTokenActive && !isActiveInputValid) {
                this.setInputValue(token.address, '');
            }

            // Check for insufficent balance on active valid input if user logged in
            else if (isTokenActive && isActiveInputValid) {
                const { validation, value } = this.inputs[token.address];

                if (validation === ValidationStatus.VALID && account) {
                    const requiredBalance = token.balance.times(ratio);

                    const validation = this.getInputValidationStatus(
                        token.address,
                        account,
                        bnum(value)
                    );

                    this.inputs[token.address].validation = validation;

                    const valueForJoin = requiredBalance.gt(bnum(value))
                        ? requiredBalance
                        : bnum(value);

                    this.setJoinInputParam(token.address, valueForJoin);
                }
            }
        });

        this.validate();
    }

    private validate() {
        const { poolStore } = this.rootStore;
        const pool = poolStore.getPool(this.activePool);

        this.validationStatus = ValidationStatus.VALID;
        // amount
        if (this.depositType === DepositType.MULTI_ASSET) {
            for (const token of pool.tokens) {
                const amountInput = this.getInput(token.address);
                if (amountInput.validation !== ValidationStatus.VALID) {
                    this.validationStatus = amountInput.validation;
                }
            }
        } else {
            const amountInput = this.getInput(this.activeToken);
            if (amountInput.validation !== ValidationStatus.VALID) {
                this.validationStatus = amountInput.validation;
            } else {
                const maxInRatio = 0.5;
                const amount = bnum(amountInput.value);
                const tokenIn = pool.tokens.find(
                    token => token.address === this.activeToken
                );
                if (amount.div(tokenIn.balance).gt(maxInRatio)) {
                    this.validationStatus =
                        ValidationStatus.INSUFFICIENT_LIQUIDITY;
                }
            }
        }
    }

    setJoinInputParam(tokenAddress: string, amount: BigNumber) {
        this.joinInputs[tokenAddress] = amount;
    }

    formatInputsForJoin(): string[] {
        const { tokenStore } = this.rootStore;
        return Object.keys(this.joinInputs).map(key => {
            const tokenAddress = key;
            return tokenStore
                .denormalizeBalance(
                    bnum(this.joinInputs[tokenAddress]),
                    tokenAddress
                )
                .integerValue(BigNumber.ROUND_DOWN)
                .toString();
        });
    }

    maxUintInputAmounts(): string[] {
        return Object.keys(this.joinInputs).map(key => {
            return MAX_UINT.toString();
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

    @action toggleConfirmation() {
        const checked = !this.confirmation.checked;
        this.confirmation = {
            checked,
            touched: true,
        };
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
