import React from 'react';
import styled from 'styled-components';
import { Pie } from 'react-chartjs-2';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 20%;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    margin-top: 32px;
    padding: 20px;
`;

const Header = styled.div`
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: var(--body-text);
    text-transform: uppercase;
`;

const Address = styled.div`
    color: var(--address-color);
    margin-top: 14px;
`;

const PoolInfo = styled.div`
    color: var(--panel-row-text);
    margin-top: 10px;
`;

const ChartAndBreakdownWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const PieChartWrapper = styled.div`
    width: 100px;
    height: 100px;
    margin-top: 30px;
`;

const BreakdownContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 14px;
`;

const AssetPercentageContainer = styled.div`
    display: flex;
    align-items: center;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
    margin-left: 12px;
    margin-top: 10px;
`;

const AssetPercentageText = styled.div`
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
    color: var(--panel-row-text);
    margin-left: 12px;
`;

const AssetDot = styled.div`
    height: 8px;
    width: 8px;
    border-radius: 10px;
    background: ${props => props.dotColor};
`;

const PoolOverview = () => {
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
                    data: [10, 10, 10, 10, 10, 10, 10, 10],
                    borderAlign: 'center',
                    backgroundColor: [
                        '#E7983D',
                        '#536DFE',
                        '#E7983D',
                        '#64FFDA',
                        '#B388FF',
                        '#F4FF81',
                        '#BDBDBD',
                        '#602A52',
                    ],
                    borderColor: [
                        '#E7983D',
                        '#536DFE',
                        '#E7983D',
                        '#64FFDA',
                        '#B388FF',
                        '#F4FF81',
                        '#BDBDBD',
                        '#602A52',
                    ],
                    borderWidth: '0',
                    weight: 95,
                },
            ],
        };
        return pieData;
    };

    return (
        <Wrapper>
            <Header>Pool Overview</Header>
            <Address>0xA4D4...fcd8</Address>
            <PoolInfo>My Pool Share: 99.52%</PoolInfo>
            <PoolInfo>Pool Swap Fee: 0.1%</PoolInfo>
            <ChartAndBreakdownWrapper>
                <PieChartWrapper>
                    <Pie
                        type={'doughnut'}
                        data={formatPieData()}
                        options={options}
                    />
                </PieChartWrapper>
                <BreakdownContainer>
                    <AssetPercentageContainer>
                        <AssetDot dotColor="#E7983D" />
                        <AssetPercentageText>12.5% DAI</AssetPercentageText>
                    </AssetPercentageContainer>
                    <AssetPercentageContainer>
                        <AssetDot dotColor="#536DFE" />
                        <AssetPercentageText>12.5% WBTC</AssetPercentageText>
                    </AssetPercentageContainer>
                    <AssetPercentageContainer>
                        <AssetDot dotColor="#E7983D" />
                        <AssetPercentageText>12.5% DGD</AssetPercentageText>
                    </AssetPercentageContainer>
                    <AssetPercentageContainer>
                        <AssetDot dotColor="#64FFDA" />
                        <AssetPercentageText>12.5% GNT</AssetPercentageText>
                    </AssetPercentageContainer>
                    <AssetPercentageContainer>
                        <AssetDot dotColor="#B388FF" />
                        <AssetPercentageText>12.5% ETH</AssetPercentageText>
                    </AssetPercentageContainer>
                    <AssetPercentageContainer>
                        <AssetDot dotColor="#F4FF81" />
                        <AssetPercentageText>12.5% OMG</AssetPercentageText>
                    </AssetPercentageContainer>
                    <AssetPercentageContainer>
                        <AssetDot dotColor="#BDBDBD" />
                        <AssetPercentageText>12.5% 0x</AssetPercentageText>
                    </AssetPercentageContainer>
                    <AssetPercentageContainer>
                        <AssetDot dotColor="#602A52" />
                        <AssetPercentageText>12.5% REP</AssetPercentageText>
                    </AssetPercentageContainer>
                </BreakdownContainer>
            </ChartAndBreakdownWrapper>
        </Wrapper>
    );
};

export default PoolOverview;
