import React, { Component } from 'react';
import styled from 'styled-components';
import WarningMessage from '../components/Home/WarningMessage'
import LiquidityPanel from '../components/Home/LiquidityPanel'

const HomeWrapper = styled.div`
	padding: 32px 30px 0px 30px;
`

const MyLiquidity = styled.div`
`

const AllPools = styled.div`
`

const Home = () => {

    return (
        <HomeWrapper>
            <WarningMessage />
            <LiquidityPanel />
            <AllPools />
        </HomeWrapper>
    );
};

export default Home;
