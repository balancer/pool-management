import React from 'react';
import styled from 'styled-components';
import { Pie } from 'react-chartjs-2';
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { useStores } from '../../contexts/storesContext';
import { Pool } from '../../types';
import {
    formatCurrency,
    formatPercentage,
    shortenAddress,
    formatFee,
} from '../../utils/helpers';
import { formatPoolAssetChartData } from '../../utils/chartFormatter';

const Wrapper = styled.div`
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
`;

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--body-text);
    border-bottom: 1px solid var(--panel-border);
    padding: 20px 25px 20px 25px;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const PoolLink = styled(Link)`
    text-decoration: none;
`;

const PoolRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--panel-row-text);
    text-align: left;
    border-bottom: 1px solid var(--panel-border);
    padding: 20px 25px 20px 25px;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;

    @media screen and (max-width: 1024px) {
        padding: 20px 5px 20px 5px;
    }

    &:hover {
        background: var(--panel-border);
    }
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '12%'};
    @media screen and (max-width: 1024px) {
        width: 30%;
    }
`;

const TableCellHideMobile = styled(TableCell)`
    @media screen and (max-width: 1024px) {
        display: none;
        width: 0%;
    }
`;

const AssetCell = styled(TableCell)`
    width: 46%;

    @media screen and (max-width: 1024px) {
        width: 65%;
    }
`;

const TableCellRight = styled(TableCell)`
    justify-content: flex-end;
    @media screen and (max-width: 1024px) {
        width: 33%;
    }
`;

const TableCellRightHideMobile = styled(TableCellRight)`
    @media screen and (max-width: 1024px) {
        display: none;
        width: 0%;
    }
`;

const IdenticonText = styled.div`
    margin-left: 10px;
    a {
        text-decoration: none;
        color: inherit;
    }
`;

const PieChartWrapper = styled.div`
    width: 40px;
    height: 40px;
`;

const BreakdownContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-left: 8px;
`;

const AssetPercentageContainer = styled.div`
    display: flex;
    align-items: center;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    margin-left: 12px;
`;

const AssetPercentageText = styled.div`
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: var(--panel-row-text);
    margin-left: 6px;
`;

const AssetDot = styled.div`
    height: 4px;
    width: 4px;
    border-radius: 6px;
    background: ${props => props.dotColor};
`;

interface Props {
    pools: Pool[];
    dataSource: LiquidityPanelDataSource;
}

export enum LiquidityPanelDataSource {
    ACCOUNT,
    ALL,
}

enum Messages {
    noAccount = 'Connect wallet to see your liquidity',
    noAccountPools = 'This account has no public liquidity contributions',
}

const LiquidityPanel = observer((props: Props) => {
    const {
        root: { poolStore, providerStore, marketStore, contractMetadataStore },
    } = useStores();
    const { pools, dataSource } = props;
    const account = providerStore.providerStatus.account;

    const scamTokens = contractMetadataStore.getScamTokens();

    const options = {
        animation: {
            duration: 0,
        },
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        tooltips: {
            enabled: false,
        },
    };

    const renderAssetPercentages = (pool: Pool) => {
        const sortedTokens = pool.tokens
            .slice()
            .sort(
                (a, b) =>
                    Number(b.denormWeightProportion) -
                    Number(a.denormWeightProportion)
            );
        return (
            <React.Fragment>
                {sortedTokens.map((token, index) => {
                    const tokenMetadata = contractMetadataStore.getTokenMetadata(
                        token.address
                    );
                    return (
                        <AssetPercentageContainer key={index}>
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

    const renderPoolsChart = () => {
        if (marketStore.assetPricesLoaded) {
            let poolsShown = pools
                .filter(pool => {
                    if (pool) {
                        for (const token of pool.tokensList) {
                            if (scamTokens.includes(token)) {
                                return false;
                            }
                        }
                    }
                    return true;
                })
                .sort((a, b) => {
                    return (
                        Number(marketStore.getPortfolioValue(b)) -
                        Number(marketStore.getPortfolioValue(a))
                    );
                });

            return (
                <React.Fragment>
                    {poolsShown.map(pool => {
                        let liquidityText = '-';
                        let userLiquidityText = '-';
                        let volumeText = '-';

                        const poolLiquidity = marketStore.getPortfolioValue(
                            pool
                        );
                        liquidityText = formatCurrency(poolLiquidity);

                        if (account) {
                            const userLiquidity = poolStore.calcUserLiquidity(
                                pool.address,
                                account
                            );

                            if (userLiquidity) {
                                userLiquidityText = formatCurrency(
                                    userLiquidity
                                );
                            }
                        }

                        // const volume = marketStore.getPoolVolume(pool);

                        volumeText = formatCurrency(pool.lastSwapVolume);

                        return (
                            <PoolLink
                                key={pool.address}
                                to={`/pool/${pool.address}`}
                            >
                                <PoolRow>
                                    <TableCellHideMobile>
                                        <IdenticonText>
                                            {shortenAddress(pool.address)}
                                        </IdenticonText>
                                    </TableCellHideMobile>
                                    <AssetCell>
                                        <PieChartWrapper>
                                            <Pie
                                                type={'doughnut'}
                                                data={formatPoolAssetChartData(
                                                    pool,
                                                    contractMetadataStore.contractMetadata
                                                )}
                                                options={options}
                                            />
                                        </PieChartWrapper>
                                        <BreakdownContainer>
                                            {renderAssetPercentages(pool)}
                                        </BreakdownContainer>
                                    </AssetCell>
                                    <TableCellHideMobile>
                                        {formatFee(pool.swapFee)}
                                    </TableCellHideMobile>
                                    <TableCellRight>{`$ ${liquidityText}`}</TableCellRight>
                                    <TableCellRightHideMobile>{`$ ${userLiquidityText}`}</TableCellRightHideMobile>
                                    <TableCellRightHideMobile>{`$ ${volumeText}`}</TableCellRightHideMobile>
                                </PoolRow>
                            </PoolLink>
                        );
                    })}
                </React.Fragment>
            );
        }
    };

    const renderPools = () => {
        // Has all token data been loaded
        if (pools.length > 0) {
            return renderPoolsChart();
        }
        if (dataSource === LiquidityPanelDataSource.ALL) {
            return <PoolRow>Loading</PoolRow>;
        }
        if (!account) {
            return <PoolRow>{Messages.noAccount}</PoolRow>;
        }
        return <PoolRow>{Messages.noAccountPools}</PoolRow>;
    };

    return (
        <Wrapper>
            <HeaderRow>
                <TableCellHideMobile>Pool Address</TableCellHideMobile>
                <AssetCell>Assets</AssetCell>
                <TableCellHideMobile>Swap Fee</TableCellHideMobile>
                <TableCellRight>Liquidity</TableCellRight>
                <TableCellRightHideMobile>
                    My Liquidity
                </TableCellRightHideMobile>
                <TableCellRightHideMobile>
                    Trade Vol. (24h)
                </TableCellRightHideMobile>
            </HeaderRow>
            {renderPools()}
        </Wrapper>
    );
});

export default LiquidityPanel;
