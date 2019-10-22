import { observable, action, computed } from 'mobx'
import * as deployed from "../deployed";
import * as blockchain from "../utils/blockchain"

export default class UtilStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    generateTokenDropdownData(tokenList) {
        const { tokenStore } = this.rootStore

        let tokenData = []
        for (let token of tokenList) {
            tokenData.push({
                value: token,
                label: tokenStore.symbols[token]
            })
        }

        return tokenData
    }
}