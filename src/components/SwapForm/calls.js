import { bPoolService } from 'core/services'
import { numberLib } from 'core/libs'

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
    provider, address, outputAmount, inLimit, inputToken, outputToken, limitPrice, updateTokenParams
  } = data
  await bPoolService.swapExactAmountOut(
    provider,
    address,
    inputToken,
    numberLib.toWei(inLimit),
    outputToken,
    numberLib.toWei(outputAmount),
    numberLib.toWei(limitPrice)
  )

  updateTokenParams()
}


export const swapExactMarginalPrice = async (data) => {
  const {
    provider, address, outLimit, inLimit, inputToken, outputToken, marginalPrice, updateTokenParams
  } = data
  await bPoolService.swapExactMarginalPrice(
    provider,
    address,
    inputToken,
    numberLib.toWei(inLimit),
    outputToken,
    numberLib.toWei(outLimit),
    numberLib.toWei(marginalPrice)
  )

  updateTokenParams()
}

