import { observable } from 'mobx'

export const formNames = {
    BIND_TOKEN_FORM: 'bindTokenForm',
    SET_TOKEN_PARAMS_FORM: 'setTokenParamsForm',
    SET_FEE_FORM: 'setFeeForm',
    MAKE_SHARED_FORM: 'makeSharedForm'
}

export default class ManageFormStore {
    @observable bindTokenForm = {
        address: '',
        balance: 0,
        weight: 0
    }
    @observable setTokenParamsForm = {
        address: '',
        balance: 0,
        weight: 0
    }
    @observable setFeeForm = {
        swapFee: ''
    }
    @observable makeSharedForm = {
        initialSupply: ''
    }

    constructor(rootStore) {
        this.rootStore = rootStore;
    }
}