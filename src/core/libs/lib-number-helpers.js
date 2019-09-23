import Web3 from 'web3'

export function toEther(value) {
  return Web3.utils.fromWei(value)
}
