import constants from 'core/types'

const initialState = {
  pools: {}
}

export function poolParamsReducer(state = initialState, action) {
  switch (action.type) {
    case constants.GET_POOL_FEE: {
      const result = Object.assign({}, state)
      if (!result.pools[action.result.contractAddress]) {
        result.pools[action.result.contractAddress] = {}
      }

      result.pools[action.result.contractAddress].fee = action.result.fee

      return Object.assign({}, state, {
        fee: action.result.fee
      })
    }

    case constants.GET_POOL_TOKEN_PARAMS: {
      const result = Object.assign({}, state)
      if (!result.pools[action.result.contractAddress]) {
        result.pools[action.result.contractAddress] = {}
      }

      result.pools[action.result.contractAddress].tokenParams = action.result.tokenData
      result.pools[action.result.contractAddress].hasTokenParams = action.result.hasTokenData
      return result
    }

    default:
      return state
  }
}
