import { bPoolService } from 'core/services'
import { numberLib } from 'core/libs'

export const swapExactAmountIn = async (data, error) => {
    const {
      provider, address, inputAmount, outputLimit, inputToken, outputToken, limitPrice, updateTokenParams
    } = data

    const call = await bPoolService.swapExactAmountIn(
      provider,
      address,
      inputToken,
      numberLib.toWei(inputAmount),
      outputToken,
      numberLib.toWei(outputLimit),
      numberLib.toWei(limitPrice)
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
    numberLib.toWei(inLimit),
    outputToken,
    numberLib.toWei(outputAmount),
    numberLib.toWei(limitPrice)
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
    numberLib.toWei(inLimit),
    outputToken,
    numberLib.toWei(outLimit),
    numberLib.toWei(marginalPrice)
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}

