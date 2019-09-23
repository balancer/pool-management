/* eslint-disable no-restricted-syntax */
import constants from 'core/types'
import Web3 from 'web3'
import abiDecoder from 'abi-decoder'

import BPool from '../../../balancer-core/out/BPool_meta.json'

export function getFee(contractAddress) {
  return async (dispatch, getState) => {
    const { web3Provider } = getState().provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const bPool = new web3.eth.Contract(BPool.output.abi, contractAddress, { from: defaultAccount })
    // You can make multiple calls in here and dispatch each individually
    const fee = await bPool.methods.getFee().call()
    const result = {
      contractAddress,
      fee
    }
    dispatch((() => {
      return {
        type: constants.GET_POOL_FEE,
        result
      }
    })())
  }
}

export function getTokenBalances(contractAddress) {
  return async (dispatch, getState) => {
    const { web3Provider } = getState().provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const bPool = new web3.eth.Contract(BPool.output.abi, contractAddress, { from: defaultAccount })

    abiDecoder.addABI(BPool.output.abi)

    // Get a list of successful token binds by checking the calls. We'll assume the code is correct
    // TODO: Sanity check - Make sure that failed tx don't create a log
    const eventName = 'LOG_CALL'
    const events = await bPool.getPastEvents(eventName, {
      fromBlock: 0,
      toBlock: 'latest'
    })

    const tokenData = {}

    // Decode the data field of all LOG_CALL
    for (const event of events) {
      const decodedData = abiDecoder.decodeMethod(event.returnValues.data)

      // If this is the right type of event signature
      // Get the token, balance, weight, etc...
      if (decodedData.name === 'bind' || decodedData.name === 'setParams') {
        const token = decodedData.params[0].value
        const balance = decodedData.params[1].value
        const weight = decodedData.params[2].value

        // TODO: Ensure all possible operations SET values rather than modify them
        // TODO: Run through all events IN ORDER, from first to last, overriding as you go
        tokenData[token] = {
          balance, weight
        }
      }
    }

    const hasTokenData = (Object.keys(tokenData).length > 0)

    const result = {
      contractAddress,
      hasTokenData,
      tokenData
    }

    dispatch((() => {
      return {
        type: constants.GET_POOL_TOKEN_PARAMS,
        result
      }
    })())
  }
}
