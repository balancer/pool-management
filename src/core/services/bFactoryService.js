/* eslint-disable no-restricted-syntax */
import Web3 from 'web3'
import { schema } from './schemaService'

const LOG_NEW_POOL_EVENT = 'LOG_NEW_POOL'

async function getFactoryInstance(provider, contractAddress) {
    const { web3Provider } = provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const bFactory = new web3.eth.Contract(schema.BFactory.abi, contractAddress, { from: defaultAccount })
    return bFactory
}

export async function getKnownPools(provider, factoryAddress, filter) {
    const bFactory = await getFactoryInstance(provider, factoryAddress)

    const events = await bFactory.getPastEvents(LOG_NEW_POOL_EVENT, filter)

    const poolData = {}

    // Decode the data field of all LOG_CALL
    for (const event of events) {
        poolData[event.returnValues.pool] = { manager: event.returnValues.caller }
    }

    const result = {
        result: 'success',
        knownPools: poolData
    }

    return result
}

export async function deployPool(provider, factoryAddress) {
    const bFactory = await getFactoryInstance(provider, factoryAddress)
    await bFactory.methods.newBPool().send()
}
