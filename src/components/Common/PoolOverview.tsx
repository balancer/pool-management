import React from 'react';
import styled from 'styled-components';
import { Pie } from 'react-chartjs-2';
import { observer } from 'mobx-react';
import {
    formatFee,
    formatPercentage,
    shortenAddress,
} from '../../utils/helpers';
import { useStores } from '../../contexts/storesContext';
import { Pool } from '../../types';
import { formatPoolAssetChartData } from '../../utils/chartFormatter';
import { BigNumber } from '../../utils/bignumber';

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

export const getUserShareText = (
    pool: Pool,
    account: string,
    totalPoolTokens: BigNumber | undefined,
    userPoolTokens: BigNumber | undefined
): string => {
    let shareText = '-';

    if (account && userPoolTokens && totalPoolTokens) {
        const userShare = userPoolTokens.div(totalPoolTokens);
        if (userShare) {
            shareText = formatPercentage(userShare, 2);
        } else {
            shareText = '0%';
        }
    }

    return shareText;
};

const PoolOverview = observer((props: Props) => {
    const { poolAddress } = props;
    const {
        root: { poolStore, providerStore, contractMetadataStore, tokenStore },
    } = useStores();
    const pool = poolStore.getPool(poolAddress);
    const account = providerStore.account;

    let userPoolTokens = undefined;
    const totalPoolTokens = tokenStore.getTotalSupply(poolAddress);

    if (account) {
        userPoolTokens = tokenStore.getBalance(poolAddress, account);
    }

    const feeText = pool ? formatFee(pool.swapFee) : '-';
    const shareText = getUserShareText(
        pool,
        account,
        totalPoolTokens,
        userPoolTokens
    );

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
                    const tokenMetadata = contractMetadataStore.getTokenMetadata(
                        token.address
                    );
                    return (
                        <AssetPercentageContainer key={token.address}>
                            <AssetDot
                                dotColor={contractMetadataStore.getTokenColor(
                                    token.address
                                )}
                            />
                            <AssetPercentageText>
                                {formatPercentage(
                                    token.denormWeightProportion,
                                    2
                                )}{' '}
                                {tokenMetadata.symbol}
                            </AssetPercentageText>
                        </AssetPercentageContainer>
                    );
                })}
            </React.Fragment>
        );
    };

    const metadata = contractMetadataStore.contractMetadata;

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
                            data={formatPoolAssetChartData(pool, metadata)}
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
