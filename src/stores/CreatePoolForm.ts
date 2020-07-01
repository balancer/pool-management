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
    @observable confirmation: Checkbox;
    @observable assetModal = {
        open: false,
        inputValue: '',
        activeTokenIndex: 0,
    };
    @observable validationStatus: ValidationStatus;

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
        this.confirmation = {
            checked: false,
            touched: false,
        };
        this.validationStatus = ValidationStatus.EMPTY;
        this.setDefaults();
    }

    @action addToken(token: string) {
        this.tokens.push(token);
        this.initializeTokenInputs(token);
        this.initializeCheckbox(token);
        this.validate();
    }

    @action removeToken(tokenAddress: string) {
        const tokenIndex = this.tokens.findIndex(
            token => token === tokenAddress
        );
        this.tokens.splice(tokenIndex, 1);
        this.validate();
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
        this.validate();
    }

    @action setFee(fee: string) {
        this.fee.value = fee;
        const validationStatus =
            bnum(this.fee.value).gte(bnum(0.0001)) &&
            bnum(this.fee.value).lte(bnum(10))
                ? ValidationStatus.VALID
                : ValidationStatus.BAD_FEE;
        this.fee.validation = validationStatus;
        this.validate();
    }

    @action toggleConfirmation() {
        const checked = !this.confirmation.checked;
        this.confirmation = {
            checked,
            touched: true,
        };
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

    @action refreshWeights(token: string) {
        const validationStatus =
            bnum(this.weights[token].value).gte(bnum(2)) &&
            bnum(this.weights[token].value).lte(bnum(98))
                ? ValidationStatus.VALID
                : ValidationStatus.BAD_WEIGHT;
        this.weights[token].validation = validationStatus;
        this.validate();
    }

    @action refreshAmounts(token: string, account: string) {
        const { contractMetadataStore, marketStore } = this.rootStore;

        const amount = bnum(this.amounts[token].value);
        const tokenMetadata = contractMetadataStore.getTokenMetadata(token);

        if (!marketStore.hasAssetPrice(tokenMetadata.ticker)) {
            const validationStatus = this.getInputValidationStatus(
                token,
                account,
                amount
            );

            this.amounts[token].validation = validationStatus;
            this.validate();
            return;
        }

        const tokenValue = marketStore.getValue(tokenMetadata.ticker, amount);
        const totalValue = tokenValue.div(this.weights[token].value);

        for (const token of this.tokens) {
            const tokenMetadata = contractMetadataStore.getTokenMetadata(token);
            const value = totalValue.times(this.weights[token].value);
            const price = marketStore.hasAssetPrice(tokenMetadata.ticker)
                ? marketStore.getAssetPrice(tokenMetadata.ticker)
                : bnum(0);
            const amount = value.div(price);
            const inputValue = amount.isNaN() ? '' : amount.toString();

            const validationStatus = this.getInputValidationStatus(
                token,
                account,
                amount
            );

            if (price.gt(0)) {
                this.amounts[token].validation = validationStatus;
                if (token !== this.activeInputKey) {
                    this.amounts[token].value = inputValue;
                }
            }
        }
        this.validate();
    }

    private validate() {
        // We want these checks to be in specific order
        // so that validation message shows the error of the highest priority
        this.validationStatus = ValidationStatus.VALID;
        // fee
        const feeInput = this.fee;
        if (feeInput.validation !== ValidationStatus.VALID) {
            this.validationStatus = feeInput.validation;
        }
        // amount
        for (const token of this.tokens) {
            const amountInput = this.getAmountInput(token);
            if (amountInput.validation !== ValidationStatus.VALID) {
                this.validationStatus = amountInput.validation;
            }
        }
        // total weight
        const totalWeight = this.tokens.reduce((totalWeight, token) => {
            const weightInput = this.getWeightInput(token);
            return totalWeight.plus(weightInput.value);
        }, new BigNumber(0));
        if (totalWeight.gt(bnum(100))) {
            this.validationStatus = ValidationStatus.BAD_WEIGHT;
        }
        // weight
        for (const token of this.tokens) {
            const weightInput = this.getWeightInput(token);
            if (weightInput.validation !== ValidationStatus.VALID) {
                this.validationStatus = weightInput.validation;
            }
        }
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

        const denormalizedBalance = tokenStore.denormalizeBalance(
            inputAmount,
            tokenAddress
        );

        const accountBalance = tokenStore.getBalance(tokenAddress, account);

        let status = validateTokenValue(inputAmount.toString());

        if (status === ValidationStatus.VALID) {
            if (accountBalance.lt(denormalizedBalance)) {
                status = ValidationStatus.INSUFFICIENT_BALANCE;
            } else if (denormalizedBalance.lt(bnum('1000000'))) {
                status = ValidationStatus.MINIMUM_BALANCE;
            } else {
                status = ValidationStatus.VALID;
            }
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

    hasValidInput(): boolean {
        return this.validationStatus === ValidationStatus.VALID;
    }

    private setDefaults() {
        const { contractMetadataStore } = this.rootStore;
        const tokenMetadata = contractMetadataStore.getWhitelistedTokenMetadata();
        const daiToken = tokenMetadata.find(token => token.symbol === 'DAI');
        this.addToken(daiToken.address);
        this.setTokenWeight(daiToken.address, '30');
        this.refreshWeights(daiToken.address);
        const usdcToken = tokenMetadata.find(token => token.symbol === 'USDC');
        this.addToken(usdcToken.address);
        this.setTokenWeight(usdcToken.address, '20');
        this.refreshWeights(usdcToken.address);
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
