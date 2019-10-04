import { bPoolService } from 'core/services'
import { numberLib } from 'core/libs'

export const joinPool = async (data) => {
    const {
      provider, address, tokenAmount
    } = data

    await bPoolService.joinPool(
      provider,
      address,
      numberLib.toWei(tokenAmount)
    )
    // updateTokenParams()
}

export const joinswapExternAmountIn = async (data) => {
  const {
    provider, address, tokenAddress, tokenAmount
  } = data

  await bPoolService.joinswapExternAmountIn(
    provider,
    address,
    tokenAddress,
    numberLib.toWei(tokenAmount)
  )

  // updateTokenParams()
}

export const joinswapPoolAmountOut = async (data) => {
  const {
    provider, address, tokenAddress, tokenAmount
  } = data

  await bPoolService.joinswapPoolAmountOut(
    provider,
    address,
    numberLib.toWei(tokenAmount),
    tokenAddress
  )

  // updateTokenParams()
}

export const exitPool = async (data) => {
  const {
    provider, address, tokenAmount
  } = data

  await bPoolService.exitPool(
    provider,
    address,
    numberLib.toWei(tokenAmount)
  )

  // updateTokenParams()
}

export const exitswapPoolAmountIn = async (data) => {
  const {
    provider, address, tokenAmount, tokenAddress
  } = data

  await bPoolService.exitswapPoolAmountIn(
    provider,
    address,
    numberLib.toWei(tokenAmount),
    tokenAddress
  )

  // updateTokenParams()
}

export const exitswapExternAmountOut = async (data) => {
  const {
    provider, address, tokenAmount, tokenAddress
  } = data

  await bPoolService.exitswapExternAmountOut(
    provider,
    address,
    tokenAddress,
    tokenAmount
  )

  // updateTokenParams()
}
