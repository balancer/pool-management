import React from 'react';
import styled from 'styled-components';
import WarningMessage from '../components/Home/WarningMessage';
import MyLiquidity from '../components/Home/MyLiquidity';
import AllPools from '../components/Home/AllPools';

const HomeWrapper = styled.div`
    position: relative;
    padding: 32px 30px 0px 30px;

    @media screen and (max-width: 1024px) {
        padding: 32px 10px 0px 10px;
    }
`;

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
