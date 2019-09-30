import React, { Component } from 'react'
import { MuiThemeProvider } from '@material-ui/core/styles'
import {
  HashRouter,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'
import theme from 'configs/theme/config-theme'
import LogView from 'containers/LogView'
import PoolSwapView from 'containers/PoolSwapView'
import PoolManageView from 'containers/PoolManageView'
import PoolListView from 'containers/PoolListView'
import PoolLogsListView from 'containers/PoolLogsListView'
import Header from './components/Header'
import Footer from './components/Footer'
import Notification from './components/Notification'

import './styles.scss' // global styles
import MyPoolsView from '../MyPoolsView'

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <HashRouter>
          <div>
            <Header />
            <Footer />
            <Notification />
            <div className="app-shell">
              <Switch>
                <Route path="/swap/:address" component={PoolSwapView} />
                <Route path="/manage/:address" component={PoolManageView} />
                <Route path="/logs/:address" component={LogView} />
                <Route path="/list" component={PoolListView} />
                <Route path="/my-pools" component={MyPoolsView} />
                <Route path="/logs-list" component={PoolLogsListView} />
                <Redirect from="/" to="/list" />
              </Switch>
            </div>
          </div>
        </HashRouter>
      </MuiThemeProvider>
    )
  }
}

export default App
