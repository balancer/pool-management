import React from 'react';
import styled from 'styled-components';
import { formatBalanceTruncated, isAddress, bnum } from '../../utils/helpers';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import WrapEth from './WrapEth';

const Wrapper = styled.div``;

const BuildVersion = styled.div`
    display: flex;
    flex-direction: row;
    text-align: center;
    margin: 20px;
    font-size: 10px;
    color: var(--body-text);
    position: fixed;
    bottom: 0px;
`;

const BuildLink = styled.a`
    font-size: 10px;
    color: var(--body-text);
    text-decoration: none;
    margin-left: 5px;
`;

const BalanceHeader = styled.div`
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

const NotSupported = require('../../assets/images/question.svg') as string;

export const TokenIconAddress = (address, isSupported) => {
    if (!isSupported || address === 'unknown') {
        return NotSupported;
    }
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

const WalletBalances = observer(() => {
    const {
        root: { tokenStore, contractMetadataStore, providerStore },
    } = useStores();

    const account = providerStore.providerStatus.account;

    const buildId = process.env.REACT_APP_COMMIT_REF || '';

    const renderWalletBalances = () => {
        const whitelistedTokens = contractMetadataStore.getWhitelistedTokenMetadata();

        //Are all balances initially loaded?

        //Load and cache icons upon start - they must be loaded too

        //If not, display loading
        return (
            <React.Fragment>
                {whitelistedTokens.map(token => {
                    let balanceToDisplay: string;
                    if (account) {
                        const userBalance = tokenStore.getBalance(
                            token.address,
                            account
                        );
                        if (userBalance && userBalance.isGreaterThan(bnum(0))) {
                            balanceToDisplay = formatBalanceTruncated(
                                userBalance,
                                token.decimals,
                                4,
                                20
                            );
                        }
                    }

                    let returnBalance;

                    if (account && balanceToDisplay) {
                        returnBalance = renderBalance(
                            token.iconAddress,
                            token.symbol,
                            token.isSupported,
                            balanceToDisplay
                        );
                    }

                    return returnBalance;
                })}
            </React.Fragment>
        );
    };

    const renderBalance = (
        iconUrl: string,
        tokenName: string,
        isSupported: boolean,
        tokenBalance: string
    ) => {
        return (
            <BalanceElement key={tokenName}>
                <IconAndNameContainer>
                    <TokenIcon src={TokenIconAddress(iconUrl, isSupported)} />
                    <TokenName>{tokenName}</TokenName>
                </IconAndNameContainer>
                <TokenBalance>{tokenBalance}</TokenBalance>
            </BalanceElement>
        );
    };

    return (
        <Wrapper>
            <WrapEth />
            <BalanceHeader>My Wallet</BalanceHeader>
            {account ? (
                renderWalletBalances()
            ) : (
                <BalanceElement>Connect wallet to see balances</BalanceElement>
            )}
            <BuildVersion>
                BUILD ID:{' '}
                <BuildLink
                    href={`https://github.com/balancer-labs/pool-management/tree/${buildId}`}
                    target="_blank"
                >
                    {buildId.substring(0, 12)}
                </BuildLink>
            </BuildVersion>
        </Wrapper>
    );
});

export default WalletBalances;
