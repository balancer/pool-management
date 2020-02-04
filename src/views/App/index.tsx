import React, { Component } from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';

import { theme } from 'configs';
import { Notification } from './components';
import Header from 'components/Header';
import PoolListView from 'views/PoolListView';
import PoolCreatorView from 'views/PoolCreator';
import PoolManageView from 'views/PoolManageView';
import PoolSwapView from 'views/PoolSwapView';
import PoolInvestView from 'views/PoolInvestView';
import LogView from 'views/LogView';
import ErrorHandler, { Error } from 'provider';
import './styles.scss'; // global styles
import { Container } from '@material-ui/core';

@inject('root')
@observer
class App extends Component<any, any> {
    // componentDidUpdate = prevProps => {
    //   if (this.props.location.pathname !== prevProps.location.pathname) {
    //     window.scrollTo(0, 0);
    //   }
    // }

    async componentDidMount() {
        const { providerStore, poolStore } = this.props.root;
        if (!providerStore.provider) {
            await providerStore.setWeb3WebClient();
        }

        await poolStore.fetchKnownPools();
    }

    NotificationComponent = () => {
        return (
            <Error.Consumer>
                {({ error, setError }) => {
                    return (
                        <Notification
                            errorMessage={error}
                            setError={setError}
                        />
                    );
                }}
            </Error.Consumer>
        );
    };

    renderViews() {
        return (
            <Container>
                <div className="app-shell">
                    <Switch>
                        <Route path="/swap/:address" component={PoolSwapView} />
                        <Route
                            path="/invest/:address"
                            component={PoolInvestView}
                        />
                        <Route
                            path="/manage/:address"
                            component={PoolManageView}
                        />
                        <Route path="/logs/:address" component={LogView} />
                        <Route path="/list" component={PoolListView} />
                        <Route path="/new" component={PoolCreatorView} />
                        <Redirect from="/" to="/list" />
                    </Switch>
                </div>
            </Container>
        );
    }

    render() {
        const { providerStore } = this.props.root;
        let providerLoaded = false;
        if (!providerStore.defaultAccount) {
            providerLoaded = false;
        } else {
            providerLoaded = true;
        }

        return (
            <ErrorHandler>
                <MuiThemeProvider theme={theme}>
                    <HashRouter>
                        <div>
                            <Header />
                            <Route component={this.NotificationComponent} />
                            {providerLoaded ? this.renderViews() : <div></div>}
                        </div>
                    </HashRouter>
                </MuiThemeProvider>
            </ErrorHandler>
        );
    }
}

export default App;
