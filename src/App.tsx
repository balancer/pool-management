import React, { Component } from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';
import Header from 'components/Header';
import { observer, inject } from 'mobx-react';
import './App.css';
import { Container } from '@material-ui/core';

import PoolListView from 'views/PoolListView';

const App = () => {

    const renderViews = () => {
        return (
            <Container>
                <div className="app-shell">
                    <Switch>
                        <Route path="/list" component={PoolListView} />
                        <Redirect from="/" to="/list" />
                    </Switch>
                </div>
            </Container>
        );
    };

    return (
        <HashRouter>
            <Header />
            {renderViews()}
        </HashRouter>
    );
};

export default App;
