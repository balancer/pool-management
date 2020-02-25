import React from 'react';
import styled from 'styled-components';
import LiquidityPanel from './LiquidityPanel';

const Wrapper = styled.div`
    padding-top: 8px;
`;

const Header = styled.div`
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 19px;
    color: var(--header-text);
    padding: 24px 0px 24px 0px;
`;

const AllPools = () => {
    return (
        <Wrapper>
            <Header>All Pools</Header>
            <LiquidityPanel />
        </Wrapper>
    );
};

export default AllPools;
