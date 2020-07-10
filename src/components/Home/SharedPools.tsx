import React from 'react';
import styled from 'styled-components';
import LiquidityPanel, { LiquidityPanelDataSource } from './LiquidityPanel';
import Button from '../Common/Button';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { useStores } from '../../contexts/storesContext';
import { SUBGRAPH_SKIP_STEP } from '../../stores/Pool';

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

const Pagination = styled.div`
    margin-top: 16px;
    display: flex;
    align-items: center;
`;

const Page = styled.div`
    padding: 0 16px;
    color: var(--highlighted-selector-text);
    font-size: 14px;
`;

const SharedPools = observer(() => {
    const {
        root: { poolStore, providerStore },
    } = useStores();

    const pools = poolStore.getPublicPools();
    const { graphSkip } = poolStore;
    const page = graphSkip / SUBGRAPH_SKIP_STEP + 1;

    const account = providerStore.providerStatus.account;

    const queryPreviousPage = () => {
        poolStore.pagePools(false);
    };

    const queryNextPage = () => {
        poolStore.pagePools(true);
    };

    return (
        <Wrapper>
            <HeaderWrapper>
                <Header>Shared Pools</Header>
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
                dataSource={LiquidityPanelDataSource.ALL_PUBLIC}
            />
            <Pagination>
                <Button
                    text={'Previous Page'}
                    isActive={graphSkip !== 0}
                    onClick={e => queryPreviousPage()}
                />
                <Page>Page {page}</Page>
                <Button text={'Next Page'} onClick={e => queryNextPage()} />
            </Pagination>
        </Wrapper>
    );
});

export default SharedPools;
