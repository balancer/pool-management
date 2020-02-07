import React, { Component } from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';
import Header from 'components/Common/Header';
import Home from 'views/Home';
import LeftNav from 'components/Common/LeftNav'
import WalletBalances from 'components/Common/WalletBalances'

const Container = styled.div`
    display: flex;
    flex-direction: row;
`

const LeftContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100vh - 70px);
    width: 270px;
    border-right: 1px solid var(--panel-border);
    background-color: var(--panel-background);
`

const App = () => {
    const renderViews = () => {
        return (
            <div className="app-shell">
                <Switch>
                    <Route path="/list" component={Home} />
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
