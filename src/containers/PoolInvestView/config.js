export const formConfig = {
  joinPool: {
    actionLabel: 'Join Pool',
    inputs: [
      {
        label: 'Pool tokens to receive',
        type: 'number'
      }
    ]
  },
  joinswap_ExternAmountIn: {
    actionLabel: 'Join Swap',
    inputs: [
      {
        label: 'Token Address',
        type: 'select',
        options: [
          { address: 'Token Address1' },
          { address: 'Token Address2' },
          { address: 'Token Address3' }
        ]
      },
      {
        label: 'Tokens to invest',
        type: 'number'
      }
    ]
  },
  joinswap_PoolAmountOut: {
    actionLabel: 'Join Swap Pool',
    inputs: [
      {
        label: 'Token Address',
        type: 'select',
        options: [
          { address: 'Token Address1' },
          { address: 'Token Address2' },
          { address: 'Token Address3' }
        ]
      },
      {
        label: 'Token to receive',
        type: 'number'
      }
    ]
  },
  exitPool: {
    actionLabel: 'Exit Pool',
    inputs: [
      {
        label: 'Pool tokens to redeem',
        type: 'number'
      }
    ]
  },
  exitswap_PoolAmountIn: {
    actionLabel: 'Exit Swap Pool',
    inputs: [
      {
        label: 'Token to receive',
        type: 'select',
        options: [
          { address: 'Token Address1' },
          { address: 'Token Address2' },
          { address: 'Token Address3' }
        ]
      },
      {
        label: 'Pool tokens to redeem',
        type: 'number'
      }
    ]
  },
  exitswap_ExternAmountOut: {
    actionLabel: 'Exit Swap',
    inputs: [
      {
        label: 'Token to receive',
        type: 'select',
        options: [
          { address: 'Token Address1' },
          { address: 'Token Address2' },
          { address: 'Token Address3' }
        ]
      },
      {
        label: 'Number of tokens',
        type: 'number'
      }
    ]
  }
}
// invest
// joinPool
// Pool tokens to receive (number input)
//
// joinswap_ExternAmountIn
// Token address (token address dropdown)
// Tokens to invest (number input)
//
// joinswap_PoolAmountOut
// Token address (token address dropdown)
// Pool tokens to receive (number input)
// /// redemn
// exitPool
// Pool tokens to redeem (number input)
//
// exitswap_PoolAmountIn
// Pool tokens to redeem (number input)
// Token to receive (token address dropdown)
//
// exitswap_ExternAmountOut
// Token to receive (token address dropdown)
// Number of tokens (number input)
