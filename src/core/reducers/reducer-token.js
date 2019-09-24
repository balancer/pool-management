import constants from 'core/types'

// account -> token balances
const initialState = {
    balances: {},
    pendingRequest: false,
    requestError: null
}

export function factoryReducer(state = initialState, action) {
    switch (action.type) {
        case constants.GET_USER_BALANCE_REQUEST: {
            return Object.assign({}, state, {
                pendingRequest: true,
                requestError: null
            })
        }

        case constants.GET_USER_BALANCE_SUCCESS: {
            return Object.assign({}, state, {
                balances: action.result.balances,
                balanceLoaded: true,
                pendingRequest: false,
                requestError: null
            })
        }

        case constants.GET_USER_BALANCE_FAILURE: {
            return Object.assign({}, state, {
                pendingRequest: false,
                requestError: action.result.error
            })
        }

        default:
            return state
    }
}
