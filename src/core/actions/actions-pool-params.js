import constants from 'core/types'
import Web3 from 'web3'
import BPool from '../../../balancer-core/out/BPool_meta.json'

export function getFee(address) {
  return async (dispatch, getState) => {
    const { web3Provider } = getState().provider
    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const bPool = new web3.eth.Contract(BPool.output.abi, address, { from: defaultAccount })

    const fee = await bPool.methods.getBalance(address).call()
    const result = {
      fee
    }
    dispatch((() => {
      return {
        type: constants.GET_POOL_FEE,
        result
      }
    })())
  }
}
