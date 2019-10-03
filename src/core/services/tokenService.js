import { getTokenInstance } from './bPoolService'
import numberLib from '../libs'

export async function approve(provider, contractAddress, token) {
  const tokenIn = await getTokenInstance(provider, token)
  try {
    await tokenIn.methods.approve(contractAddress, numberLib.MAX_UINT()).send()
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
