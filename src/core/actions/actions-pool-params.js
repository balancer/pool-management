/* eslint-disable no-restricted-syntax */
import constants from 'core/types'
import Web3 from 'web3'
import abiDecoder from 'abi-decoder'

import BPool from '../../../balancer-core/out/BPool_meta.json'
import TestToken from '../../../external-contracts/TestToken.json'

export function getParams(contractAddress) {
  return async (dispatch, getState) => {
    const { web3Provider } = getState().provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const bPool = new web3.eth.Contract(BPool.output.abi, contractAddress, { from: defaultAccount })
    // You can make multiple calls in here and dispatch each individually
    const manager = await bPool.methods.getManager().call()
    const fee = await bPool.methods.getFee().call()
    const numTokens = await bPool.methods.getNumTokens().call()
    const isPaused = await bPool.methods.isPaused().call()
    const hasParams = true

    const result = {
      contractAddress,
      fee,
      manager,
      numTokens,
      isPaused,
      hasParams
    }
    dispatch((() => {
      return {
        type: constants.GET_POOL_PARAMS,
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

export function bindToken(contractAddress, token, balance, weight) {
  return async (dispatch, getState) => {
    const { web3Provider } = getState().provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    // Dispatch Start
    dispatch((() => {
      return {
        result: contractAddress,
        type: constants.BIND_TOKEN_REQUEST
      }
    })())

    try {
      const bPool = new web3.eth.Contract(
        BPool.output.abi,
        contractAddress,
        {
          from: defaultAccount
        })
      const tokenContract = new web3.eth.Contract(TestToken.abi, token, { from: defaultAccount })
      // You can make multiple calls in here and dispatch each individually
      const approveTx = await tokenContract.methods.approve(contractAddress, balance).send()
      const bindTx = bPool.methods.bind(token, balance, weight).send()

      const result = {
        contractAddress,
        approveTx,
        bindTx
      }

      // Dispatch Success
      dispatch((() => {
        return {
          type: constants.BIND_TOKEN_SUCCESS,
          result
        }
      })())

      dispatch(getTokenBalances(contractAddress))
    } catch (e) {
      // Dispatch Failure
      dispatch((() => {
        return {
          result: contractAddress,
          type: constants.BIND_TOKEN_FAILURE,
          error: e
        }
      })())
    }
  }
}

export function setTokenParams(contractAddress, token, balance, weight) {
  return async (dispatch, getState) => {
    const { web3Provider } = getState().provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    // Dispatch Start
    dispatch((() => {
      return {
        result: contractAddress,
        type: constants.SET_TOKEN_PARAMS_REQUEST
      }
    })())

    try {
      const bPool = new web3.eth.Contract(
        BPool.output.abi,
        contractAddress,
        {
          from: defaultAccount
        })
      const tokenContract = new web3.eth.Contract(TestToken.abi, token, { from: defaultAccount })
      // You can make multiple calls in here and dispatch each individually
      const approveTx = await tokenContract.methods.approve(contractAddress, balance).send()
      const bindTx = bPool.methods.setParams(token, balance, weight).send()

      const result = {
        contractAddress,
        approveTx,
        bindTx
      }

      // Dispatch Success
      dispatch((() => {
        return {
          type: constants.SET_TOKEN_PARAMS_SUCCESS,
          result
        }
      })())

      dispatch(getTokenBalances(contractAddress))
    } catch (e) {
      // Dispatch Failure
      dispatch((() => {
        return {
          result: contractAddress,
          type: constants.SET_TOKEN_PARAMS_FAILURE,
          error: e
        }
      })())
    }
  }
}

