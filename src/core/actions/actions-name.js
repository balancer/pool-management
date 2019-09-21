import constants   from 'core/types'
import contract    from 'truffle-contract'
import AmazingDapp from 'contracts/AmazingDapp.json'

export function checkIfNameExists(name) {
  return (dispatch, getState) => {
    const { web3Provider } = getState().provider
    const AmazingDappContract = contract(AmazingDapp)

    AmazingDappContract.setProvider(web3Provider.currentProvider)
    AmazingDappContract.defaults({ from: web3Provider.eth.defaultAccount })

    return new Promise((resolve, reject) => {
      AmazingDappContract.deployed().then((ad) => {
        return ad.checkIfExists(name)
      }).then((result) => {
        resolve(result)
      })
    })
    .then((result) => {
      dispatch((() => {
        return {
          type: constants.CHECK_IF_NAME_EXISTS,
          result
        }
      })())
    })
    .catch((error) =>{
      console.log('error: ', error)
    })

  }
}
