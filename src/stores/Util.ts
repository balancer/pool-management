import { RootStore } from './Root';

export default class UtilStore {
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    generateAllTokenDropdownData(tokenList) {
        let tokenData = [];
        for (let token of tokenList) {
            tokenData.push({
                value: token.address,
                label: token.symbol,
            });
        }

        return tokenData;
    }

    generateTokenDropdownData(tokenList) {
        const { tokenStore } = this.rootStore;

        let tokenData = [];
        for (let token of tokenList) {
            tokenData.push({
                value: token,
                label: tokenStore.symbols[token],
            });
        }

        return tokenData;
    }
}
