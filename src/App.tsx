import React from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';
import Web3Manager from 'components/Web3Manager';
import Header from 'components/Common/Header';
import Home from 'views/Home';
import Private from 'views/Private';
import Balancer from 'views/Balancer';
import Pool from 'views/Pool';
import Setup from 'views/Setup';
import LeftNav from 'components/Common/LeftNav';
import WalletBalances from 'components/Common/WalletBalances';
import Dashboard from 'views/Dashboard';

const Container = styled.div`
    display: flex;
    flex-direction: row;
`;

const LeftContainer = styled.div`
    @media screen and (max-width: 1024px) {
        display: none;
    }
    flex-direction: column;
    width: 300px;
    border-right: 1px solid var(--panel-border);
    background-color: var(--panel-background);
`;

const App = () => {
    const renderViews = () => {
        return (
            <div className="app-shell">
                <Switch>
                    <Route path="/pool/:poolAddress" component={Pool} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/private" component={Private} />
                    <Route path="/balancer" component={Balancer} />
                    <Route path="/setup" component={Setup} />
                    <Redirect from="/list" to="/" />
                    <Route path="/" component={Home} />
                </Switch>
            </div>
        );
    };

    return (
        <Web3Manager>
            <HashRouter>
                <Header />
                <Container>
                    <LeftContainer>
                        <LeftNav />
                        <WalletBalances />
                    </LeftContainer>
                    {renderViews()}
                </Container>
            </HashRouter>
        </Web3Manager>
    );
};

export default App;
