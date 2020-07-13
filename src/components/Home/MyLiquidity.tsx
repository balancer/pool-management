import React from 'react';
import styled from 'styled-components';
import LiquidityPanel, { LiquidityPanelDataSource } from './LiquidityPanel';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { useStores } from '../../contexts/storesContext';
import Button from '../Common/Button';

const Wrapper = styled.div`
    padding: 8px 0;
`;

const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
`;

const Header = styled.div`
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 19px;
    color: var(--header-text);
    padding: 0px 0px 24px 0px;
`;

const CreateLink = styled(Link)`
    text-decoration: none;
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
            <HeaderWrapper>
                <Header>My Liquidity</Header>
                <CreateLink to={'/pool/new'}>
                    <Button
                        text={'Create Pool'}
                        isActive={!!account}
                        isPrimary={true}
                        onClick={e => {}}
                    />
                </CreateLink>
            </HeaderWrapper>
            <LiquidityPanel
                pools={pools}
                dataSource={LiquidityPanelDataSource.ACCOUNT}
            />
        </Wrapper>
    );
});

export default MyLiquidity;
