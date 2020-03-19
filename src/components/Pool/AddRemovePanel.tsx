import React from 'react';
import styled from 'styled-components';
import Identicon from '../Common/Identicon';
import Button from '../Common/Button';
import { getEtherscanLink } from 'utils/helpers';
import { useStores } from '../../contexts/storesContext';
import { ModalMode } from '../../stores/AddLiquidityForm';

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    padding: 20px;
    background: var(--panel-background);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    width: calc(67% - 99px);
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
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const InformationContainer = styled.div`
    margin-top: 16px;
    color: var(--body-text);
    font-family: Roboto;
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
    const { chainId, account } = providerStore.getActiveWeb3React();

    const pool = poolStore.getPool(poolAddress);
    let userProportion = undefined;

    if (pool) {
        userProportion = poolStore.getUserShareProportion(
            pool.address,
            account
        );
    }

    return (
        <Wrapper>
            <LeftColumn>
                <AddressContainer>
                    <Identicon address={poolAddress} />
                    <IdenticonText href={getEtherscanLink(chainId, poolAddress, 'address')} target="_blank">{poolAddress}</IdenticonText>
                </AddressContainer>
                <InformationContainer></InformationContainer>
            </LeftColumn>
            <RightColumn>
                <Button
                    buttonText={'Add Liquidity'}
                    active={!!pool}
                    onClick={() => {
                        if (pool) {
                            addLiquidityFormStore.openModal(
                                poolAddress,
                                account,
                                pool.tokensList,
                                ModalMode.ADD_LIQUIDITY
                            );
                        }
                    }}
                />
                <Spacer />
                <Button
                    buttonText={'Remove Liquidity'}
                    active={
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
        </Wrapper>
    );
};

export default AddRemovePanel;
