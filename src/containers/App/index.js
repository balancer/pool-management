import React, { Component } from 'react'
import {
  HashRouter,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'

import { theme } from 'configs'
import { PoolSwapView, PoolManageView, PoolInvestView, PoolListView, PoolCreatorView, LogView } from 'containers'
import { Header, Footer, Notification } from './components'
import ErrorHandler, { Error } from '../../provider'
import './styles.scss' // global styles

class App extends Component {
  NotificationComponent = () => {
    return (
      <Error.Consumer>
        {
          ({ error, setError }) => {
            return (<Notification
              errorMessage={error}
              setError={setError}
            />)
          }
        }
      </Error.Consumer>
    )
  }

  render() {
    return (
      <ErrorHandler>
        <MuiThemeProvider theme={theme}>
          <HashRouter>
            <div>
              <Header />
              <Footer />
              <Route component={this.NotificationComponent} />
              <div className="app-shell">
                <Switch>
                  <Route path="/swap/:address" component={PoolSwapView} />
                  <Route path="/invest/:address" component={PoolInvestView} />
                  <Route path="/manage/:address" component={PoolManageView} />
                  <Route path="/logs/:address" component={LogView} />
                  <Route path="/list" component={PoolListView} />
                  <Route path="/new" component={PoolCreatorView} />
                  <Redirect from="/" to="/list" />
                </Switch>
              </div>
            </div>
          </HashRouter>
        </MuiThemeProvider>
      </ErrorHandler>
    )
  }
}

export default App
