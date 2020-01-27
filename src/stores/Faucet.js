import { action } from 'mobx'
import * as deployed from "../deployed";
import * as blockchain from "utils/blockchain"

export default class FaucetStore {

    @action drip = async (tokenAddress) => {
        const faucet = blockchain.loadObject('Faucet', deployed['kovan'].faucet, 'Faucet')

        try {
            await faucet.methods.drip(tokenAddress).send()

        } catch (e) {
            console.log(e)
        }
    }

}