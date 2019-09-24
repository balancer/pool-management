import { combineReducers } from 'redux'
import uiReducer from 'core/reducers/reducer-ui'
import { providerReducer } from 'core/reducers/reducer-provider'
import { poolParamsReducer } from 'core/reducers/reducer-pool-params'
import { factoryReducer } from 'core/reducers/reducer-factory'
import { tokenReducer } from 'core/reducers/reducer-token'

const rootReducer = combineReducers({
  ui: uiReducer,
  provider: providerReducer,
  pool: poolParamsReducer,
  factory: factoryReducer,
  token: tokenReducer
})

export default rootReducer
