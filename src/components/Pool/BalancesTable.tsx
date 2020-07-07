import React from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { BigNumber } from 'utils/bignumber';
import { Pool } from '../../types';
import {
    formatPercentage,
    formatNormalizedTokenValue,
    formatCurrency,
    getEtherscanLink,
} from '../../utils/helpers';

const Wrapper = styled.div`
    width: 100%;
`;

const TableWrapper = styled.div`
    border: 1px solid var(--panel-border);
    border-radius: 0 4px 4px 4px;
    background: var(--panel-background);
`;

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--body-text);
    border-bottom: 1px solid var(--panel-border);
    padding: 20px 25px 20px 25px;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const StyledLink = styled.a`
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 22px;
    text-decoration: none;
    color: var(--highlighted-selector-text);
`;

const TableRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--panel-row-text);
    text-align: left;
    border-bottom: 1px solid var(--panel-border);
    :last-of-type {
        border-bottom: none;
    }
    padding: 20px 25px 20px 25px;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '20%'};
    @media screen and (max-width: 1024px) {
        width: 30%;
    }
`;

const TableCellHideMobile = styled(TableCell)`
    @media screen and (max-width: 1024px) {
        display: none;
        width: 0%;
    }
`;

const TableCellRight = styled(TableCell)`
    justify-content: flex-end;
`;

const TableCellRightHideMobile = styled(TableCellRight)`
    @media screen and (max-width: 1024px) {
        display: none;
        width: 0%;
    }
`;

const TokenIcon = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 13px;
`;

interface Props {
    poolAddress: string;
}

const BalancesTable = observer((props: Props) => {
    const { poolAddress } = props;

    const {
        root: {
            poolStore,
            tokenStore,
            providerStore,
            contractMetadataStore,
            marketStore,
        },
    } = useStores();

    const account = providerStore.providerStatus.account;
    const chainId = providerStore.providerStatus.activeChainId;

    const pool = poolStore.getPool(poolAddress);
    let userPoolTokens: undefined | BigNumber;
    let totalPoolTokens: undefined | BigNumber;

    if (pool) {
        userPoolTokens = tokenStore.getBalance(poolAddress, account);
        totalPoolTokens = tokenStore.getTotalSupply(poolAddress);
    }

    const renderBalanceTable = (
        pool: Pool,
        userPoolTokens: undefined | BigNumber,
        totalPoolTokens: undefined | BigNumber
    ) => {
        return (
            <React.Fragment>
                {pool.tokensList.map(tokenAddress => {
                    const token = poolStore.getPoolToken(
                        pool.address,
                        tokenAddress
                    );

                    const tokenMetadata = contractMetadataStore.getTokenMetadata(
                        tokenAddress
                    );

                    const balanceToDisplay: string =
                        userPoolTokens && totalPoolTokens
                            ? formatNormalizedTokenValue(
                                  token.balance.times(
                                      userPoolTokens.div(totalPoolTokens)
                                  ),
                                  4,
                                  20
                              )
                            : '-';

                    let valueToDisplay = '-';
                    if (
                        userPoolTokens &&
                        totalPoolTokens &&
                        marketStore.assetPricesLoaded
                    ) {
                        if (tokenMetadata.isSupported) {
                            // TODO: Scale this using token decimals
                            const userBalanceValue = marketStore.getValue(
                                tokenMetadata.symbol,
                                token.balance.times(
                                    userPoolTokens.div(totalPoolTokens)
                                )
                            );

                            valueToDisplay = formatCurrency(userBalanceValue);
                        } else {
                            valueToDisplay = '(Untracked)';
                        }
                    }

                    const isSupported = tokenMetadata.isSupported;

                    return (
                        <TableRow key={tokenAddress}>
                            <TableCell>
                                <TokenIcon
                                    src={TokenIconAddress(
                                        tokenMetadata.iconAddress,
                                        tokenMetadata.isSupported
                                    )}
                                />
                                <StyledLink
                                    href={getEtherscanLink(
                                        chainId,
                                        tokenMetadata.address,
                                        'address'
                                    )}
                                    target="_blank"
                                >
                                    {tokenMetadata.symbol}
                                </StyledLink>
                            </TableCell>
                            <TableCell>
                                {formatPercentage(
                                    token.denormWeightProportion,
                                    2
                                )}
                            </TableCell>
                            <TableCell>
                                {formatNormalizedTokenValue(
                                    token.balance,
                                    tokenMetadata.precision
                                )}{' '}
                                {isSupported ? tokenMetadata.symbol : ''}
                            </TableCell>
                            <TableCellHideMobile>
                                {balanceToDisplay}{' '}
                                {isSupported ? tokenMetadata.symbol : ''}
                            </TableCellHideMobile>
                            <TableCellRightHideMobile>
                                $ {valueToDisplay}
                            </TableCellRightHideMobile>
                        </TableRow>
                    );
                })}
            </React.Fragment>
        );
    };

    return (
        <Wrapper>
            <TableWrapper>
                <HeaderRow>
                    <TableCell>Token</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Pool Balance</TableCell>
                    <TableCellHideMobile>My Pool Balance</TableCellHideMobile>
                    <TableCellRightHideMobile>
                        My Asset Value
                    </TableCellRightHideMobile>
                </HeaderRow>
                {pool ? (
                    renderBalanceTable(pool, userPoolTokens, totalPoolTokens)
                ) : (
                    <TableRow>Loading</TableRow>
                )}
            </TableWrapper>
        </Wrapper>
    );
});

export default BalancesTable;
