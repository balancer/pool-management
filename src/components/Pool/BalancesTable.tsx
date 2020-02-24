import React, { Component } from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';

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

const BalancesTable = () => {
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
                <TableRow>
                    <TableCell>
                        <TokenIcon
                            src={TokenIconAddress(
                                '0x6b175474e89094c44da98b954eedeac495271d0f'
                            )}
                        />
                        Dai
                    </TableCell>
                    <TableCell>12.5%</TableCell>
                    <TableCell>1,003,934.42 DAI</TableCell>
                    <TableCell>100,393.44 DAI</TableCell>
                    <TableCellRight>$100,420.10</TableCellRight>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <TokenIcon
                            src={TokenIconAddress(
                                '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
                            )}
                        />
                        MKR
                    </TableCell>
                    <TableCell>12.5%</TableCell>
                    <TableCell>1,003,934.42 DAI</TableCell>
                    <TableCell>100,393.44 DAI</TableCell>
                    <TableCellRight>$100,420.10</TableCellRight>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <TokenIcon
                            src={TokenIconAddress(
                                '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                            )}
                        />
                        USDC
                    </TableCell>
                    <TableCell>12.5%</TableCell>
                    <TableCell>1,003,934.42 DAI</TableCell>
                    <TableCell>100,393.44 DAI</TableCell>
                    <TableCellRight>$100,420.10</TableCellRight>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <TokenIcon
                            src={TokenIconAddress(
                                '0x1985365e9f78359a9B6AD760e32412f4a445E862'
                            )}
                        />
                        REP
                    </TableCell>
                    <TableCell>12.5%</TableCell>
                    <TableCell>1,003,934.42 DAI</TableCell>
                    <TableCell>100,393.44 DAI</TableCell>
                    <TableCellRight>$100,420.10</TableCellRight>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <TokenIcon
                            src={TokenIconAddress(
                                '0x6b175474e89094c44da98b954eedeac495271d0f'
                            )}
                        />
                        Dai
                    </TableCell>
                    <TableCell>12.5%</TableCell>
                    <TableCell>1,003,934.42 DAI</TableCell>
                    <TableCell>100,393.44 DAI</TableCell>
                    <TableCellRight>$100,420.10</TableCellRight>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <TokenIcon
                            src={TokenIconAddress(
                                '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
                            )}
                        />
                        wBTC
                    </TableCell>
                    <TableCell>12.5%</TableCell>
                    <TableCell>1,003,934.42 DAI</TableCell>
                    <TableCell>100,393.44 DAI</TableCell>
                    <TableCellRight>$100,420.10</TableCellRight>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <TokenIcon
                            src={TokenIconAddress(
                                '0x0d8775f648430679a709e98d2b0cb6250d2887ef'
                            )}
                        />
                        BAT
                    </TableCell>
                    <TableCell>12.5%</TableCell>
                    <TableCell>1,003,934.42 DAI</TableCell>
                    <TableCell>100,393.44 DAI</TableCell>
                    <TableCellRight>$100,420.10</TableCellRight>
                </TableRow>
                <TableRow>
                    <TableCell>
                        <TokenIcon
                            src={TokenIconAddress(
                                '0xc011a72400e58ecd99ee497cf89e3775d4bd732f'
                            )}
                        />
                        SNX
                    </TableCell>
                    <TableCell>12.5%</TableCell>
                    <TableCell>1,003,934.42 DAI</TableCell>
                    <TableCell>100,393.44 DAI</TableCell>
                    <TableCellRight>$100,420.10</TableCellRight>
                </TableRow>
            </TableWrapper>
        </Wrapper>
    );
};

export default BalancesTable;
