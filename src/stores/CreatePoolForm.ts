import { observable, action } from 'mobx';
import RootStore from 'stores/Root';
import { Checkbox, CheckboxMap, Input, InputMap } from '../types';
import { bnum } from '../utils/helpers';
import { validateTokenValue, ValidationStatus } from './actions/validators';
import { BigNumber } from 'utils/bignumber';

export default class CreatePoolFormStore {
    @observable tokens: string[];
    @observable activeInputKey: string | undefined;
    @observable checkboxes: CheckboxMap;
    @observable weights: InputMap;
    @observable amounts: InputMap;
    @observable fee: Input;
    @observable assetModal = {
        open: false,
        inputValue: '',
        activeTokenIndex: 0,
    };
    @observable hasWeightExceededTotal: boolean;
    @observable hasInputExceedUserBalance: boolean;

    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.tokens = [];
        this.checkboxes = {} as CheckboxMap;
        this.weights = {} as InputMap;
        this.amounts = {} as InputMap;
        this.fee = {
            value: '',
            touched: false,
            validation: ValidationStatus.EMPTY,
        };
        this.setDefaults();
    }

    @action addToken(token: string) {
        this.tokens.push(token);
        this.initializeTokenInputs(token);
        this.initializeCheckbox(token);
    }

    @action removeToken(tokenAddress: string) {
        const tokenIndex = this.tokens.findIndex(
            token => token === tokenAddress
        );
        this.tokens.splice(tokenIndex, 1);
    }

    @action setTokenWeight(tokenAddress: string, denormWeight: string) {
        this.weights[tokenAddress].value = denormWeight;
    }

    @action setTokenAmount(tokenAddress: string, amount: string) {
        this.amounts[tokenAddress].value = amount;
    }

    @action setToken(token: string) {
        const tokenIndex = this.assetModal.activeTokenIndex;
        this.tokens[tokenIndex] = token;
        this.initializeTokenInputs(token);
        this.initializeCheckbox(token);
    }

    @action setFee(fee: string) {
        this.fee.value = fee;

        const validationStatus =
            bnum(this.fee.value).gte(bnum(0.0001)) &&
            bnum(this.fee.value).lte(bnum(10))
                ? ValidationStatus.VALID
                : ValidationStatus.BAD_FEE;
        this.fee.validation = validationStatus;
    }

    @action setActiveInputKey(tokenAddress: string) {
        this.activeInputKey = tokenAddress;
    }

    @action setApprovalCheckboxTouched(tokenAddress: string, touched: boolean) {
        this.checkboxes[tokenAddress].touched = touched;
    }

    @action setApprovalCheckboxChecked(tokenAddress: string, checked: boolean) {
        this.checkboxes[tokenAddress].checked = checked;
    }

    @action openModal(tokenAddress: string) {
        const tokenIndex = this.tokens.findIndex(
            token => token === tokenAddress
        );
        this.assetModal = {
            open: true,
            inputValue: '',
            activeTokenIndex: tokenIndex,
        };
    }

    @action closeModal() {
        this.assetModal.open = false;
    }

    @action setModalInputValue(value: string) {
        this.assetModal.inputValue = value;
    }

    hasValidInput(): boolean {
        if (this.activeInputKey) {
            return (
                this.amounts[this.activeInputKey].validation ===
                    ValidationStatus.VALID ||
                this.amounts[this.activeInputKey].validation ===
                    ValidationStatus.INSUFFICIENT_BALANCE
            );
        } else {
            return false;
        }
    }

    @action refreshWeights(token: string) {
        let hasWeightExceededTotal = false;

        const validationStatus =
            bnum(this.weights[token].value).gte(bnum(2)) &&
            bnum(this.weights[token].value).lte(bnum(98))
                ? ValidationStatus.VALID
                : ValidationStatus.BAD_WEIGHT;

        this.weights[token].validation = validationStatus;
        const totalWeight = this.tokens.reduce((totalWeight, token) => {
            const weight = this.getWeightInput(token);
            return totalWeight.plus(weight.value);
        }, new BigNumber(0));
        if (totalWeight.gte(bnum(100))) {
            hasWeightExceededTotal = true;
        }
        this.hasWeightExceededTotal = hasWeightExceededTotal;
    }

    @action refreshAmounts(token: string, account: string) {
        const { contractMetadataStore, marketStore } = this.rootStore;

        let hasInputExceedUserBalance = false;

        const amount = bnum(this.amounts[token].value);
        const tokenMetadata = contractMetadataStore.getTokenMetadata(token);
        const tokenValue = marketStore.getValue(tokenMetadata.ticker, amount);
        const totalValue = tokenValue.div(this.weights[token].value);

        for (const token of this.tokens) {
            const tokenMetadata = contractMetadataStore.getTokenMetadata(token);
            const value = totalValue.times(this.weights[token].value);
            const price = marketStore.getValue(tokenMetadata.ticker, bnum(1));
            const amount = value.div(price);
            const inputValue = amount.isNaN() ? '' : amount.toString();

            let hasInputExceedUserBalance = false;

            const validationStatus = this.getInputValidationStatus(
                token,
                account,
                amount
            );

            if (token !== this.activeInputKey) {
                this.amounts[token].value = inputValue;
            }
            this.amounts[token].validation = validationStatus;

            if (validationStatus === ValidationStatus.INSUFFICIENT_BALANCE) {
                hasInputExceedUserBalance = true;
            }
        }

        this.hasInputExceedUserBalance = hasInputExceedUserBalance;
    }

    private getInputValidationStatus(
        tokenAddress: string,
        account: string | undefined,
        inputAmount: BigNumber
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

        let status = validateTokenValue(inputAmount.toString());

        if (status === ValidationStatus.VALID) {
            status = inputAmount.lte(accountBalance)
                ? ValidationStatus.VALID
                : ValidationStatus.INSUFFICIENT_BALANCE;
        }

        return status;
    }

    getWeightInput(tokenAddress): Input {
        return this.weights[tokenAddress];
    }

    getAmountInput(tokenAddress): Input {
        return this.amounts[tokenAddress];
    }

    getCheckbox(tokenAddress: string): Checkbox {
        if (!this.checkboxes[tokenAddress]) {
            throw new Error(
                `No checkbox found for tokenAddress ${tokenAddress}`
            );
        }
        return this.checkboxes[tokenAddress];
    }

    getRelativeWeight(tokenAddress): BigNumber {
        const totalWeight = this.tokens.reduce((totalWeight, token) => {
            const weight = this.getWeightInput(token);
            return totalWeight.plus(weight.value);
        }, new BigNumber(0));
        const weight = this.getWeightInput(tokenAddress);
        const weightNumber = new BigNumber(weight.value);
        return weightNumber.div(totalWeight);
    }

    private setDefaults() {
        const { contractMetadataStore } = this.rootStore;
        const tokenMetadata = contractMetadataStore.getWhitelistedTokenMetadata();
        const daiToken = tokenMetadata.find(token => token.symbol === 'DAI');
        this.addToken(daiToken.address);
        this.setTokenWeight(daiToken.address, '30');
        const usdcToken = tokenMetadata.find(token => token.symbol === 'USDC');
        this.addToken(usdcToken.address);
        this.setTokenWeight(usdcToken.address, '20');
        this.setFee('0.15');
    }

    private initializeTokenInputs(tokenAddress: string) {
        this.weights[tokenAddress] = {
            value: '',
            touched: false,
            validation: ValidationStatus.EMPTY,
        };
        this.amounts[tokenAddress] = {
            value: '',
            touched: false,
            validation: ValidationStatus.EMPTY,
        };
    }

    private initializeCheckbox(tokenAddress: string) {
        this.checkboxes[tokenAddress] = {
            checked: false,
            touched: false,
        };
    }
}
