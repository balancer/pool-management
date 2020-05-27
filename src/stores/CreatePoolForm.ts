import { observable, action } from 'mobx';
import RootStore from 'stores/Root';
import { Checkbox, CheckboxMap, Input, InputMap } from '../types';
import { ValidationStatus } from './actions/validators';
import { BigNumber } from 'utils/bignumber';

export default class CreatePoolFormStore {
    @observable tokens: string[];
    @observable checkboxes: CheckboxMap;
    @observable weights: InputMap;
    @observable balances: InputMap;
    @observable fee: Input;
    @observable assetModal = {
        open: false,
        inputValue: '',
        activeTokenIndex: 0,
    };
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
        this.setTokenBalance(daiToken.address, '15');
        const usdcToken = tokenMetadata.find(token => token.symbol === 'USDC');
        this.addToken(usdcToken.address);
        this.setTokenWeight(usdcToken.address, '20');
        this.setTokenBalance(usdcToken.address, '10');
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
