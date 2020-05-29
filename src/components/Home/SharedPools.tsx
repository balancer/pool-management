import React from 'react';
import styled from 'styled-components';
import LiquidityPanel, { LiquidityPanelDataSource } from './LiquidityPanel';
import Button from '../Common/Button';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { useStores } from '../../contexts/storesContext';

const Wrapper = styled.div`
    padding-top: 8px;
`;

const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
`;

const Header = styled.div`
    font-family: Roboto;
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

const SharedPools = observer(() => {
    const {
        root: { poolStore, providerStore },
    } = useStores();

    const pools = poolStore.getPublicPools();

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
        </Wrapper>
    );
});

export default SharedPools;
