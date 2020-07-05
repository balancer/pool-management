import { BigNumber } from 'utils/bignumber';
import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { getSupportedChainId, SUBGRAPH_URLS } from 'provider/connectors';
import { bnum } from 'utils/helpers';

const chainId = getSupportedChainId();
const SUBGRAPH_URL = SUBGRAPH_URLS[chainId];
const PIEs = require('provider/PIEs.json');

interface CoinGeckoResponse {
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    circulating_supply: number;
    current_price: number;
    high_24h: number;
    id: string;
    image: string;
    last_updated: string;
    low_24h: number;
    market_cap: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    market_cap_rank: number;
    name: string;
    price_change_24h: number;
    price_change_percentage_24h: number;
    roi?: any;
    symbol: string;
    total_supply: number;
    total_volume: number;
}

interface CoinInfo {
    current_price: number;
    last_updated: string;
    low_24h: number;
    market_cap: number;
    market_cap_change_percentage_24h: number;
    price_change_percentage_24h: number;
    total_supply: number;
    total_volume: number;
    swapFee: number;
}

export default class DashboardStore {
    rootStore: RootStore;
    totalVolume: number;
    totalFeesGenerated: BigNumber;
    volume24H: number;
    TVL: BigNumber;
    dataBtc: CoinInfo;
    dataUsd: CoinInfo;
    Pies: any;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.totalVolume = 0;
        this.volume24H = 0;
        this.TVL = bnum(0);
        this.totalFeesGenerated = bnum(0);
        this.Pies = {};

        PIEs.forEach(p => {
            this.Pies[p.address.toLowerCase()] = {
                current_price: 0,
                last_updated: '',
                low_24h: 0,
                market_cap: 0,
                market_cap_change_percentage_24h: 0,
                price_change_percentage_24h: 0,
                total_supply: 0,
                total_volume: 0,
                swapFee: 0,
                totalFeesGenerated: 0,
            };
        });
    }

    @action async fetchTotalVolume() {
        const query = `{
                pools (
                    where: {
                        finalized: false,
                        id_in: ${JSON.stringify(
                            PIEs.map(p => p.address.toLowerCase())
                        )}
                    },
                    orderBy: liquidity,
                    orderDirection: desc,
                ) {
                    id
                    totalSwapVolume
                    swapFee
                }
        }`;

        const response = await fetch(SUBGRAPH_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
            }),
        });

        const payload = await response.json();
        this.totalVolume = payload.data.pools.reduce(
            (accumulator, currentValue) =>
                bnum(currentValue.totalSwapVolume).plus(bnum(accumulator)),
            0
        );

        this.totalFeesGenerated = payload.data.pools.reduce(
            (accumulator, currentValue) => {
                const generated = bnum(
                    currentValue.totalSwapVolume
                ).multipliedBy(bnum(currentValue.swapFee));

                this.Pies[currentValue.id.toLowerCase()].swapFee =
                    currentValue.swapFee;
                this.Pies[
                    currentValue.id.toLowerCase()
                ].totalFeesGenerated = generated;

                return bnum(accumulator).plus(generated);
            },
            0
        );
    }

    @action async fetchVolume24H() {
        const ts = Math.round(new Date().getTime() / 1000);
        const tsYesterday = ts - 24 * 3600;
        const query = `{
                pools (
                    where: {
                        finalized: false,
                        id_in: ${JSON.stringify(
                            PIEs.map(p => p.address.toLowerCase())
                        )}
                    },
                    orderBy: liquidity,
                    orderDirection: desc,
                ) {
                    id
                    totalSwapVolume
                    swaps (
                        first: 1,
                        orderBy: timestamp,
                        orderDirection: desc,
                        where: {
                            timestamp_lt: ${tsYesterday}
                        }
                    ) {
                        poolTotalSwapVolume
                    }
                }
        }`;

        const response = await fetch(SUBGRAPH_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
            }),
        });

        const payload = await response.json();
        const lastSwapsVolume = payload.data.pools.map(pool => {
            return pool.swaps[0]
                ? bnum(pool.totalSwapVolume).minus(
                      pool.swaps[0].poolTotalSwapVolume
                  )
                : bnum(0);
        });

        this.volume24H = lastSwapsVolume.reduce(
            (accumulator, currentValue) => currentValue.plus(accumulator),
            0
        );
    }

    async fetchCurrentPrices() {
        PIEs.forEach(async p => {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${p.coingeckoId}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );
            let payload = await response.json();
            payload = payload[0];

            this.Pies[p.address.toLowerCase()].current_price =
                payload.current_price;
            this.Pies[p.address.toLowerCase()].last_updated =
                payload.last_updated;
            this.Pies[p.address.toLowerCase()].low_24h = payload.low_24h;
            this.Pies[p.address.toLowerCase()].market_cap = payload.market_cap;
            this.Pies[
                p.address.toLowerCase()
            ].market_cap_change_percentage_24h =
                payload.market_cap_change_percentage_24h;
            this.Pies[p.address.toLowerCase()].price_change_percentage_24h =
                payload.price_change_percentage_24h;
            this.Pies[p.address.toLowerCase()].total_supply =
                payload.total_supply;
            this.Pies[p.address.toLowerCase()].total_volume =
                payload.total_volume;
        });
    }
}
