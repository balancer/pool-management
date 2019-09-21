import React, { Component }         from 'react'
import PropTypes                    from 'prop-types'
import { MuiThemeProvider }         from '@material-ui/core/styles'
import { connect }                  from 'react-redux'
import { bindActionCreators }       from 'redux'
import * as providerActionCreators  from 'core/actions/actions-provider'
import {
  HashRouter,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'
import theme                        from 'configs/theme/config-theme'
import HomeView                     from 'containers/HomeView'
import Header                       from './components/Header'
import Footer                       from './components/Footer'

import './styles.scss' // global styles

class App extends Component {
  componentDidMount() {
    const { actions } = this.props
    actions.provider.setProvider()
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <HashRouter>
          <div>
            <Header />
            <Footer />
            <div className="app-shell">
              <Switch>
                <Route path="/home" component={HomeView} />
                <Redirect from="/" to="/home" />
              </Switch>
            </div>
          </div>
        </HashRouter>
      </MuiThemeProvider>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      provider: bindActionCreators(providerActionCreators, dispatch)
    }
  }
}

App.propTypes = {
  actions: PropTypes.shape({}).isRequired
}

export default connect(null, mapDispatchToProps)(App)
