/* eslint-disable no-restricted-syntax */
import Web3 from 'web3'

import BFactory from '../../../balancer-core/out/BFactory_meta.json'

export async function getKnownPools(provider, factoryAddress, filter) {
    const { web3Provider } = provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const bFactory = new web3.eth.Contract(BFactory.output.abi, factoryAddress, { from: defaultAccount })

    // Get a list of successful token binds by checking the calls. We'll assume the code is correct
    // TODO: Sanity check - Make sure that failed tx don't create a log
    const eventName = 'LOG_NEW_POOL'
    const events = await bFactory.getPastEvents(eventName, filter)

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
