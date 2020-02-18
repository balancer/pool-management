import React from 'react';
import styled from 'styled-components';

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
	align-items: center;
	width: 20%;
`

const AssetCell = styled(TableCell)`
	width: 40%;	
`

const TableCellRight = styled(TableCell)`
	text-align: right;
`

const LiquidityPanel = () => {

    return (
        <Wrapper>
        	<HeaderRow>
        		<TableCell>Pool Address</TableCell>
        		<AssetCell>Assets</AssetCell>
        		<TableCell>Liquidity</TableCell>
        		<TableCell>My Liquidity</TableCell>
        		<TableCell>Trade Volume (24h)</TableCell>
        	</HeaderRow>
        	<PoolRow>
        		<TableCell>0xA4D4...fcd8</TableCell>
        		<AssetCell>Assets</AssetCell>
        		<TableCell>$8,024,093</TableCell>
        		<TableCell>$802,409</TableCell>
        		<TableCellRight>$564,346.44</TableCellRight>
        	</PoolRow>
        	<PoolRow>
        		<TableCell>0xA4D4...fcd8</TableCell>
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
