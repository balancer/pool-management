import { observable, action } from 'mobx'

export const formNames = {
    INPUT_FORM: 'inputs'
}

export const methodNames = {
    JOIN_POOL: 'joinPool',
    JOINSWAP_EXTERN_AMOUNT_IN: 'joinswap_ExternAmountIn',
    JOINSWAP_POOL_AMOUNT_OUT: 'joinswap_PoolAmountOut',
    EXIT_POOL: 'exitPool',
    EXITSWAP_POOL_AMOUNT_IN: 'exitswap_PoolAmountIn',
    EXITSWAP_EXTERN_AMOUNT_OUT: 'exitswap_ExternAmountOut'
}

export const labels = {
    methods: {
        JOIN_POOL: 'Join Pool',
        JOINSWAP_EXTERN_AMOUNT_IN: 'Join Swap',
        JOINSWAP_POOL_AMOUNT_OUT: 'Join Swap Pool',
        EXIT_POOL: 'Exit Pool',
        EXITSWAP_POOL_AMOUNT_IN: 'Exit Swap Pool',
        EXITSWAP_EXTERN_AMOUNT_OUT: 'Exit Swap'
    },
    inputs: {
        INPUT_TOKEN: 'Input Token',
        OUTPUT_TOKEN: 'Token to receive',
        POOL_INPUT_AMOUNT: 'Pool tokens to redeem',
        POOL_OUTPUT_AMOUNT: 'Pool tokens to receive',
        TOKEN_INPUT_AMOUNT: 'Input Amount',
        TOKEN_OUTPUT_AMOUNT: 'Output Amount'
    }
}

export default class ManageFormStore {
    @observable investMethod = methodNames.JOIN_POOL
    @observable inputs = {
        inputToken: '',
        outputToken: '',
        inputAmount: '',
        outputAmount: '',
        poolInputAmount: '',
        poolOutputAmount: '',
    }

    @action setInvestMethod(newInvestMethod) {
        const oldInvestMethod = this.investMethod
        if (oldInvestMethod !== newInvestMethod) {
            this.investMethod = newInvestMethod

            // Reset form fields when changing swap method
            this.resetInputs()
        }
    }

    resetInputs() {
        this.inputs = {
            inputToken: '',
            outputToken: '',
            inputAmount: '',
            outputAmount: '',
            poolInputAmount: '',
            poolOutputAmount: '',
        }
    }

    constructor(rootStore) {
        this.rootStore = rootStore;
    }
}