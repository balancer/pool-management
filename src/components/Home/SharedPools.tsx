import React from 'react';
import styled from 'styled-components';
import LiquidityPanel, { LiquidityPanelDataSource } from './LiquidityPanel';
import Button from '../Common/Button';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { useStores } from '../../contexts/storesContext';

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
    display: flex;
    margin-top: 16px;
`;

const PaginationButton = styled.div`
    width: 128px;
    padding: 8px;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    color: var(--button-text);
    text-align: center;
    font-size: 14px;
    margin-right: 8px;
    cursor: pointer;
`;

const SharedPools = observer(() => {
    const {
        root: { poolStore, providerStore },
    } = useStores();

    const pools = poolStore.getPublicPools();

    const queryPreviousPage = () => {
        poolStore.pagePools(false);
    };

    const queryNextPage = () => {
        poolStore.pagePools(true);
    };

    const account = providerStore.providerStatus.account;

    return (
        <Wrapper>
            <HeaderWrapper>
                <Header>Shared Pools</Header>
                <CreateLink to={'/pool/new'}>
                    <Button
                        buttonText={'Create Pool'}
                        active={!!account}
                        onClick={e => {}}
                    />
                </CreateLink>
            </HeaderWrapper>
            <LiquidityPanel
                pools={pools}
                dataSource={LiquidityPanelDataSource.ALL_PUBLIC}
            />
            <Pagination>
                <PaginationButton onClick={e => queryPreviousPage()}>
                    Previous Page
                </PaginationButton>
                <PaginationButton onClick={e => queryNextPage()}>
                    Next Page
                </PaginationButton>
            </Pagination>
        </Wrapper>
    );
});

export default SharedPools;
