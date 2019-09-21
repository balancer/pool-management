import constants from 'core/types'
import Web3      from 'web3'

export function setProvider() {
  return (dispatch) => {
    if (window.ethereum) {
      const { ethereum } = window
      const web3Provider = new Web3(ethereum)

      ethereum.enable().then((account) => {
        const defaultAccount = account[0]
        web3Provider.eth.defaultAccount = defaultAccount

        dispatch((() => {
          return {
            type: constants.SET_PROVIDER,
            web3Provider
          }
        })())
      })
    }
  }
}
