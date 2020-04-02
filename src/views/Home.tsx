import React from 'react';
import styled from 'styled-components';
import WarningMessage from '../components/Home/WarningMessage';
import Web3ModalTest from '../components/Home/Web3ModalTest';
import MyLiquidity from '../components/Home/MyLiquidity';
import AllPools from '../components/Home/AllPools';

const HomeWrapper = styled.div`
    position: relative;
    padding: 32px 30px 0px 30px;
`;

const Home = () => {
    return (
        <HomeWrapper>
            <Web3ModalTest />
            <WarningMessage />
            <MyLiquidity />
            <AllPools />
        </HomeWrapper>
    );
};

export default Home;
