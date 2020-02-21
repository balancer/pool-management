import React, { Component } from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';

const Wrapper = styled.div`
	width: calc(80% - 20px);
	border: 1px solid var(--panel-border);
	border-radius: 4px;
	background: var(--panel-background);
	margin-top: 32px;
	margin-left: 20px;
`

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
`

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
`

const TableCell = styled.div`
	display: flex;
	align-items: center;
	width: ${ props => props.width || "25%" };
`

const TableCellRight = styled(TableCell)`
	justify-content: flex-end;
`

const TokenIcon = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 13px;
`

const DepositAmount = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	height: 30px;
	border: 1px solid var(--panel-border);
	border-radius: 4px;
	width: 80%;
	padding: 0px 17px;
`

const MaxLink = styled.div`
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    text-decoration-line: underline;
    color: var(--link-text);
    cursor: pointer;
`;

const AddAssetTable = () => {

    return (
        <Wrapper>
        	<HeaderRow>
        		<TableCell>Asset</TableCell>
        		<TableCell>Unlock</TableCell>
        		<TableCell>Wallet Balance</TableCell>
        		<TableCellRight>Deposit Amount</TableCellRight>
        	</HeaderRow>
        	<TableRow>
        		<TableCell>
        			<TokenIcon src={TokenIconAddress("0x6b175474e89094c44da98b954eedeac495271d0f")} />
        			Dai
        		</TableCell>
        		<TableCell></TableCell>
        		<TableCell>100,393.44 DAI</TableCell>
        		<TableCellRight>
        			<DepositAmount>
        				<MaxLink>Max</MaxLink>
        				1,500
        			</DepositAmount>
        		</TableCellRight>
        	</TableRow>
        	<TableRow>
        		<TableCell>
        			<TokenIcon src={TokenIconAddress("0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2")} />
        			MKR
        		</TableCell>
        		<TableCell></TableCell>
        		<TableCell>100,393.44 MKR</TableCell>
        		<TableCellRight>
        			<DepositAmount>
        				<MaxLink>Max</MaxLink>
        				0.25
        			</DepositAmount>
        		</TableCellRight>
        	</TableRow>
        	<TableRow>
        		<TableCell>
        			<TokenIcon src={TokenIconAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")} />
        			USDC
        		</TableCell>
        		<TableCell></TableCell>
        		<TableCell>100,393.44 USDC</TableCell>
        		<TableCellRight>
        			<DepositAmount>
        				<MaxLink>Max</MaxLink>
        				25
        			</DepositAmount>
        		</TableCellRight>
        	</TableRow>
        	<TableRow>
        		<TableCell>
        			<TokenIcon src={TokenIconAddress("0x1985365e9f78359a9B6AD760e32412f4a445E862")} />
        			REP
        		</TableCell>
        		<TableCell></TableCell>
        		<TableCell>100,393.44 REP</TableCell>
        		<TableCellRight>
        			<DepositAmount>
        				<MaxLink>Max</MaxLink>
        				430
        			</DepositAmount>
        		</TableCellRight>
        	</TableRow>
        	<TableRow>
        		<TableCell>
        			<TokenIcon src={TokenIconAddress("0x960b236A07cf122663c4303350609A66A7B288C0")} />
        			ANT
        		</TableCell>
        		<TableCell></TableCell>
        		<TableCell>100,393.44 ANT</TableCell>
        		<TableCellRight>
        			<DepositAmount>
        				<MaxLink>Max</MaxLink>
        				100,000
        			</DepositAmount>
        		</TableCellRight>
        	</TableRow>
        	<TableRow>
        		<TableCell>
        			<TokenIcon src={TokenIconAddress("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599")} />
        			wBTC
        		</TableCell>
        		<TableCell></TableCell>
        		<TableCell>100,393.44 wBTC</TableCell>
        		<TableCellRight>
        			<DepositAmount>
        				<MaxLink>Max</MaxLink>
        				340
        			</DepositAmount>
        		</TableCellRight>
        	</TableRow>
        	<TableRow>
        		<TableCell>
        			<TokenIcon src={TokenIconAddress("0x0d8775f648430679a709e98d2b0cb6250d2887ef")} />
        			BAT
        		</TableCell>
        		<TableCell></TableCell>
        		<TableCell>100,393.44 BAT</TableCell>
        		<TableCellRight>
        			<DepositAmount>
        				<MaxLink>Max</MaxLink>
        				700
        			</DepositAmount>
        		</TableCellRight>
        	</TableRow>
        	<TableRow>
        		<TableCell>
        			<TokenIcon src={TokenIconAddress("0xc011a72400e58ecd99ee497cf89e3775d4bd732f")} />
        			SNX
        		</TableCell>
        		<TableCell></TableCell>
        		<TableCell>100,393.44 SNX</TableCell>
        		<TableCellRight>
        			<DepositAmount>
        				<MaxLink>Max</MaxLink>
        				1,500
        			</DepositAmount>
        		</TableCellRight>
        	</TableRow>
        </Wrapper>
    );
};

export default AddAssetTable;
