import { action } from 'mobx';
import * as deployed from 'deployed.json';
import * as blockchain from 'utils/blockchain';
import { RootStore } from './Root';

export default class FaucetStore {
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action drip = async tokenAddress => {
        const faucet = blockchain.loadObject(
            'Faucet',
            deployed['kovan'].faucet,
            'Faucet'
        );

        try {
            await faucet.methods.drip(tokenAddress).send();
        } catch (e) {
            console.log(e);
        }
    };
}
