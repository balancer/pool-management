/* eslint-disable no-restricted-syntax */
import constants from 'core/types'
import Web3 from 'web3'
import abiDecoder from 'abi-decoder'

import BFactory from '../../../balancer-core/out/BFactory_meta.json'

export function getKnownPools(factoryAddress) {
    return async (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const web3 = new Web3(web3Provider)
        const { defaultAccount } = web3Provider.eth

        const bFactory = new web3.eth.Contract(BFactory.output.abi, factoryAddress, { from: defaultAccount })

        // Dispatch Start
        dispatch((() => {
            return {
                type: constants.GET_KNOWN_POOLS_REQUEST
            }
        })())

        try {
            // Get a list of successful token binds by checking the calls. We'll assume the code is correct
            // TODO: Sanity check - Make sure that failed tx don't create a log
            const eventName = 'LOG_NEW_POOL'
            const events = await bFactory.getPastEvents(eventName, {
                fromBlock: 0,
                toBlock: 'latest'
            })

            const poolData = {}

            // Decode the data field of all LOG_CALL
            for (const event of events) {
                console.log(event)
                poolData[event.returnValues.pool] = { manager: event.returnValues.caller }
            }

            // const hasTokenData = (Object.keys(tokenData).length > 0)

            const result = {
                factoryAddress,
                poolData
            }

            dispatch((() => {
                return {
                    type: constants.GET_KNOWN_POOLS_SUCCESS,
                    result
                }
            })())
        } catch (e) {
            dispatch((() => {
                return {
                    type: constants.GET_KNOWN_POOLS_FAILURE,
                    result: { error: e }
                }
            })())
        }
    }
}
