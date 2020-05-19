import React from 'react';
import styled from 'styled-components';
import MyLiquidity from '../components/Home/MyLiquidity';
import SharedPools from '../components/Home/SharedPools';

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
            <MyLiquidity />
            <SharedPools />
        </HomeWrapper>
    );
};

export default Home;
