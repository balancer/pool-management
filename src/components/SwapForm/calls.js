import * as bPoolService from 'core/services/bPoolService'
import * as numberLib from 'core/libs/lib-number-helpers'

export const swapExactAmountIn = async (data) => {
    const {
      provider, address, inputAmount, outputLimit, inputToken, outputToken, limitPrice, updateTokenParams
    } = data

    await bPoolService.swapExactAmountIn(
      provider,
      address,
      inputToken,
      numberLib.toWei(inputAmount),
      outputToken,
      numberLib.toWei(outputLimit),
      numberLib.toWei(limitPrice)
    )

    updateTokenParams()
}

export const swapExactAmountOut = async (data) => {
  const {
    provider, address, outputAmount, outputLimit, inputToken, outputToken, limitPrice, updateTokenParams
  } = data

  console.log('we need to implement swap exact amount out contract method')
  // await bPoolService.swapExactAmountOut(
  //   provider,
  //   address,
  //   inputToken,
  //   numberLib.toWei(outputAmount),
  //   outputToken,
  //   numberLib.toWei(outputLimit),
  //   numberLib.toWei(limitPrice)
  // )

  // updateTokenParams()
}


export const swapExactMarginalPrice = async (data) => {
  const {
    provider, address, outLimit, inLimit, inputToken, outputToken, marginalPrice, updateTokenParams
  } = data

  console.log('we need to implement swap exact marginal price contract method')
  // await bPoolService.swapExactMarginalPrice(
  //   provider,
  //   address,
  //   inputToken,
  //   numberLib.toWei(outputAmount),
  //   outputToken,
  //   numberLib.toWei(outputLimit),
  //   numberLib.toWei(limitPrice)
  // )

  // updateTokenParams()
}

export const swapThreeLimitMaximize = async (data) => {
  const {
    provider, address, outLimit, inLimit, inputToken, outputToken, limitPrice, updateTokenParams
  } = data

  console.log('we need to implement swap three limit maximize contract method')
  // await bPoolService.swapThreeLimitMaximize(
  //   provider,
  //   address,
  //   inputToken,
  //   numberLib.toWei(outputAmount),
  //   outputToken,
  //   numberLib.toWei(outputLimit),
  //   numberLib.toWei(limitPrice)
  // )

  // updateTokenParams()
}

