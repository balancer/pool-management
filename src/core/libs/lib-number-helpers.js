import Web3 from 'web3'

const { BN } = Web3.utils
export const TEN16 = new BN('10000000000000000')

export function toEther(value) {
  return Web3.utils.fromWei(value)
}

export function toWei(value) {
  return Web3.utils.toWei(value, 'ether')
}

export function fromWeiToFee(value) {
  const etherValue = Web3.utils.fromWei(value)
  console.log(etherValue * 100)
  return etherValue * 100
}

// export function fromEtherToFee(value) {
//   const weiValue = new BN(Web3.utils.toWei(value, 'ether'))
//   const percentValue = weiValue.div(new BN(100))
//   return percentValue.toString()
// }

// export function fromFeeToEther(value) {
//   const weiValue = new BN(value)
//   const percentValue = weiValue.div(new BN('1'))
//   console.log(value, weiValue.toString(), percentValue.toString())
//   return percentValue.toString()
// }

export const MAX_UINT = Web3.utils.toTwosComplement('-1')
