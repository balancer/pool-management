import React from 'react';
import styled from 'styled-components';
import Identicon from '../Common/Identicon';

const Wrapper = styled.div`
	border: 1px solid var(--panel-border);
	border-radius: 4px;
	background: var(--panel-background);
`

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
`

const PoolRow = styled.div`
	display: flex;
	flex-direction: row;
	color: var(--panel-row-text);
	text-align: left;
	border-bottom: 1px solid var(--panel-border);
	padding: 20px 25px 20px 25px;
	font-family: Roboto;
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 16px;
`

const FooterRow = styled.div`
	height: 56px;
`

const TableCell = styled.div`
	display: flex;
	align-items: center;
	width: 20%;
`

const AssetCell = styled(TableCell)`
	width: 40%;	
`

const TableCellRight = styled(TableCell)`
	text-align: right;
`

const IdenticonText = styled.div`
	margin-left: 10px;
`

const LiquidityPanel = () => {

    return (
        <Wrapper>
        	<HeaderRow>
        		<TableCell>Pool Address</TableCell>
        		<AssetCell>Assets</AssetCell>
        		<TableCell>Liquidity</TableCell>
        		<TableCell>My Liquidity</TableCell>
        		<TableCellRight>Trade Volume (24h)</TableCellRight>
        	</HeaderRow>
        	<PoolRow>
        		<TableCell>
        			<Identicon address="0xc011a72400e58ecd99ee497cf89e3775d4bd732f" />
        			<IdenticonText>0xA4D4...fcd8</IdenticonText>
        		</TableCell>
        		<AssetCell>Assets</AssetCell>
        		<TableCell>$8,024,093</TableCell>
        		<TableCell>$802,409</TableCell>
        		<TableCellRight>$564,346.44</TableCellRight>
        	</PoolRow>
        	<PoolRow>
        		<TableCell>
        			<Identicon address="0x0d8775f648430679a709e98d2b0cb6250d2887ef" />
        			<IdenticonText>0xA4D4...fcd8</IdenticonText>
        		</TableCell>
        		<AssetCell>Assets</AssetCell>
        		<TableCell>$8,024,093</TableCell>
        		<TableCell>$802,409</TableCell>
        		<TableCellRight>$564,346.44</TableCellRight>
        	</PoolRow>
        	<FooterRow />
        </Wrapper>
    );
};

export default LiquidityPanel;
