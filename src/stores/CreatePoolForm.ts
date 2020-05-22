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
        this.tokens = [
            '0x1528F3FCc26d13F7079325Fb78D9442607781c8C',
            '0x2F375e94FC336Cdec2Dc0cCB5277FE59CBf1cAe5',
        ];
        this.checkboxes = {} as CheckboxMap;
        this.weights = {} as InputMap;
        this.balances = {} as InputMap;
        this.initializeCheckboxes(this.tokens);
        this.initializeInputs(this.tokens);
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

    private initializeInputs(tokenAddresses: string[]) {
        tokenAddresses.forEach(tokenAddress => {
            this.initializeTokenInputs(tokenAddress);
        });
        this.fee = {
            value: '',
            touched: false,
            validation: ValidationStatus.EMPTY,
        };
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

    private initializeCheckboxes(tokenAddresses: string[]) {
        tokenAddresses.forEach(tokenAddress => {
            this.initializeCheckbox(tokenAddress);
        });
    }

    private initializeCheckbox(tokenAddress: string) {
        this.checkboxes[tokenAddress] = {
            checked: false,
            touched: false,
        };
    }
}
