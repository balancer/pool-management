import React from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';
import Web3ReactManagerOld from 'components/Web3ReactManagerOld';
import Web3ReactManager from 'components/Web3ReactManager';
import Header from 'components/Common/Header';
import Home from 'views/Home';
import Pool from 'views/Pool';
import LeftNav from 'components/Common/LeftNav';
import WalletBalances from 'components/Common/WalletBalances';

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
                    <Route path="/list" component={Home} />
                    <Route path="/pool/:poolAddress" component={Pool} />
                    <Redirect from="/" to="/list" />
                </Switch>
            </div>
        );
    };

    return (
        <Web3ReactManager>
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
        </Web3ReactManager>
    );
};

export default App;
