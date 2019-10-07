/* eslint-disable no-prototype-builtins */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import Web3 from 'web3'
import abiDecoder from 'abi-decoder'
import { schema } from './schemaService'
import * as web3Lib from '../libs/lib-web3-helpers'
import { appConfig } from '../../configs'

const bindSig = '0xe4e1e53800000000000000000000000000000000000000000000000000000000'
const setParamsSig = '0x7ff1055200000000000000000000000000000000000000000000000000000000'

async function getBPoolInstance(provider, contractAddress) {
    const { web3Provider } = provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const bPool = new web3.eth.Contract(schema.BPool.abi, contractAddress, { from: defaultAccount })
    return bPool
}

export async function getTokenInstance(provider, contractAddress) {
    const { web3Provider } = provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const tokenContract = new web3.eth.Contract(schema.TestToken.abi, contractAddress, { from: defaultAccount })
    return tokenContract
}

export async function getParams(provider, contractAddress) {
    const bPool = await getBPoolInstance(provider, contractAddress)

    const manager = await bPool.methods.getController().call()
    const fees = await bPool.methods.getFees().call()
    const numTokens = await bPool.methods.getNumTokens().call()
    const isPaused = await bPool.methods.isPaused().call()

    console.log(fees)

    const result = {
        swapFee: fees['0'],
        exitFee: fees['1'],
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

    abiDecoder.addABI(schema.BPool.abi)

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

    abiDecoder.addABI(schema.BPool.abi)

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

        const token = web3Lib.toChecksum(decodedData.params[0].value)
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

        const token = web3Lib.toChecksum(decodedData.params[0].value)
        const balance = decodedData.params[1].value.toString()
        const weight = decodedData.params[2].value.toString()

        // console.log(decodedData)

        tokenData[token] = {
            balance, weight
        }
    }

    // Update token data with actual balances
    const balances = []
    const symbols = []
    for (const key of Object.keys(tokenData)) {
        const tokenContract = new web3.eth.Contract(schema.TestToken.abi, key, { from: defaultAccount })
        balances.push(tokenContract.methods.balanceOf(contractAddress).call())
        balances.push(tokenContract.methods.balanceOf(defaultAccount).call())
        symbols.push(tokenContract.methods.symbol().call())
    }

    const resolvedBalances = await Promise.all(balances)
    const resolvedSymbols = await Promise.all(symbols)

    Object.keys(tokenData).forEach((key) => {
        tokenData[key].balance = resolvedBalances.shift()
        tokenData[key].userBalance = resolvedBalances.shift()
        tokenData[key].symbol = resolvedSymbols.shift()
    })

    console.log('getParams', tokenData)

    return {
        result: 'success',
        data: tokenData
    }
}

// Get all the tokens in this pool, PLUS all the whitelisted tokens the user has balances of
export async function getAllWhitelistedTokenParams(provider, contractAddress) {
    const { web3Provider } = provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const tokenWhitelist = appConfig.allCoins
    const tokenParams = await getTokenParams(provider, contractAddress)
    const paramData = tokenParams.data
    const tokenData = {}

    console.log('whitelist', tokenWhitelist)

    // Add whitelisted tokens which aren't in pool to our data set
    for (const token of tokenWhitelist) {
        if (!paramData[token]) {
            console.log('token doesnt exist', token)
            tokenData[token] = {}
            const tokenContract = new web3.eth.Contract(schema.TestToken.abi, token, { from: defaultAccount })
            tokenData[token].userBalance = await tokenContract.methods.balanceOf(defaultAccount).call()
            tokenData[token].symbol = await tokenContract.methods.symbol().call()
            tokenData[token].balance = '0'
            tokenData[token].weight = '0'
        } else {
            console.log('token exists', token)
            tokenData[token] = paramData[token]
        }
    }

    console.log('result', tokenData)

    return {
        result: 'success',
        data: tokenData
    }
}

export async function bindToken(provider, contractAddress, token) {
    const bPool = await getBPoolInstance(provider, contractAddress)

    try {
        const bindTx = await bPool.methods.bind(token).send()

        const result = {
            contractAddress,
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

    try {
        // You can make multiple calls in here and dispatch each individually
        const bindTx = await bPool.methods.setParams(token, balance, weight).send()

        // Dispatch Success
        return {
            result: 'success',
            data: {
                contractAddress,
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

export async function setFees(provider, contractAddress, swapFee, exitFee) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    try {
        await bPool.methods.setFees(swapFee, exitFee).send()

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

export async function makePublic(provider, contractAddress, initialSupply) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    await bPool.methods.makePublic(initialSupply).send()
    try {
        await bPool.methods.makePublic(1).send()

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
    try {
        await bPool.methods.swap_ExactAmountIn(Ti, Ai, To, Lo, LP).send()
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

/**
 *
 * @param {providerObject} provider
 * @param {address} contractAddress
 * @param {address} Ti -- input token
 * @param {address} To -- output token
 * @param {uint} Li -- limit in
 * @param {uint} Ao -- output amount
 * @param {uint} PL -- price limit
 */
export async function swapExactAmountOut(provider, contractAddress, Ti, Li, To, Ao, PL) {
    const bPool = await getBPoolInstance(provider, contractAddress)

    try {
        await bPool.methods.swap_ExactAmountOut(Ti, Li, To, Ao, PL).send()
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

/**
 *
 * @param {provider} provider
 * @param {address} contractAddress
 * @param {address} Ti -- input token
 * @param {uint} Li -- in limit
 * @param {address} To -- output token
 * @param {uint} Lo -- out limit
 * @param {uint} MP -- marginal price
 */
export async function swapExactMarginalPrice(provider, contractAddress, Ti, Li, To, Lo, MP) {
    const bPool = await getBPoolInstance(provider, contractAddress)

    try {
        await bPool.methods.swap_ExactMarginalPrice(Ti, Li, To, Lo, MP).send()
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

/**
 * joinPool(uint poolAo)
 * @param {providerObject} provider
 * @param {address} contractAddress
 * @param {uint} poolAo -- pool amount output
 */
export async function joinPool(provider, contractAddress, poolAo) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    try {
        await bPool.methods.joinPool(poolAo).send()
        return {
            result: 'success'
        }
    } catch (error) {
        return {
            result: 'failure',
            data: { error }
        }
    }
}

/**
 * joinswap_ExternAmountIn(address Ti, uint256 tAi)
 * @param {providerObject} provider
 * @param {address} contractAddress
 * @param {address} tokenInput -- token input
 * @param {uint256} tokenAmountIn -- token amount input
 */
export async function joinswapExternAmountIn(provider, contractAddress, tokenInput, tokenAmountIn) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    try {
        await bPool.methods.joinswap_ExternAmountIn(tokenInput, tokenAmountIn).send()
        return {
            result: 'success'
        }
    } catch (error) {
        return {
            result: 'failure',
            data: { error }
        }
    }
}

/**
 * joinswap_PoolAmountOut(uint pAo, address Ti)
 * @param {providerObject} provider
 * @param {address} contractAddress
 * @param {uint} poolAo -- pool amout output
* @param {address} tokenInput -- token input
 */
export async function joinswapPoolAmountOut(provider, contractAddress, poolAo, tokenInput) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    try {
        await bPool.methods.joinswap_PoolAmountOut(poolAo, tokenInput).send()
        return {
            result: 'success'
        }
    } catch (error) {
        return {
            result: 'failure',
            data: { error }
        }
    }
}

/**
 * exitPool(uint poolAi)
 * @param {providerObject} provider
 * @param {address} contractAddress
 * @param {uint} poolAi -- pool amount input
 */
export async function exitPool(provider, contractAddress, poolAi) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    try {
        await bPool.methods.exitPool(poolAi).send()
        return {
            result: 'success'
        }
    } catch (error) {
        return {
            result: 'failure',
            data: { error }
        }
    }
}

/**
 * exitswap_PoolAmountIn(uint pAi, address To)
 * @param {provider} provider
 * @param {address} contractAddress
 * @param {address} tokenOutput -- token output
 * @param {uint} poolAi -- pool amount input
 */
export async function exitswapPoolAmountIn(provider, contractAddress, poolAi, tokenOutput) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    try {
        await bPool.methods.exitswap_PoolAmountIn(poolAi, tokenOutput).send()
        return {
            result: 'success'
        }
    } catch (error) {
        return {
            result: 'failure',
            data: { error }
        }
    }
}

/**
 * exitswap_ExternAmountOut(address To, uint tAo)
 * @param {provider} provider
 * @param {address} contractAddress
 * @param {address} tokenOutput -- token output
 * @param {uint} tokenAo -- token amount output
 */
export async function exitswapExternAmountOut(provider, contractAddress, tokenOutput, tokenAo) {
    const bPool = await getBPoolInstance(provider, contractAddress)
    try {
        await bPool.methods.exitswap_ExternAmountOut(tokenOutput, tokenAo).send()
        return {
            result: 'success'
        }
    } catch (error) {
        return {
            result: 'failure',
            data: { error }
        }
    }
}

export async function PreviewSwapExactAmountIn(provider, contractAddress, Ti, Ai, To, Lo, LP) {
  const bPool = await getBPoolInstance(provider, contractAddress)
  try {
      const preview = await bPool.methods.swap_ExactAmountIn(Ti, Ai, To, Lo, LP).call()
      return {
          result: 'success',
          preview
      }
  } catch (e) {
      return {
          result: 'failure',
          data: { error: e }
      }
  }
}

/**
*
* @param {providerObject} provider
* @param {address} contractAddress
* @param {uint} Ao -- output amount
*/
export async function PreviewSwapExactAmountOut(provider, contractAddress, Ti, Li, To, Ao, PL) {
  const bPool = await getBPoolInstance(provider, contractAddress)

  try {
      const preview = await bPool.methods.swap_ExactAmountOut(Ti, Li, To, Ao, PL).call()
      return {
          result: 'success',
          preview
      }
  } catch (e) {
      return {
          result: 'failure',
          data: { error: e }
      }
  }
}

/**
*
* @param {provider} provider
* @param {address} contractAddress
* @param {address} Ti -- input token
* @param {uint} Li -- in limit
* @param {address} To -- output token
* @param {uint} Lo -- out limit
* @param {uint} MP -- marginal price
*/
export async function PreviewSwapExactMarginalPrice(provider, contractAddress, Ti, Li, To, Lo, MP) {
  const bPool = await getBPoolInstance(provider, contractAddress)

  try {
      const preview = await bPool.methods.swap_ExactMarginalPrice(Ti, Li, To, Lo, MP).call()
      return {
          result: 'success',
          preview
      }
  } catch (e) {
      return {
          result: 'failure',
          data: { error: e }
      }
  }
}
