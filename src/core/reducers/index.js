import { combineReducers } from 'redux'
import uiReducer from 'core/reducers/reducer-ui'
import { providerReducer } from 'core/reducers/reducer-provider'
import { poolParamsReducer } from 'core/reducers/reducer-pool-params'

const rootReducer = combineReducers({
  ui: uiReducer,
  provider: providerReducer,
  pool: poolParamsReducer
})

export default rootReducer
