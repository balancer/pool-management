import React from 'react';
import styled from 'styled-components';
import { Pie } from 'react-chartjs-2';
import { observer } from 'mobx-react';
import {
    formatFee,
    formatPercentage,
    formatPoolAssetChartData,
    shortenAddress,
} from '../../utils/helpers';
import { useStores } from '../../contexts/storesContext';
import { Pool } from '../../types';
import { poolAssetColors } from '../index';

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

interface Props {
    poolAddress: string;
}

export const getUserShareText = (pool: Pool, account: string): string => {
    let shareText = '-';

    if (account && pool) {
        const userShare = pool.shares.find(share => share.account === account);
        if (userShare) {
            shareText = formatPercentage(userShare.balanceProportion, 1);
        } else {
            shareText = '0%';
        }
    }

    return shareText;
};

const PoolOverview = observer((props: Props) => {
    const { poolAddress } = props;
    const {
        root: { poolStore, providerStore },
    } = useStores();
    const pool = poolStore.getPool(poolAddress);
    const { account } = providerStore.getActiveWeb3React();

    const feeText = pool ? formatFee(pool.swapFee) : '-';
    const shareText = getUserShareText(pool, account);

    const options = {
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        tooltips: {
            enabled: false,
        },
    };

    const renderAssetPercentages = (pool: Pool) => {
        return (
            <React.Fragment>
                {pool.tokens.map((token, index) => {
                    return (
                        <AssetPercentageContainer>
                            <AssetDot dotColor={poolAssetColors[index]} />
                            <AssetPercentageText>
                                {formatPercentage(
                                    token.denormWeightProportion,
                                    2
                                )}{' '}
                                {token.symbol}
                            </AssetPercentageText>
                        </AssetPercentageContainer>
                    );
                })}
            </React.Fragment>
        );
    };

    return (
        <Wrapper>
            <Header>Pool Overview</Header>
            <Address>{shortenAddress(poolAddress)}</Address>
            <PoolInfo>My Pool Share: {shareText}</PoolInfo>
            <PoolInfo>Pool Swap Fee: {feeText}</PoolInfo>
            <ChartAndBreakdownWrapper>
                <PieChartWrapper>
                    {pool ? (
                        <Pie
                            type={'doughnut'}
                            data={formatPoolAssetChartData(pool)}
                            options={options}
                        />
                    ) : (
                        <div>Loading</div>
                    )}
                </PieChartWrapper>
                <BreakdownContainer>
                    {pool ? renderAssetPercentages(pool) : <div>Loading</div>}
                </BreakdownContainer>
            </ChartAndBreakdownWrapper>
        </Wrapper>
    );
});

export default PoolOverview;
