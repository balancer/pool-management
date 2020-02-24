import React, { Component } from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';
import Header from 'components/Common/Header';
import Home from 'views/Home';
import Pool from 'views/Pool';
import LeftNav from 'components/Common/LeftNav'
import WalletBalances from 'components/Common/WalletBalances'

const Container = styled.div`
    display: flex;
    flex-direction: row;
    min-height: 100vh;
`

const LeftContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 18%;
    border-right: 1px solid var(--panel-border);
    background-color: var(--panel-background);
`

const App = () => {
    const renderViews = () => {
        return (
            <div className="app-shell">
                <Switch>
                    <Route path="/list" component={Home} />
                    <Route path="/pool" component={Pool} />
                    <Redirect from="/" to="/list" />
                </Switch>
            </div>
        );
    };

    return (
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
    );
};

export default App;
