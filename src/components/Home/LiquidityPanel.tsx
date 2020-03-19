import React from 'react';
import styled from 'styled-components';
import Identicon from '../Common/Identicon';
import { Pie } from 'react-chartjs-2';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { Pool } from '../../types';
import {
    formatBalanceTruncated,
    formatPercentage,
    shortenAddress,
    toWei,
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
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

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
`;

const FooterRow = styled.div`
    height: 56px;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '12%'};
`;

const AssetCell = styled(TableCell)`
    width: 46%;
`;

const TableCellRight = styled(TableCell)`
    justify-content: flex-end;
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
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    margin-left: 12px;
`;

const AssetPercentageText = styled.div`
    font-family: Roboto;
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
    ACCOUNT_PUBLIC,
    ALL_PUBLIC,
}

enum Messages {
    noAccount = 'Connect wallet to see your liquidity',
    accountButNoPools = 'This account has no public liquidity contributions',
    noPublicPools = 'No public pools found',
}

const LiquidityPanel = observer((props: Props) => {
    const {
        root: { poolStore, providerStore, marketStore, contractMetadataStore },
    } = useStores();
    const { pools, dataSource } = props;
    const { account } = providerStore.getActiveWeb3React();

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
        return (
            <React.Fragment>
                {pools.map(pool => {
                    let liquidityText = '-';
                    let userLiquidityText = '-';

                    if (marketStore.assetPricesLoaded) {
                        const poolLiquidity = marketStore.getPortfolioValue(
                            pool
                        );
                        liquidityText = Number(formatBalanceTruncated(
                            toWei(poolLiquidity),
                            18,
                            4,
                            20
                        )).toLocaleString();

                        if (account) {
                            const userLiquidity = poolStore.calcUserLiquidity(
                                pool.address,
                                account
                            );

                            if (userLiquidity) {
                                userLiquidityText = Number(formatBalanceTruncated(
                                    toWei(userLiquidity),
                                    18,
                                    4,
                                    20
                                )).toLocaleString();
                            }
                        }
                    }

                    return (
                        <PoolRow key={pool.address}>
                            <TableCell width="15%">
                                <Identicon address={pool.address} />
                                <IdenticonText>
                                    <a href={`/#/pool/${pool.address}`}>
                                        {shortenAddress(pool.address)}
                                    </a>
                                </IdenticonText>
                            </TableCell>
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
                            <TableCell width="12%">{`$ ${liquidityText}`}</TableCell>
                            <TableCell width="12%">{`$ ${userLiquidityText}`}</TableCell>
                            <TableCellRight width="15%">$ -</TableCellRight>
                        </PoolRow>
                    );
                })}
            </React.Fragment>
        );
    };

    const renderPools = () => {
        // Has pool data to display and data has loaded
        if (poolStore.poolsLoaded && pools.length > 0) {
            return renderPoolsChart();
        }

        // Has pool data to display and data has NOT loaded
        else if (!poolStore.poolsLoaded && pools.length > 0) {
            return <PoolRow>Loading</PoolRow>;
        }

        // Has no account to display pools for
        else if (
            !account &&
            dataSource === LiquidityPanelDataSource.ACCOUNT_PUBLIC
        ) {
            return <PoolRow>{Messages.noAccount}</PoolRow>;
        }

        // Has no pool data to display for an account
        else if (
            account &&
            pools.length === 0 &&
            dataSource === LiquidityPanelDataSource.ACCOUNT_PUBLIC
        ) {
            return <PoolRow>{Messages.accountButNoPools}</PoolRow>;
        }

        // Has no public pools to display
        else if (
            pools.length === 0 &&
            dataSource === LiquidityPanelDataSource.ALL_PUBLIC
        ) {
            return <PoolRow>{Messages.noPublicPools}</PoolRow>;
        }
    };

    return (
        <Wrapper>
            <HeaderRow>
                <TableCell width="15%">Pool Address</TableCell>
                <AssetCell>Assets</AssetCell>
                <TableCell width="12%">Liquidity</TableCell>
                <TableCell width="12%">My Liquidity</TableCell>
                <TableCellRight width="15%">Trade Volume (24h)</TableCellRight>
            </HeaderRow>
            {renderPools()}
            <FooterRow />
        </Wrapper>
    );
});

export default LiquidityPanel;
