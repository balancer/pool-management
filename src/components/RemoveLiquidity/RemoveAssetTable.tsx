import React from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { BigNumberMap, Pool } from '../../types';
import {
    formatNormalizedTokenValue,
    fromPercentage,
} from '../../utils/helpers';

const Wrapper = styled.div`
    width: calc(80% - 20px);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
    margin-top: 32px;
    margin-left: 20px;
`;

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
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
    padding: 16px 20px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '30%'};
`;

const TableCellRight = styled(TableCell)`
    justify-content: flex-end;
`;

const TokenIcon = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 13px;
`;

const WithdrawAmount = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    border-radius: 4px;
`;

interface Props {
    poolAddress: string;
}

const RemoveAssetsTable = observer((props: Props) => {
    const { poolAddress } = props;

    const {
        root: {
            poolStore,
            tokenStore,
            providerStore,
            contractMetadataStore,
            removeLiquidityFormStore,
        },
    } = useStores();

    const web3React = providerStore.getActiveWeb3React();
    const { account } = web3React;

    const pool = poolStore.getPool(poolAddress);
    let userBalances: undefined | BigNumberMap;

    if (pool) {
        userBalances = tokenStore.getAccountBalances(pool.tokensList, account);
    }

    const renderAssetTable = (
        pool: Pool,
        userBalances: undefined | BigNumberMap
    ) => {
        return (
            <React.Fragment>
                {pool.tokensList.map(tokenAddress => {
                    const token = poolStore.getPoolToken(
                        poolAddress,
                        tokenAddress
                    );

                    const tokenMetadata = contractMetadataStore.getTokenMetadata(
                        tokenAddress
                    );

                    let poolBalanceToDisplay = '-';
                    let withdrawPreviewBalanceText = '-';

                    const precision = contractMetadataStore.getTokenPrecision(
                        token.address
                    );
                    const userLiquidityContribution = poolStore.getUserLiquidityContribution(
                        pool.address,
                        token.address,
                        account
                    );

                    poolBalanceToDisplay = formatNormalizedTokenValue(
                        userLiquidityContribution,
                        precision
                    );

                    if (removeLiquidityFormStore.hasValidInput()) {
                        const tokensToWithdraw = token.balance.times(
                            fromPercentage(
                                removeLiquidityFormStore.getShareToWithdraw()
                            )
                        );

                        withdrawPreviewBalanceText = formatNormalizedTokenValue(
                            tokensToWithdraw,
                            precision
                        );
                    }

                    return (
                        <TableRow key={token.address}>
                            <TableCell>
                                <TokenIcon
                                    src={TokenIconAddress(
                                        tokenMetadata.iconAddress,
                                        tokenMetadata.isSupported
                                    )}
                                />
                                {token.symbol}
                            </TableCell>
                            <TableCell>
                                {poolBalanceToDisplay} {token.symbol}
                            </TableCell>
                            <TableCellRight width="40%">
                                <WithdrawAmount>
                                    <div>
                                        {withdrawPreviewBalanceText}{' '}
                                        {token.symbol}
                                    </div>
                                </WithdrawAmount>
                            </TableCellRight>
                        </TableRow>
                    );
                })}
            </React.Fragment>
        );
    };

    return (
        <Wrapper>
            <HeaderRow>
                <TableCell>Asset</TableCell>
                <TableCell>My Pool Balance</TableCell>
                <TableCellRight width="40%">Withdraw Amount</TableCellRight>
            </HeaderRow>
            {pool &&
            removeLiquidityFormStore.isActivePool(poolAddress) &&
            removeLiquidityFormStore.isActiveAccount(account) ? (
                renderAssetTable(pool, userBalances)
            ) : (
                <TableRow>Loading</TableRow>
            )}
        </Wrapper>
    );
});

export default RemoveAssetsTable;
