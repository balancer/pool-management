import React from 'react';
import styled from 'styled-components';
import LiquidityPanel, { LiquidityPanelDataSource } from './LiquidityPanel';
import Button from '../Common/Button';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import Filters from '../Filters';

const Wrapper = styled.div`
    padding: 8px 0;
`;

const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    color: var(--header-text);
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

const Pagination = styled.div`
    display: flex;
    margin-top: 16px;
`;

const ButtonWrapper = styled.div`
    margin-right: 16px;
`;

const SharedPools = observer(() => {
    const {
        root: { poolStore },
    } = useStores();

    let pools = poolStore.getPublicPools();

    const queryPreviousPage = () => {
        poolStore.pagePools(false);
    };

    const queryNextPage = () => {
        poolStore.pagePools(true);
    };

    const handleFiltersChange = selectedTokens => {
        poolStore.setSelectedTokens(selectedTokens);
    };

    const { graphSkip } = poolStore;

    return (
        <Wrapper>
            <HeaderWrapper>
                <Header>Shared Pools</Header>
                <Filters onChange={handleFiltersChange} />
            </HeaderWrapper>
            <LiquidityPanel
                pools={pools}
                dataSource={LiquidityPanelDataSource.ALL_PUBLIC}
            />
            <Pagination>
                <ButtonWrapper>
                    <Button
                        text={'Previous Page'}
                        isActive={graphSkip !== 0}
                        onClick={e => queryPreviousPage()}
                    />
                </ButtonWrapper>
                <ButtonWrapper>
                    <Button text={'Next Page'} onClick={e => queryNextPage()} />
                </ButtonWrapper>
            </Pagination>
        </Wrapper>
    );
});

export default SharedPools;
