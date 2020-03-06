import React from 'react';
import styled from 'styled-components';
import LiquidityPanel, { LiquidityPanelDataSource } from './LiquidityPanel';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { Pool } from '../../types';

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

const MyLiquidity = observer(() => {
    const {
        root: { poolStore, providerStore },
    } = useStores();
    const { account } = providerStore.getActiveWeb3React();

    let pools: Pool[] = [];

    if (account) {
        // pools = poolStore.getPublicPools({address: account})
    }

    return (
        <Wrapper>
            <Header>My Liquidity</Header>
            <LiquidityPanel
                pools={pools}
                dataSource={LiquidityPanelDataSource.ACCOUNT_PUBLIC}
            />
        </Wrapper>
    );
});

export default MyLiquidity;
