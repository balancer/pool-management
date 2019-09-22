import constants from 'core/types'

const initialState = {
  fee: null
}

export function poolParamsReducer(state = initialState, action) {
  switch (action.type) {
    case constants.GET_POOL_FEE:
      return Object.assign({}, state, {
        fee: action.result.fee
      })

    default:
      return state
  }
}
