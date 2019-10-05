import { bPoolService } from 'core/services'
import { numberLib } from 'core/libs'

export const joinPool = async (data, error) => {
  const {
    provider, address, tokenAmount, updateTokenParams
  } = data

  const call = await bPoolService.joinPool(
    provider,
    address,
    numberLib.toWei(tokenAmount)
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}

export const joinswapExternAmountIn = async (data, error) => {
  const {
    provider, address, tokenAddress, tokenAmount, updateTokenParams
  } = data

  const call = await bPoolService.joinswapExternAmountIn(
    provider,
    address,
    tokenAddress,
    numberLib.toWei(tokenAmount)
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}

export const joinswapPoolAmountOut = async (data, error) => {
  const {
    provider, address, tokenAddress, tokenAmount, updateTokenParams
  } = data

  const call = await bPoolService.joinswapPoolAmountOut(
    provider,
    address,
    numberLib.toWei(tokenAmount),
    tokenAddress
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}

export const exitPool = async (data, error) => {
  const {
    provider, address, tokenAmount, updateTokenParams
  } = data

  const call = await bPoolService.exitPool(
    provider,
    address,
    numberLib.toWei(tokenAmount)
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}

export const exitswapPoolAmountIn = async (data, error) => {
  const {
    provider, address, tokenAmount, tokenAddress, updateTokenParams
  } = data

  const call = await bPoolService.exitswapPoolAmountIn(
    provider,
    address,
    numberLib.toWei(tokenAmount),
    tokenAddress
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}

export const exitswapExternAmountOut = async (data, error) => {
  const {
    provider, address, tokenAmount, tokenAddress, updateTokenParams
  } = data

  const call = await bPoolService.exitswapExternAmountOut(
    provider,
    address,
    tokenAddress,
    tokenAmount
  )

  if (call.result === 'failure') {
    error(call.data.error.message)
  } else {
    updateTokenParams()
  }
}
