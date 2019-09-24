import constants from 'core/types'

const initialState = {
  pool: {
    address: '',
    poolParams: {},
    tokenParams: {},
    pendingTx: false,
    txError: null,
    loadedParams: false,
    loadedTokenParams: false
  }
}

export function poolParamsReducer(state = initialState, action) {
  switch (action.type) {
    case constants.GET_POOL_PARAMS: {
      const { pool } = state
      return Object.assign({}, state, {
        ...state,
        pool: {
          ...pool,
          loadedParams: true,
          address: action.result.contractAddress,
          poolParams: {
            fee: action.result.fee,
            manager: action.result.manager,
            numTokens: action.result.numTokens,
            isPaused: action.result.isPaused
          }
        }
      })
    }

    case constants.GET_POOL_TOKEN_PARAMS: {
      const { pool } = state
      return Object.assign({}, state, {
        ...state,
        pool: {
          ...pool,
          address: action.result.contractAddress,
          loadedTokenParams: true,
          tokenParams: action.result.tokenData
        }
      })
    }

    case constants.BIND_TOKEN_REQUEST: {
      const { pool } = state
      return Object.assign({}, state, {
        ...state,
        pool: {
          ...pool,
          pendingTx: true,
          txError: null
        }
      })
    }

    case constants.BIND_TOKEN_SUCCESS: {
      const { pool } = state
      return Object.assign({}, state, {
        ...state,
        pool: {
          ...pool,
          pendingTx: false,
          txError: null
        }
      })
    }

    case constants.BIND_TOKEN_FAILURE: {
      const { pool } = state
      return Object.assign({}, state, {
        ...state,
        pool: {
          ...pool,
          pendingTx: false,
          txError: action.result.error
        }
      })
    }

    case constants.SET_TOKEN_PARAMS_REQUEST: {
      const { pool } = state
      return Object.assign({}, state, {
        ...state,
        pool: {
          ...pool,
          pendingTx: true,
          txError: null
        }
      })
    }

    case constants.SET_TOKEN_PARAMS_SUCCESS: {
      const { pool } = state
      return Object.assign({}, state, {
        ...state,
        pool: {
          ...pool,
          pendingTx: false,
          txError: null
        }
      })
    }

    case constants.SET_TOKEN_PARAMS_FAILURE: {
      const { pool } = state
      return Object.assign({}, state, {
        ...state,
        pool: {
          ...pool,
          pendingTx: false,
          txError: action.result.error
        }
      })
    }

    default:
      return state
  }
}
