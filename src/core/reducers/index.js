import { combineReducers } from 'redux'
import uiReducer           from 'core/reducers/reducer-ui'
import { providerReducer } from 'core/reducers/reducer-provider'
import { nameReducer }     from 'core/reducers/reducer-name'

const rootReducer = combineReducers({
  ui: uiReducer,
  provider: providerReducer,
  name: nameReducer
})

export default rootReducer
