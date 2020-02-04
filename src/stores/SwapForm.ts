import { observable, action } from 'mobx';
import { RootStore } from './Root';

export const formNames = {
    INPUT_FORM: 'inputs',
};

export const methodNames = {
    EXACT_AMOUNT_IN: 'exactAmountIn',
    EXACT_AMOUNT_OUT: 'exactAmountOut',
};

export const labels = {
    methods: {
        EXACT_AMOUNT_IN: 'Exact Amount In',
        EXACT_AMOUNT_OUT: 'Exact Amount Out',
    },
    inputs: {
        INPUT_TOKEN: 'Input Token',
        OUTPUT_TOKEN: 'Output Token',
        INPUT_AMOUNT: 'Input Amount',
        OUTPUT_AMOUNT: 'Output Amount',
        OUTPUT_LIMIT: 'Minimum Output Amount',
        INPUT_LIMIT: 'Maximum Input Amount',
        LIMIT_PRICE: 'Maximum Price',
        MARGINAL_PRICE: 'Marginal Price',
    },
    outputs: {
        INPUT_AMOUNT: 'Input Amount',
        OUTPUT_AMOUNT: 'Output Amount',
        EFFECTIVE_PRICE: 'Effective Price',
        MARGINAL_PRICE: 'Marginal Price',
    },
};

export default class ManageFormStore {
    @observable swapMethod = methodNames.EXACT_AMOUNT_IN;
    @observable inputs = {
        inputToken: '',
        outputtoken: '',
        inputAmount: '',
        outputAmount: '',
        outputLimit: '',
        inputLimit: '',
        limitPrice: '',
        marginalPrice: '',
    };
    @observable outputs = {
        inputAmount: '',
        outputAmount: '',
        effectivePrice: '',
        marginalPrice: '',
        validSwap: false,
    };
    rootStore: RootStore;

    @action updateOutputsFromObject(output) {
        this.outputs = {
            ...this.outputs,
            ...output,
        };
    }

    @action setSwapMethod(newSwapMethod) {
        const oldSwapMethod = this.swapMethod;

        if (oldSwapMethod !== newSwapMethod) {
            this.swapMethod = newSwapMethod;

            // Reset form fields when changing swap method
            this.resetInputs();
            this.resetOutputs();
        }
    }

    resetInputs() {
        this.inputs = {
            ...this.inputs,
            inputAmount: '',
            outputAmount: '',
            outputLimit: '',
            inputLimit: '',
            limitPrice: '',
            marginalPrice: '',
        };
    }

    resetOutputs() {
        this.outputs = {
            inputAmount: '',
            outputAmount: '',
            effectivePrice: '',
            marginalPrice: '',
            validSwap: false,
        };
    }

    constructor(rootStore) {
        this.rootStore = rootStore;
    }
}
