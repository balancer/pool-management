import constants from 'core/types'

const initialState = {
  pools: {}
}

export function poolParamsReducer(state = initialState, action) {
  switch (action.type) {
    case constants.GET_POOL_PARAMS: {
      const result = Object.assign({}, state)
      if (!result.pools[action.result.contractAddress]) {
        result.pools[action.result.contractAddress] = {}
      }

      result.pools[action.result.contractAddress].hasParams = action.result.hasParams
      result.pools[action.result.contractAddress].fee = action.result.fee
      result.pools[action.result.contractAddress].manager = action.result.manager
      result.pools[action.result.contractAddress].numTokens = action.result.numTokens
      result.pools[action.result.contractAddress].isPaused = action.result.isPaused

      return result
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
