import React from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { BigNumberMap, Pool } from '../../types';
import {bnum, formatBalanceTruncated, fromWei} from '../../utils/helpers';
import { BigNumber } from '../../utils/bignumber';
import { ValidationStatus } from '../../stores/actions/validators';

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
    width: ${props => props.width || '25%'};
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
                    const token = pool.tokens.find(token => {
                        return token.address === tokenAddress;
                    });

                    const tokenMetadata = contractMetadataStore.getTokenMetadata(
                        tokenAddress
                    );

                    let normalizedUserBalance = '0';
                    let userBalanceToDisplay = '-';

                    if (userBalances && userBalances[tokenAddress]) {
                        normalizedUserBalance = formatBalanceTruncated(
                            userBalances[tokenAddress],
                            tokenMetadata.precision,
                            20
                        );

                        userBalanceToDisplay = normalizedUserBalance;
                    }

                    return (
                        <TableRow>
                            <TableCell>
                                <TokenIcon
                                    src={TokenIconAddress(
                                        tokenMetadata.iconAddress
                                    )}
                                />
                                {token.symbol}
                            </TableCell>
                            <TableCell>
                                {userBalanceToDisplay} {token.symbol}
                            </TableCell>
                            <TableCellRight>
                                <WithdrawAmount>
                                	<div>
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
                <TableCellRight>Withdraw Amount</TableCellRight>
            </HeaderRow>
            {pool &&
            removeLiquidityFormStore.isActivePool(poolAddress) &&
            removeLiquidityFormStore.isActiveAccount(account) ? (
                renderAssetTable(pool, userBalances)
            ) : (
                <TableRow>Loading</TableRow>
            )}
        </Wrapper>
    )
});

export default RemoveAssetsTable;
