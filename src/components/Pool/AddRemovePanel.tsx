import React from 'react';
import styled from 'styled-components';
import Identicon from '../Common/Identicon';
import Button from '../Common/Button';
import { getEtherscanLink, shortenAddress } from 'utils/helpers';
import { useStores } from '../../contexts/storesContext';

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    padding: 20px;
    background: var(--panel-background);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    width: calc(67% - 99px);
    @media screen and (max-width: 1024px) {
        width: 100%;
        margin: 20px 0 0 0;
        flex-wrap: wrap;
    }
    margin-left: 25px;
`;

const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
    width: 60%;
`;

const RightColumn = styled.div`
    display: flex;
    flex-direction: column;
    width: 40%;
`;

const Spacer = styled.div`
    height: 20px;
`;

const AddressContainer = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--address-color);
    width: 60%;
`;

const IdenticonText = styled.a`
    margin-left: 10px;
    color: var(--body-text);
    text-decoration: none;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const InformationContainer = styled.div`
    margin-top: 16px;
    color: var(--body-text);
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

interface Props {
    poolAddress: string;
}

const AddRemovePanel = (props: Props) => {
    const { poolAddress } = props;
    const {
        root: {
            providerStore,
            addLiquidityFormStore,
            removeLiquidityFormStore,
            poolStore,
        },
    } = useStores();
    const account = providerStore.providerStatus.account;
    const chainId = providerStore.providerStatus.activeChainId;

    const pool = poolStore.getPool(poolAddress);
    let userProportion = undefined;
    let isFinalized = false;
    let isEmpty = false;

    if (pool) {
        userProportion = poolStore.getUserShareProportion(
            pool.address,
            account
        );
        isFinalized = pool.finalized;
        isEmpty = pool.totalShares.isZero();
    }

    return (
        <Wrapper>
            <LeftColumn>
                <AddressContainer>
                    <Identicon address={poolAddress} />
                    <IdenticonText
                        href={getEtherscanLink(chainId, poolAddress, 'address')}
                        target="_blank"
                    >
                        {shortenAddress(poolAddress)}
                    </IdenticonText>
                </AddressContainer>
                <InformationContainer></InformationContainer>
            </LeftColumn>
            {isFinalized ? (
                <RightColumn>
                    <Button
                        text={'Add Liquidity'}
                        isActive={!!pool && !isEmpty}
                        isPrimary={true}
                        onClick={() => {
                            if (pool) {
                                addLiquidityFormStore.openModal(
                                    poolAddress,
                                    account,
                                    pool.tokensList
                                );
                            }
                        }}
                    />
                    <Spacer />
                    <Button
                        text={'Remove Liquidity'}
                        isActive={
                            !!pool &&
                            account &&
                            userProportion &&
                            userProportion.gt(0)
                        }
                        onClick={() => {
                            if (pool) {
                                removeLiquidityFormStore.openModal(
                                    poolAddress,
                                    account,
                                    pool.tokensList
                                );
                            }
                        }}
                    />
                </RightColumn>
            ) : (
                <div />
            )}
        </Wrapper>
    );
};

export default AddRemovePanel;
