import fetch from 'isomorphic-fetch';
import { getAddress } from 'ethers/utils';
import { Pool, PoolToken, Swap } from '../types';
import { bnum } from '../utils/helpers';
import { getSupportedChainId, SUBGRAPH_URLS } from './connectors';

const chainId = getSupportedChainId();
const SUBGRAPH_URL = SUBGRAPH_URLS[chainId];

enum QueryType {
    SHARED_POOLS,
    PRIVATE_POOLS,
    CONTRIBUTED_POOLS,
    SINGLE_POOL,
}

export async function fetchSharedPools(
    pageIncrement: number,
    skip: number
): Promise<Pool[]> {
    const query = getPoolQuery(QueryType.SHARED_POOLS, pageIncrement, skip);
    const rawPools = await fetchPools(query);
    const pools = processPools(rawPools);
    return pools;
}

export async function fetchPrivatePools(): Promise<Pool[]> {
    const query = getPoolQuery(QueryType.PRIVATE_POOLS, 100, 0);
    const rawPools = await fetchPools(query);
    const pools = processPools(rawPools);
    return pools;
}

export async function fetchContributedPools(account: string): Promise<Pool[]> {
    const query = getPoolQuery(QueryType.CONTRIBUTED_POOLS, 100, 0, account);
    const rawPools = await fetchPools(query);
    const pools = processPools(rawPools);
    return pools;
}

export async function fetchPool(address: string): Promise<Pool> {
    const ts = Math.round(new Date().getTime() / 1000);
    const tsYesterday = ts - 24 * 3600;
    const query = `
        {
            pool(id: "${address.toLowerCase()}") {
                id
                publicSwap
                finalized
                swapFee
                totalWeight
                totalShares
                totalSwapVolume
                tokensList
                tokens {
                    id
                    address
                    balance
                    decimals
                    symbol
                    denormWeight
                }
                swaps (
                    first: 1,
                    orderBy: timestamp,
                    orderDirection: desc,
                    where: {
                        timestamp_lt: ${tsYesterday}
                    }
                ) {
                    tokenIn
                    tokenInSym
                    tokenAmountIn
                    tokenOut
                    tokenOutSym
                    tokenAmountOut
                    poolTotalSwapVolume
                }
            }
        }
    `;
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
    const rawPool = payload.data.pool;
    const pools = processPools([rawPool]);
    const pool = pools[0];
    return pool;
}

export async function fetchPoolSwaps(
    poolAddress: string,
    pageIncrement: number,
    skip: number
): Promise<any[]> {
    const query = `
        {
            swaps(where: {poolAddress: "${poolAddress.toLowerCase()}"}, first: ${pageIncrement} , skip: ${skip}, orderBy: timestamp, orderDirection: desc) {
                id
                timestamp
                tokenIn
                tokenInSym
                tokenAmountIn
                tokenOut
                tokenOutSym
                tokenAmountOut
            }
        }
    `;

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

    const { data } = await response.json();
    return data.swaps;
}

function getPoolQuery(
    type: QueryType,
    pageIncrement: number,
    skip: number,
    account?: string
): string {
    const ts = Math.round(new Date().getTime() / 1000);
    const tsYesterday = ts - 24 * 3600;
    const poolFields = `
        id
        publicSwap
        finalized
        swapFee
        totalWeight
        totalShares
        totalSwapVolume
        tokensList
        tokens {
            id
            address
            balance
            decimals
            symbol
            denormWeight
        }
        swaps (
            first: 1,
            orderBy: timestamp,
            orderDirection: desc,
            where: {
                timestamp_lt: ${tsYesterday}
            }
        ) {
            tokenIn
            tokenInSym
            tokenAmountIn
            tokenOut
            tokenOutSym
            tokenAmountOut
            poolTotalSwapVolume
        }
    `;
    if (type === QueryType.SHARED_POOLS) {
        return `
            {
                pools (
                    first: ${pageIncrement},
                    skip: ${skip},
                    where: {
                        finalized: true,
                    },
                    orderBy: liquidity,
                    orderDirection: desc,
                ) {
                    ${poolFields}
                }
            }
        `;
    }
    if (type === QueryType.PRIVATE_POOLS) {
        return `
            {
                pools (
                    first: ${pageIncrement},
                    skip: ${skip},
                    where: {
                        finalized: false,
                    },
                    orderBy: liquidity,
                    orderDirection: desc,
                ) {
                    ${poolFields}
                }
            }
        `;
    }
    if (type === QueryType.CONTRIBUTED_POOLS) {
        return `
            {
                poolShares(where: {
                    userAddress: "${account.toLowerCase()}"
                }) {
                    poolId {
                        ${poolFields}
                    }
                }
            }
        `;
    }
}

async function fetchPools(query: string) {
    const EXPONENTIAL_BACKOFF_FACTOR = 2;
    let delay = 1000;

    let pools;
    while (!pools) {
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
        if (payload.errors) {
            await sleep(delay);
            delay *= EXPONENTIAL_BACKOFF_FACTOR;
            continue;
        }
        pools = payload.data.pools
            ? payload.data.pools
            : payload.data.poolShares.map(poolShare => poolShare.poolId);
    }
    return pools;
}

function processPools(rawPools): Pool[] {
    return rawPools.map(pool => {
        const tokensList = pool.tokensList
            ? pool.tokensList.map(tokenAddress => {
                  return getAddress(tokenAddress);
              })
            : [];
        const processedPool: Pool = {
            address: getAddress(pool.id),
            publicSwap: pool.publicSwap,
            finalized: pool.finalized,
            swapFee: bnum(pool.swapFee),
            totalWeight: bnum(pool.totalWeight),
            totalShares: bnum(pool.totalShares),
            totalSwapVolume: bnum(pool.totalSwapVolume),
            tokensList,
            tokens: pool.tokens.map(token => {
                return {
                    address: getAddress(token.address),
                    balance: bnum(token.balance),
                    decimals: token.decimals,
                    denormWeight: bnum(token.denormWeight),
                    denormWeightProportion: bnum(token.denormWeight).div(
                        bnum(pool.totalWeight)
                    ),
                    symbol: token.symbol,
                } as PoolToken;
            }),
            shares: [],
            // shares: pool.shares.map(share => {
            //     return {
            //         account: getAddress(share.userAddress.id),
            //         balance: bnum(share.balance),
            //         balanceProportion: bnum(share.balance).div(
            //             bnum(pool.totalShares)
            //         ),
            //     } as PoolShare;
            // }),
            swaps: pool.swaps.map(swap => {
                return {
                    tokenIn: getAddress(swap.tokenIn),
                    tokenAmountIn: bnum(swap.tokenAmountIn),
                    tokenInSym: swap.tokenInSym,
                    tokenOut: getAddress(swap.tokenOut),
                    tokenAmountOut: bnum(swap.tokenAmountOut),
                    tokenOutSym: swap.tokenOutSym,
                    poolTotalSwapVolume: bnum(swap.poolTotalSwapVolume),
                } as Swap;
            }),
        };

        processedPool.lastSwapVolume = processedPool.swaps[0]
            ? processedPool.totalSwapVolume.minus(
                  processedPool.swaps[0].poolTotalSwapVolume
              )
            : bnum(0);

        return processedPool;
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
