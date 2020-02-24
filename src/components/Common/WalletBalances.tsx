import React from "react";
import styled from "styled-components";
import { isAddress } from "../../utils/helpers";

const Wrapper = styled.div``;

const WalletBalanceContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const BalanceHeader = styled.div`
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
    margin-top: 20px;
`;

const IconAndNameContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

export const TokenIconAddress = address => {
    if (address === 'ether') {
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png`;
    } else {
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${isAddress(
            address
        )}/logo.png`;
    }
};

const TokenIcon = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 13px;
`;

const TokenName = styled.div`
    display: flex;
    align-items: center;
`;

const TokenBalance = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
`;

const WalletBalances = () => {
    return (
        <Wrapper>
            <BalanceHeader>My Wallet</BalanceHeader>
            <BalanceElement>
                <IconAndNameContainer>
                    <TokenIcon src={TokenIconAddress('ether')} />
                    <TokenName>ETH</TokenName>
                </IconAndNameContainer>
                <TokenBalance>2,512.624</TokenBalance>
            </BalanceElement>
            <BalanceElement>
                <IconAndNameContainer>
                    <TokenIcon
                        src={TokenIconAddress(
                            '0x6b175474e89094c44da98b954eedeac495271d0f'
                        )}
                    />
                    <TokenName>DAI</TokenName>
                </IconAndNameContainer>
                <TokenBalance>21,252.62</TokenBalance>
            </BalanceElement>
            <BalanceElement>
                <IconAndNameContainer>
                    <TokenIcon
                        src={TokenIconAddress(
                            '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
                        )}
                    />
                    <TokenName>MKR</TokenName>
                </IconAndNameContainer>
                <TokenBalance>510.624</TokenBalance>
            </BalanceElement>
        </Wrapper>
    );
};

export default WalletBalances;
