import React from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { BigNumberMap, Pool } from '../../types';
import {
    bnum,
    formatBalance,
    formatBalanceTruncated,
    formatPercentage,
    formatNormalizedTokenValue,
    fromWei,
    toWei,
} from '../../utils/helpers';

const Wrapper = styled.div`
    width: 100%;
    padding-top: 8px;
`;

const TableWrapper = styled.div`
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
`;

const Header = styled.div`
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 19px;
    color: var(--header-text);
    padding: 24px 0px 24px 0px;
`;

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--body-text);
    border-bottom: 1px solid var(--panel-border);
    padding: 20px 25px 20px 25px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
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
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '20%'};
`;

const TableCellRight = styled(TableCell)`
    justify-content: flex-end;
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

    const { account } = providerStore.getActiveWeb3React();

    const pool = poolStore.getPool(poolAddress);
    let userBalances: undefined | BigNumberMap;

    if (pool) {
        userBalances = tokenStore.getAccountBalances(pool.tokensList, account);
    }

    const renderBalanceTable = (
        pool: Pool,
        userBalances: undefined | BigNumberMap
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
                        userBalances && userBalances[tokenAddress]
                            ? formatBalanceTruncated(
                                  userBalances[tokenAddress],
                                  token.decimals,
                                  4,
                                  20
                              )
                            : '-';

                    let valueToDisplay = '-';
                    if (
                        userBalances &&
                        userBalances[tokenAddress] &&
                        marketStore.assetPricesLoaded
                    ) {
                        if (tokenMetadata.isSupported) {
                            // TODO: Scale this using token decimals
                            const userBalanceValue = marketStore.getValue(
                                tokenMetadata.symbol,
                                tokenStore.normalizeBalance(
                                    userBalances[tokenAddress],
                                    tokenAddress
                                )
                            );

                            valueToDisplay = Number(formatNormalizedTokenValue(
                                userBalanceValue,
                                2
                            )).toLocaleString();
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
                                {tokenMetadata.symbol}
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
                            <TableCell>
                                {balanceToDisplay}{' '}
                                {isSupported ? tokenMetadata.symbol : ''}
                            </TableCell>
                            <TableCellRight>$ {valueToDisplay}</TableCellRight>
                        </TableRow>
                    );
                })}
            </React.Fragment>
        );
    };

    return (
        <Wrapper>
            <Header>Balances</Header>
            <TableWrapper>
                <HeaderRow>
                    <TableCell>Token</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Pool Balance</TableCell>
                    <TableCell>My Balance</TableCell>
                    <TableCellRight>My Asset Value</TableCellRight>
                </HeaderRow>
                {pool ? (
                    renderBalanceTable(pool, userBalances)
                ) : (
                    <TableRow>Loading</TableRow>
                )}
            </TableWrapper>
        </Wrapper>
    );
});

export default BalancesTable;
