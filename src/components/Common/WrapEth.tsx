import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../Common/Button';
import { useStores } from '../../contexts/storesContext';
import { toWei } from '../../utils/helpers';
import { ContractTypes } from '../../stores/Provider';
import { ethers } from 'ethers';


const Container = styled.div`
    font-family: var(--roboto);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const WrapHeader = styled.div`
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    padding-left: 30px;
    padding-top: 24px;
    color: var(--token-balance-text);
    text-transform: uppercase;
`;

const TokenInput = styled.input`
    align-items: center;
`;

const BalanceElement = styled.div`
    justify-content: space-between;
    color: var(--highlighted-selector-text);
    padding: 0px 30px 0px 30px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 22px;
    margin-top: 20px;
`;

enum ButtonAction {
    WRAP,
    UNWRAP
}

const WrapEth = () => {

    const [tokenAmount, setTokenAmount] = useState('0');

    const {
        root: { providerStore, contractMetadataStore },
    } = useStores();

    const web3React = providerStore.getActiveWeb3React();

    const actionButtonHandler = async (
        action: ButtonAction,
    ) => {
        if (action === ButtonAction.WRAP) {

            console.log(`!!!!!!! WRAP: ${tokenAmount}`);
            console.log(contractMetadataStore.getWethAddress())

            let overrides = {
                value: ethers.utils.parseEther(tokenAmount),
            };

            await providerStore.sendTransaction(
                web3React,
                ContractTypes.Weth,
                contractMetadataStore.getWethAddress(),
                'deposit',[],
                overrides
            );

        } else if (action === ButtonAction.UNWRAP) {
            let amountToUnwrap = toWei(tokenAmount);
            console.log(`!!!!!!! UNWRAP: ${tokenAmount} ${amountToUnwrap}`);

            await providerStore.sendTransaction(
                web3React,
                ContractTypes.Weth,
                contractMetadataStore.getWethAddress(),
                'withdraw',
                [amountToUnwrap.toString()]
            );
        }
    };

    const handleInputChange = async (event, tokenAddress: string) => {
        const { value } = event.target;
        setTokenAmount(value);
    };

    return (
        <Container>
            <WrapHeader>Wrap Eth</WrapHeader>
            <BalanceElement>
            <input
                id={`input-wrap`}
                name={`input-name-wrap`}
                value={
                     tokenAmount
                }
                onChange={e => {
                    handleInputChange(
                        e,
                        'tokenAddress'
                    );
                }}
                // ref={textInput}
                placeholder=""
            />
            </BalanceElement>
            <BalanceElement>
            <Button
                buttonText={`WRAP ETH`}
                active={true}
                onClick={e =>
                    actionButtonHandler(ButtonAction.WRAP)
                }
            />
            </BalanceElement>
            <Button
                buttonText={`UNWRAP WETH`}
                active={true}
                onClick={e =>
                    actionButtonHandler(ButtonAction.UNWRAP)
                }
            />
        </Container>
    );
};

export default WrapEth;
