import React, { Component } from 'react';
import styled from 'styled-components';
import WarningMessage from '../components/Home/WarningMessage'
import MyLiquidity from '../components/Home/MyLiquidity'
import AllPools from '../components/Home/AllPools'

const HomeWrapper = styled.div`
	padding: 32px 30px 0px 30px;
`

const Home = () => {

    return (
        <HomeWrapper>
            <WarningMessage />
            <MyLiquidity />
            <AllPools />
        </HomeWrapper>
    );
};

export default Home;
