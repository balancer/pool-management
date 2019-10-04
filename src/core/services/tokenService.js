import { numberLib } from 'core/libs'
import { getTokenInstance } from './bPoolService'

export async function approve(provider, contractAddress, token) {
  const tokenIn = await getTokenInstance(provider, token)
  try {
    await tokenIn.methods.approve(contractAddress, numberLib.MAX_UINT).send()
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

export async function balanceOf(provider, address, token) {
  const tokenIn = await getTokenInstance(provider, token)
  try {
    const balance = await tokenIn.methods.balanceOf(address).send()
    return {
      result: 'success',
      balance
    }
  } catch (e) {
    return {
      result: 'failure',
      data: { error: e }
    }
  }
}

export async function allowance(provider, address, token) {
  const tokenIn = await getTokenInstance(provider, token)
  const { defaultAccount } = provider.web3Provider.eth
  try {
    const allowanceAmount = await tokenIn.methods.allowance(address, defaultAccount)
    const isApproved = allowanceAmount > (numberLib.MAX_UINT / 2)
    return {
      result: 'success',
      isApproved
    }
  } catch (e) {
    return {
      result: 'failure',
      data: { error: e }
    }
  }
}
