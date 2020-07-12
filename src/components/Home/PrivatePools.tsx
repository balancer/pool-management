import React from 'react';
import styled from 'styled-components';
import LiquidityPanel, { LiquidityPanelDataSource } from './LiquidityPanel';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';

const Wrapper = styled.div`
    padding-top: 8px;
`;

const Header = styled.div`
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 19px;
    color: var(--header-text);
    padding: 0px 0px 24px 0px;
`;

const PrivatePools = observer(() => {
    const {
        root: { poolStore },
    } = useStores();

    const pools = poolStore.getPrivatePools();

    return (
        <Wrapper>
            <Header>Private Pools</Header>
            <LiquidityPanel
                pools={pools}
                dataSource={LiquidityPanelDataSource.ALL}
            />
        </Wrapper>
    );
});

export default PrivatePools;
