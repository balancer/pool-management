import React, { Component } from 'react'
import {
  HashRouter,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'

import { theme } from 'configs'
import { PoolSwapView, PoolManageView, PoolInvestView, PoolListView, PoolLogsListView, MyPoolsView, LogView } from 'containers'
import { Header, Footer, Notification } from './components'
import './styles.scss' // global styles

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
                <Route path="/invest/:address" component={PoolInvestView} />
                <Route path="/manage/:address" component={PoolManageView} />
                <Route path="/logs/:address" component={LogView} />
                <Route path="/list" component={PoolListView} />
                <Route path="/my-pools" component={MyPoolsView} />
                <Route path="/logs-list" component={PoolLogsListView} />
                <Redirect from="/" to="/logs-list" />
              </Switch>
            </div>
          </div>
        </HashRouter>
      </MuiThemeProvider>
    )
  }
}

export default App
