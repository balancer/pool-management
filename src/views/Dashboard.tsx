/**
 * BTC++ price /coingecko
 * PieDAO TVL
 * BTC++ Marker CAP
 * USD++ Marker CAP
 * PieDAO Pools Volume 24H
 * Total fees generated
 * PieDAO Pools Volume Total
 * Charts
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import InfoPanel from '../components/Pool/InfoPanel';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import { formatFee, bnum, formatCurrency } from '../utils/helpers';
import { RouteComponentProps, withRouter } from 'react-router';

const PoolViewWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 27px 25px 0px 25px;
`;

const InfoPanelWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    justify-content: flex-start;
    margin-bottom: 20px;
`;

const BTC = `0x9891832633a83634765952b051bc7fef36714a46`;
const USD = `0x1ee383389c621c37ee5aa476f88413a815083c5d`;

const Dashboard = observer((props: RouteComponentProps) => {
    const {
        root: { poolStore, dashboardStore, marketStore },
    } = useStores();

    const pools = poolStore.getPrivatePools();

    useEffect(() => {
        dashboardStore.fetchTotalVolume();
        dashboardStore.fetchVolume24H();
        dashboardStore.fetchCurrentPrices();
    });

    function calcTVL() {
        let TVL = bnum(0);
        pools.forEach(pool => {
            const poolLiquidity = marketStore.getPortfolioValue(pool);
            TVL = TVL.plus(bnum(poolLiquidity));
        });
        return TVL;
    }

    const feeText = '-';

    const { totalVolume, volume24H, Pies, totalFeesGenerated } = dashboardStore;
    const dataBtc = Pies[BTC];
    const dataUsd = Pies[USD];
    const totalVolumeText = formatCurrency(bnum(totalVolume));
    const volumeText = formatCurrency(bnum(volume24H));
    const textTVL = formatCurrency(calcTVL());

    return (
        <PoolViewWrapper>
            Dashboard
            <InfoPanelWrapper>
                <InfoPanel text={`$ ${textTVL}`} subText="Total Value Locked" />
                <InfoPanel
                    text={`$ ${volumeText}`}
                    subText="Trade Volume (24hr)"
                />
                <InfoPanel
                    text={`$ ${totalVolumeText}`}
                    subText="Total Volume "
                />
                <InfoPanel
                    text={`$ ${formatCurrency(totalFeesGenerated)}`}
                    subText="Fees Generated "
                />
            </InfoPanelWrapper>
            USD++
            <InfoPanelWrapper>
                <InfoPanel
                    text={`$ ${formatCurrency(bnum(dataUsd.current_price))}`}
                    subText="USD++ Price"
                />
                <InfoPanel
                    text={`$ ${formatCurrency(bnum(dataUsd.market_cap))}`}
                    subText="USD++ Market Cap"
                />
                <InfoPanel
                    text={`$ ${formatCurrency(bnum(dataUsd.total_volume))}`}
                    subText="USD++ 24H Volume"
                />
                <InfoPanel
                    text={`$ ${formatCurrency(
                        bnum(dataUsd.totalFeesGenerated)
                    )}`}
                    subText={`Fees Generated (${formatFee(
                        bnum(dataUsd.swapFee)
                    )})`}
                />
            </InfoPanelWrapper>
            BTC++
            <InfoPanelWrapper>
                <InfoPanel
                    text={`$ ${formatCurrency(bnum(dataBtc.current_price))}`}
                    subText="BTC++ Price"
                />
                <InfoPanel
                    text={`$ ${formatCurrency(bnum(dataBtc.market_cap))}`}
                    subText="BTC++ Market Cap"
                />
                <InfoPanel
                    text={`$ ${formatCurrency(bnum(dataBtc.total_volume))}`}
                    subText="BTC++ 24H Volume"
                />
                <InfoPanel
                    text={`$ ${formatCurrency(
                        bnum(dataBtc.totalFeesGenerated)
                    )}`}
                    subText={`Fees Generated (${formatFee(
                        bnum(dataBtc.swapFee)
                    )})`}
                />
            </InfoPanelWrapper>
        </PoolViewWrapper>
    );
});

export default withRouter(Dashboard);
