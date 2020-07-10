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

const MyLiquidity = observer(() => {
    const {
        root: { poolStore, providerStore },
    } = useStores();
    const account = providerStore.providerStatus.account;

    const contributedPools = poolStore.getContributedPools();
    const pools = contributedPools.filter(pool => {
        const userShare = poolStore.getUserShareProportion(
            pool.address,
            account
        );

        return userShare && userShare.gt(0);
    });

    return (
        <Wrapper>
            <Header>My Liquidity</Header>
            <LiquidityPanel
                pools={pools}
                dataSource={LiquidityPanelDataSource.ACCOUNT}
            />
        </Wrapper>
    );
});

export default MyLiquidity;
