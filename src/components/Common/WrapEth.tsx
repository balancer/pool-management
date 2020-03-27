import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../Common/Button';
import { useStores } from '../../contexts/storesContext';
import { toWei } from '../../utils/helpers';
import { ContractTypes } from '../../stores/Provider';
import { ethers } from 'ethers';


const BContainer = styled.div`
    font-family: var(--roboto);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

const ButtonBase = styled.div`
    border-radius: 4px;
    width: 70px;
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

const JohnsButton = ({ buttonText, active, onClick }) => {
    const ButtonDisplay = ({ activeButton, children }) => {
        if (activeButton) {
            return <ActiveButton onClick={onClick}>{children}</ActiveButton>;
        } else {
            return <InactiveButton>{children}</InactiveButton>;
        }
    };

    return (
        <BContainer>
            <ButtonDisplay activeButton={active}>{buttonText}</ButtonDisplay>
        </BContainer>
    );
};

const Container = styled.div`
    font-family: var(--roboto);
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

// align-items: center;

const WrapHeader = styled.div`
    align-items: left;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    padding-left: 30px;
    padding-top: 14px;
    color: var(--token-balance-text);
    text-transform: uppercase;
`;

const Advice = styled.div`
    align-items: left;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    font-size: 10px;
    line-height: 18px;
    padding-left: 30px;
    padding-top: 5px;
    color: var(--token-balance-text);
`;

const InputWrapper = styled.div`
    height: 38px;
    padding: 0px 17px;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    input {
        width: 100px;
        text-align: right;
        color: var(--input-text);
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
        letter-spacing: 0.2px;
        padding-left: 5px;
        background-color: var(--panel-background);
        border: none;
        box-shadow: inset 0 0 0 1px var(--panel-background),
            inset 0 0 0 70px var(--panel-background);
        :-webkit-autofill,
        :-webkit-autofill:hover,
        :-webkit-autofill:focus,
        :-webkit-autofill:active,
        :-internal-autofill-selected {
            -webkit-text-fill-color: var(--body-text);
        }
        ::placeholder {
            color: var(--input-placeholder-text);
        }
        :focus {
            outline: none;
        }
    }
    border: ${props =>
        props.errorBorders ? '1px solid var(--error-color)' : ''};
    margin-left: ${props => (props.errorBorders ? '-1px' : '0px')}
    margin-right: ${props => (props.errorBorders ? '-1px' : '0px')}
    :hover {
        background-color: var(--input-hover-background);
        border: ${props =>
            props.errorBorders
                ? '1px solid var(--error-color)'
                : '1px solid var(--input-hover-border);'};
        margin-left: -1px;
        margin-right: -1px;
        input {
            background-color: var(--input-hover-background);
            box-shadow: inset 0 0 0 1px var(--input-hover-background),
                inset 0 0 0 70px var(--input-hover-background);
            ::placeholder {
                color: var(--input-hover-placeholder-text);
                background-color: var(--input-hover-background);
            }
        }
    }
`;

const BalanceElement = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: var(--highlighted-selector-text);
    padding: 0px 30px 0px 30px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 22px;
    margin-top: 2px;
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
            <WrapHeader>Eth</WrapHeader>
            <BalanceElement>
            <InputWrapper errorBorders={false}>
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
            </InputWrapper>
            <JohnsButton
                buttonText={`WRAP`}
                active={true}
                onClick={e =>
                    actionButtonHandler(ButtonAction.WRAP)
                }
            />
            </BalanceElement>
            <Advice>Keep some ETH unwrapped for transaction fees</Advice>

            <WrapHeader>WETH</WrapHeader>
            <BalanceElement>
              <InputWrapper errorBorders={false}>
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
              </InputWrapper>
              <JohnsButton
                  buttonText={`UNWRAP`}
                  active={true}
                  onClick={e =>
                      actionButtonHandler(ButtonAction.UNWRAP)
                  }
              />
            </BalanceElement>
        </Container>
    );
};

export default WrapEth;
