import React from 'react';
import styled from 'styled-components';
import LiquidityPanel, { LiquidityPanelDataSource } from './LiquidityPanel';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';

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

const SharedPools = observer(() => {
    const {
        root: { poolStore },
    } = useStores();

    const pools = poolStore.getPublicPools();

    return (
        <Wrapper>
            <Header>Shared Pools</Header>
            <LiquidityPanel
                pools={pools}
                dataSource={LiquidityPanelDataSource.ALL_PUBLIC}
            />
        </Wrapper>
    );
});

export default SharedPools;
