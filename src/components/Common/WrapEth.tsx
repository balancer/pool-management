import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../Common/Button';
import { useStores } from '../../contexts/storesContext';
import { toWei } from '../../utils/helpers';
import { ContractTypes } from '../../stores/Provider';
import { BigNumber } from 'utils/bignumber';
import { ethers } from 'ethers';


const Container = styled.div`
    font-family: var(--roboto);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

const ButtonBase = styled.div`
    border-radius: 4px;
    width: 155px;
    height: 38px;
    font-family: var(--roboto);
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    cursor: pointer;
`;

const ActiveButton = styled(ButtonBase)`
    background: var(--button-background);
    border: 1px solid var(--button-border);
    color: var(--button-text);
`;

const InactiveButton = styled(ButtonBase)`
    background: var(--selector-background);
    border: 1px solid var(--inactive-button-border);
    color: var(--inactive-button-text);
`;
/*
const WrapEth = ({ buttonText, active, onClick }) => {
    const ButtonDisplay = ({ activeButton, children }) => {
        if (activeButton) {
            return <ActiveButton onClick={onClick}>{children}</ActiveButton>;
        } else {
            return <InactiveButton>{children}</InactiveButton>;
        }
    };

    return (
        <Container>
            <ButtonDisplay activeButton={active}>{buttonText}</ButtonDisplay>
        </Container>
    );
};
*/

enum ButtonAction {
    WRAP,
    UNWRAP
}

const WrapEth = () => {

    const [count, setCount] = useState('0');

    const {
        root: { providerStore },
    } = useStores();
    const web3React = providerStore.getActiveWeb3React();

    const actionButtonHandler = async (
        action: ButtonAction,
    ) => {
        if (action === ButtonAction.WRAP) {


            console.log(`!!!!!!! WRAP: ${count}`);
            let overrides = {
                // value: utils.parseEther('1.0'),
                value: ethers.utils.parseEther(count),
            };

            await providerStore.sendTransaction(
                web3React,
                ContractTypes.Weth,
                '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                'deposit',[],
                overrides
            );

        } else if (action === ButtonAction.UNWRAP) {
            let amountToUnwrap = toWei(count);
            console.log(`!!!!!!! UNWRAP: ${count} ${amountToUnwrap}`);


            await providerStore.sendTransaction(
                web3React,
                ContractTypes.Weth,
                '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
                'withdraw',[amountToUnwrap.toString()]
            );
        }
    };

    const handleInputChange = async (event, tokenAddress: string) => {
        const { value } = event.target;
        console.log(value);
        setCount(value);
        /*
        addLiquidityFormStore.setInputValue(tokenAddress, value);
        addLiquidityFormStore.setActiveInputKey(tokenAddress);
        const ratio = addLiquidityFormStore.calcRatio(
            pool,
            tokenAddress,
            value
        );
        addLiquidityFormStore.setJoinRatio(ratio);
        addLiquidityFormStore.refreshInputAmounts(pool, account, ratio);
        */
    };

    return (
        <Container>
            <div>Wrap Eth</div>
            <input
                id={`input-wrap`}
                name={`input-name-wrap`}
                value={
                     count
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
            <Button
                buttonText={`Wrap Eth`}
                active={true}
                onClick={e =>
                    actionButtonHandler(ButtonAction.WRAP)
                }
            />
            <Button
                buttonText={`UnWrap WEth`}
                active={true}
                onClick={e =>
                    actionButtonHandler(ButtonAction.UNWRAP)
                }
            />
        </Container>
    );
};

export default WrapEth;
