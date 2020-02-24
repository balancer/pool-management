import React from 'react';
import styled from 'styled-components';
import Identicon from '../Common/Identicon';
import { Pie } from 'react-chartjs-2';

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
	width: ${ props => props.width || "12%" };
`

const AssetCell = styled(TableCell)`
	width: 46%;	
`

const TableCellRight = styled(TableCell)`
	justify-content: flex-end;
`

const IdenticonText = styled.div`
	margin-left: 10px;
`

const PieChartWrapper = styled.div`
    width: 40px;
    height: 40px;
`

const BreakdownContainer = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	margin-left: 8px;
`

const AssetPercentageContainer = styled.div`
	display: flex;
	align-items: center;
	font-family: Roboto;
	font-style: normal;
	font-weight: 500;
	font-size: 12px;
	line-height: 18px;
	margin-left: 12px;
	width: 78px;
`

const AssetPercentageText = styled.div`
	font-family: Roboto;
	font-style: normal;
	font-weight: 500;
	font-size: 12px;
	line-height: 18px;
	color: var(--panel-row-text);
	margin-left: 6px;
`

const AssetDot = styled.div`
	height: 4px;
	width: 4px;
	border-radius: 6px;
	background: ${ props => props.dotColor };
`

const LiquidityPanel = () => {

    const options = {
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        tooltips: {
            enabled: false,
        },
    };

    const formatPieData = () => {
        const pieData = {
            datasets: [
                {
                    data: [1],
                    borderAlign: 'center',
                    borderColor: '#B388FF',
                    borderWidth: '1',
                    weight: 0,
                },
                {
                    data: [10,10,10,10,10,10,10, 10],
                    borderAlign: 'center',
                    backgroundColor: ['#E7983D', '#536DFE', '#E7983D', '#64FFDA', '#B388FF', '#F4FF81', '#BDBDBD', '#602A52'],
                    borderColor: ['#E7983D', '#536DFE', '#E7983D', '#64FFDA', '#B388FF', '#F4FF81', '#BDBDBD', '#602A52'],
                    borderWidth: '0',
                    weight: 95,
                },
            ],
        };
        return pieData;
    };

    return (
        <Wrapper>
        	<HeaderRow>
        		<TableCell width="15%" >Pool Address</TableCell>
        		<AssetCell>Assets</AssetCell>
        		<TableCell width="12%" >Liquidity</TableCell>
        		<TableCell width="12%" >My Liquidity</TableCell>
        		<TableCellRight width="15%" >Trade Volume (24h)</TableCellRight>
        	</HeaderRow>
        	<PoolRow>
        		<TableCell width="15%" >
        			<Identicon address="0xc011a72400e58ecd99ee497cf89e3775d4bd732f" />
        			<IdenticonText>0xA4D4...fcd8</IdenticonText>
        		</TableCell>
        		<AssetCell>
        		    <PieChartWrapper>
                        <Pie
                        	type={'doughnut'}
                            data={formatPieData()}
                            options={options}
                        />
                    </PieChartWrapper>
        			<BreakdownContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#E7983D"/>
	        				<AssetPercentageText>12.5% DAI</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#536DFE"/>
	        				<AssetPercentageText>12.5% WBTC</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#E7983D"/>
	        				<AssetPercentageText>12.5% DGD</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#64FFDA"/>
	        				<AssetPercentageText>12.5% GNT</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#B388FF"/>
	        				<AssetPercentageText>12.5% ETH</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#F4FF81"/>
	        				<AssetPercentageText>12.5% OMG</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#BDBDBD"/>
	        				<AssetPercentageText>12.5% 0x</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#602A52"/>
	        				<AssetPercentageText>12.5% REP</AssetPercentageText>
	        			</AssetPercentageContainer>
	        		</BreakdownContainer>
        		</AssetCell>
        		<TableCell width="12%" >$8,024,093</TableCell>
        		<TableCell width="12%" >$802,409</TableCell>
        		<TableCellRight width="15%" >$564,346.44</TableCellRight>
        	</PoolRow>
        	<PoolRow>
        		<TableCell width="15%" >
        			<Identicon address="0x0d8775f648430679a709e98d2b0cb6250d2887ef" />
        			<IdenticonText>0xA4D4...fcd8</IdenticonText>
        		</TableCell>
        		<AssetCell>
        		    <PieChartWrapper>
                        <Pie
                        	type={'doughnut'}
                            data={formatPieData()}
                            options={options}
                        />
                    </PieChartWrapper>
        			<BreakdownContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#E7983D"/>
	        				<AssetPercentageText>12.5% DAI</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#536DFE"/>
	        				<AssetPercentageText>12.5% WBTC</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#E7983D"/>
	        				<AssetPercentageText>12.5% DGD</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#64FFDA"/>
	        				<AssetPercentageText>12.5% GNT</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#B388FF"/>
	        				<AssetPercentageText>12.5% ETH</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#F4FF81"/>
	        				<AssetPercentageText>12.5% OMG</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#BDBDBD"/>
	        				<AssetPercentageText>12.5% 0x</AssetPercentageText>
	        			</AssetPercentageContainer>
	        			<AssetPercentageContainer>
	        				<AssetDot dotColor="#602A52"/>
	        				<AssetPercentageText>12.5% REP</AssetPercentageText>
	        			</AssetPercentageContainer>
	        		</BreakdownContainer>
        		</AssetCell>
        		<TableCell width="12%" >$8,024,093</TableCell>
        		<TableCell width="12%" >$802,409</TableCell>
        		<TableCellRight width="15%" >$564,346.44</TableCellRight>
        	</PoolRow>
        	<FooterRow />
        </Wrapper>
    );
};

export default LiquidityPanel;
