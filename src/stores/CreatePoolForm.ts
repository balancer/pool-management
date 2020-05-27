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
    @observable balances: InputMap;
    @observable fee: Input;
    @observable assetModal = {
        open: false,
        inputValue: '',
        activeTokenIndex: 0,
    };
    @observable hasInputExceedUserBalance: boolean;

    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.tokens = [];
        this.checkboxes = {} as CheckboxMap;
        this.weights = {} as InputMap;
        this.balances = {} as InputMap;
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

    @action setTokenBalance(tokenAddress: string, balance: string) {
        this.balances[tokenAddress].value = balance;
    }

    @action setToken(token: string) {
        const tokenIndex = this.assetModal.activeTokenIndex;
        this.tokens[tokenIndex] = token;
        this.initializeTokenInputs(token);
        this.initializeCheckbox(token);
    }

    @action setFee(fee: string) {
        this.fee.value = fee;
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
                this.balances[this.activeInputKey].validation ===
                    ValidationStatus.VALID ||
                this.balances[this.activeInputKey].validation ===
                    ValidationStatus.INSUFFICIENT_BALANCE
            );
        } else {
            return false;
        }
    }

    @action refreshInputAmounts(token: string, account: string) {
        let hasInputExceedUserBalance = false;

        const validationStatus = this.getInputValidationStatus(
            token,
            account,
            bnum(this.balances[token].value)
        );

        this.balances[token].validation = validationStatus;

        if (validationStatus === ValidationStatus.INSUFFICIENT_BALANCE) {
            hasInputExceedUserBalance = true;
        }

        this.hasInputExceedUserBalance = hasInputExceedUserBalance;
    }

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

    getWeightInput(tokenAddress): Input {
        return this.weights[tokenAddress];
    }

    getBalanceInput(tokenAddress): Input {
        return this.balances[tokenAddress];
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
        this.balances[tokenAddress] = {
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
