import constants from 'core/types'

const initialState = {
  nameAlreadyExists: false
}

export function nameReducer(state = initialState, action) {
  switch (action.type) {

  case constants.CHECK_IF_NAME_EXISTS:
    return Object.assign({}, state, {
      nameAlreadyExists: action.result
    })

  default:
    return state
  }

}
