import React, { Component } from 'react';
import styled from 'styled-components';

const HomeWrapper = styled.div`
`

const WarningMessage = styled.div`
`

const MyLiquidity = styled.div`
`

const AllPools = styled.div`
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
