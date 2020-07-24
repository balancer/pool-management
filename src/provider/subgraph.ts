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

class QueryParams {
    pageIncrement?: number;
    skip?: number;
    account?: string;
    tokens?: string[];
    address?: string;
}

export async function fetchSharedPools(
    pageIncrement: number,
    skip: number,
    tokens?: string[]
): Promise<Pool[]> {
    const params = {
        pageIncrement,
        skip,
        tokens,
    };
    const query = getPoolQuery(QueryType.SHARED_POOLS, params);
    const rawPools = await fetchPools(query);
    const pools = processPools(rawPools);
    return pools;
}

export async function fetchPrivatePools(): Promise<Pool[]> {
    const params = {
        pageIncrement: 100,
        skip: 0,
    };
    const query = getPoolQuery(QueryType.PRIVATE_POOLS, params);
    const rawPools = await fetchPools(query);
    const pools = processPools(rawPools);
    return pools;
}

export async function fetchContributedPools(account: string): Promise<Pool[]> {
    const params = {
        pageIncrement: 100,
        skip: 0,
        account,
    };
    const query = getPoolQuery(QueryType.CONTRIBUTED_POOLS, params);
    const rawPools = await fetchPools(query);
    const pools = processPools(rawPools);
    return pools;
}

export async function fetchPool(address: string): Promise<Pool> {
    const params = {
        address,
    };
    const query = getPoolQuery(QueryType.SINGLE_POOL, params);
    const rawPools = await fetchPools(query);
    const pools = processPools(rawPools);
    return pools[0];
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

function getPoolQuery(type: QueryType, params: QueryParams): string {
    const ts = Math.round(new Date().getTime() / 1000);
    const tsYesterday = Math.round((ts - 24 * 3600) / 1000) * 1000;
    const { tokens } = params;
    const tokenStr = tokens
        ? `, tokensList_contains: ${JSON.stringify(
              tokens.map(token => token.toLowerCase())
          )}`
        : '';
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
        const { pageIncrement, skip } = params;
        return `
            {
                pools (
                    first: ${pageIncrement},
                    skip: ${skip},
                    where: {
                        finalized: true,
                        tokensList_not: []
                        ${tokenStr}
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
        const { pageIncrement, skip } = params;
        return `
            {
                pools (
                    first: ${pageIncrement},
                    skip: ${skip},
                    where: {
                        finalized: false,
                        tokensList_not: []
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
        const { account } = params;
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
    if (type === QueryType.SINGLE_POOL) {
        const { address } = params;
        return `
            {
                pool(id: "${address.toLowerCase()}") {
                    ${poolFields}
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
        const { data } = payload;
        if (data.pools) {
            pools = data.pools;
        }
        if (data.poolShares) {
            pools = data.poolShares.map(poolShare => poolShare.poolId);
        }
        if (data.pool) {
            pools = [data.pool];
        }
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
            lastSwapVolume: pool.swaps[0]
                ? bnum(pool.totalSwapVolume).minus(
                      pool.swaps[0].poolTotalSwapVolume
                  )
                : bnum(pool.totalSwapVolume),
        };

        return processedPool;
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
