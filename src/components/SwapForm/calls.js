import { bPoolService } from 'core/services'
import { web3Lib } from 'core/libs'

export const swapExactAmountIn = async (data, error) => {
  const {
    provider, address, inputAmount, outputLimit, inputToken, outputToken, limitPrice, updateTokenParams
  } = data

  const call = await bPoolService.swapExactAmountIn(
    provider,
    address,
    inputToken,
    web3Lib.toWei(inputAmount),
    outputToken,
    web3Lib.toWei(outputLimit),
    web3Lib.toWei(limitPrice)
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}

export const swapExactAmountOut = async (data, error) => {
  const {
    provider, address, outputAmount, inLimit, inputToken, outputToken, limitPrice, updateTokenParams
  } = data
  const call = await bPoolService.swapExactAmountOut(
    provider,
    address,
    inputToken,
    web3Lib.toWei(inLimit),
    outputToken,
    web3Lib.toWei(outputAmount),
    web3Lib.toWei(limitPrice)
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}


export const swapExactMarginalPrice = async (data, error) => {
  const {
    provider, address, outLimit, inLimit, inputToken, outputToken, marginalPrice, updateTokenParams
  } = data
  const call = await bPoolService.swapExactMarginalPrice(
    provider,
    address,
    inputToken,
    web3Lib.toWei(inLimit),
    outputToken,
    web3Lib.toWei(outLimit),
    web3Lib.toWei(marginalPrice)
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}

