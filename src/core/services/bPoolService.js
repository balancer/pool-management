/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import Web3 from 'web3'
import abiDecoder from 'abi-decoder'

import CombinedSchema from '../../../external-contracts/combined'
import TestToken from '../../../external-contracts/TestToken.json'

const BPoolAbi = JSON.parse(CombinedSchema.contracts['sol/BPool.sol:BPool'].abi)
const bindSig = '0xe4e1e53800000000000000000000000000000000000000000000000000000000'
const setParamsSig = '0x7ff1055200000000000000000000000000000000000000000000000000000000'

async function getBPoolInstance(provider, contractAddress) {
    const { web3Provider } = provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const bPool = new web3.eth.Contract(BPoolAbi, contractAddress, { from: defaultAccount })
    return bPool
}

export async function getTokenInstance(provider, contractAddress) {
    const { web3Provider } = provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const tokenContract = new web3.eth.Contract(TestToken.abi, contractAddress, { from: defaultAccount })
    return tokenContract
}

export async function getParams(provider, contractAddress) {
    const bPool = await getBPoolInstance(provider, contractAddress)

    const manager = await bPool.methods.getManager().call()
    const fee = await bPool.methods.getFee().call()
    const numTokens = await bPool.methods.getNumTokens().call()
    const isPaused = await bPool.methods.isPaused().call()

    const result = {
        fee,
        manager,
        numTokens,
        isPaused
    }
    return {
        result: 'success',
        data: result

    }
}

export async function getSpotPrice(provider, contractAddress, Ti, To) {
    const bPool = await getBPoolInstance(provider, contractAddress)

    const spotPrice = await bPool.methods.getSpotPrice(Ti, To).call()

    return {
        result: 'success',
        data: spotPrice
    }
}

export async function getCallLogs(provider, contractAddress) {
    const bPool = await getBPoolInstance(provider, contractAddress)

    abiDecoder.addABI(BPoolAbi)

    const eventName = 'LOG_CALL'
    const events = await bPool.getPastEvents(eventName, {
        fromBlock: 0,
        toBlock: 'latest'
    })

    const logData = []

    // Decode Events
    for (const event of events) {
        const decodedData = abiDecoder.decodeMethod(event.returnValues.data)

        console.log(event)
        console.log(decodedData)
        const { caller } = event.returnValues
        const rawSig = event.returnValues.sig
        const rawData = event.returnValues.data
        const decodedSig = decodedData.name
        const decodedValues = []

        for (const param of decodedData.params) {
            decodedValues.push(param.value)
        }

        logData.push({
            caller,
            rawSig,
            rawData,
            decodedValues,
            decodedSig
        })
    }

    console.log(logData)

    return {
        result: 'success',
        data: logData
    }
}

export async function getTokenParams(provider, contractAddress) {
    const { web3Provider } = provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth
    const bPool = await getBPoolInstance(provider, contractAddress)

    abiDecoder.addABI(BPoolAbi)

    // Get a list of successful token binds by checking the calls. We'll assume the code is correct
    // TODO: Sanity check - Make sure that failed tx don't create a log
    const eventName = 'LOG_CALL'
    const bindEvents = await bPool.getPastEvents(eventName, {
        filter: { sig: bindSig },
        fromBlock: 0,
        toBlock: 'latest'
    })

    const setParamsEvents = await bPool.getPastEvents(eventName, {
        filter: { sig: setParamsSig },
        fromBlock: 0,
        toBlock: 'latest'
    })

    const tokenData = {}

    // Add all tokens from Binds
    for (const event of bindEvents) {
        const decodedData = abiDecoder.decodeMethod(event.returnValues.data)
        console.log(decodedData.params)

        const token = decodedData.params[0].value
        const balance = decodedData.params[1].value.toString()
        const weight = decodedData.params[2].value.toString()

        // console.log(decodedData)

        tokenData[token] = {
            balance, weight
        }
    }

    // Update from setParams
    for (const event of setParamsEvents) {
        const decodedData = abiDecoder.decodeMethod(event.returnValues.data)

        const token = decodedData.params[0].value
        const balance = decodedData.params[1].value.toString()
        const weight = decodedData.params[2].value.toString()

        // console.log(decodedData)

        tokenData[token] = {
            balance, weight
        }
    }

    // Update token data with actual balances
    const balances = []
    for (const key of Object.keys(tokenData)) {
      const tokenContract = new web3.eth.Contract(TestToken.abi, key, { from: defaultAccount })
      balances.push(tokenContract.methods.balanceOf(contractAddress).call())
      balances.push(tokenContract.methods.balanceOf(defaultAccount).call())
    }

    const resolvedBalances = await Promise.all(balances)

    Object.keys(tokenData).forEach((key) => {
      tokenData[key].balance = resolvedBalances.shift()
      tokenData[key].userBalance = resolvedBalances.shift()
    })

    return {
        result: 'success',
        data: tokenData
    }
}

export async function bindToken(provider, contractAddress, token, balance, weight) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    const tokenContract = await getTokenInstance(provider, token)

    try {
        const approveTx = await tokenContract.methods.approve(contractAddress, balance).send()
        const bindTx = await bPool.methods.bind(token, balance, weight).send()

        const result = {
            contractAddress,
            approveTx,
            bindTx
        }

        return {
            result: 'success',
            data: result
        }
    } catch (e) {
        // Dispatch Failure
        return {
            result: 'failure',
            error: e
        }
    }
}

export async function setTokenParams(provider, contractAddress, token, balance, weight) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    const tokenContract = await getTokenInstance(provider, token)

    try {
        // You can make multiple calls in here and dispatch each individually
        const approveTx = await tokenContract.methods.approve(contractAddress, balance).send()
        const bindTx = await bPool.methods.setParams(token, balance, weight).send()

        // Dispatch Success
        return {
            result: 'success',
            data: {
                contractAddress,
                approveTx,
                bindTx
            }
        }
    } catch (e) {
        // Dispatch Failure
        return {
            result: 'failure',
            data: { contractAddress, error: e }
        }
    }
}

export async function setFee(provider, contractAddress, amount) {
  const bPool = await getBPoolInstance(provider, contractAddress)
  try {
    await bPool.methods.setFee(amount).send()

    return {
      result: 'success'
    }
  } catch (e) {
    return {
      result: 'failure',
      data: { error: e }
    }
  }
}

export async function swapExactAmountIn(provider, contractAddress, Ti, Ai, To, Lo, LP) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    const tokenIn = await getTokenInstance(provider, Ti)

    try {
        await tokenIn.methods.approve(contractAddress, Ai).send()
        await bPool.methods.swap_ExactAmountIn(Ti, Ai, To, Lo, LP).send()

        // Dispatch Success
        return {
            result: 'success'
        }
    } catch (e) {
        // Dispatch Failure
        return {
            result: 'failure',
            data: { error: e }
        }
    }
}
