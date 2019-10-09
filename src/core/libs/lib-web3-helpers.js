import Web3 from 'web3'

const { BN } = Web3.utils
export const TEN16 = new BN('10000000000000000')

export function toEther(value) {
  return Web3.utils.fromWei(value)
}

export function toWei(value) {
  return Web3.utils.toWei(value, 'ether')
}

export function toAddressStub(address) {
  const start = address.slice(0, 5)
  const end = address.slice(-3)

  return `${start}...${end}`
}

export function roundValue(value) {
  const decimal = value.indexOf('.')
  if (decimal === -1) {
    return value
  }
  return value.slice(0, decimal + 5)
}

export function hexToNumberString(value) {
  return Web3.utils.hexToNumberString(value)
}

export function fromFeeToPercentage(value) {
  const etherValue = Web3.utils.fromWei(value)
  const percentageValue = etherValue * 100
  console.log('fee read', etherValue, percentageValue)
  return percentageValue
}

export function fromPercentageToFee(value) {
  const weiValue = new BN(Web3.utils.toWei(value, 'ether'))
  const feeValue = weiValue.div(new BN(100))
  console.log('fee inputted', weiValue.toString(), feeValue.toString())
  return feeValue.toString()
}

export function toChecksum(address) {
  return Web3.utils.toChecksumAddress(address)
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
