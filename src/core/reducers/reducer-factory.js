import constants from 'core/types'

const initialState = {
    knownPools: {},
    poolsLoaded: false,
    pendingRequest: false,
    requestError: null
}

export function factoryReducer(state = initialState, action) {
    switch (action.type) {
        case constants.GET_KNOWN_POOLS_REQUEST: {
            return Object.assign({}, state, {
                pendingRequest: true,
                requestError: null
            })
        }

        case constants.GET_KNOWN_POOLS_SUCCESS: {
            return Object.assign({}, state, {
                knownPools: action.result.poolData,
                poolsLoaded: true,
                pendingRequest: false,
                requestError: null
            })
        }

        case constants.GET_KNOWN_POOLS_FAILURE: {
            return Object.assign({}, state, {
                pendingRequest: false,
                requestError: action.result.error
            })
        }

        default:
            return state
    }
}
