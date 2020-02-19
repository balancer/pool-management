import React, { Component } from 'react';
import styled from 'styled-components';
import { Pie } from 'react-chartjs-2';

const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	padding: 25px;
	background: var(--panel-background);
	border: 1px solid var(--panel-border);
	border-radius: 4px;
	width: 35%;
`

const PieChartWrapper = styled.div`
    width: 125px;
    height: 125px;
`

const BreakdownContainer = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	margin-left: 25px;
`

const AssetPercentageContainer = styled.div`
	display: flex;
	align-items: center;
	font-family: Roboto;
	font-style: normal;
	font-weight: 500;
	font-size: 14px;
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

const ChartPanel = () => {

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
        </Wrapper>
    );
};

export default ChartPanel;
