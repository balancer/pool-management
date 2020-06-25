import fetch from 'isomorphic-fetch';
import { getAddress } from 'ethers/utils';
import { Pool, PoolToken } from '../types';
import { bnum } from '../utils/helpers';
import { getSupportedChainId, SUBGRAPH_URLS } from './connectors';

const chainId = getSupportedChainId();
const SUBGRAPH_URL = SUBGRAPH_URLS[chainId];

enum QueryType {
    SHARED_POOLS,
    PRIVATE_POOLS,
    CONTRIBUTED_POOLS,
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

export async function fetchPrivatePools(
    pageIncrement: number,
    skip: number
): Promise<Pool[]> {
    const query = getPoolQuery(QueryType.PRIVATE_POOLS, pageIncrement, skip);
    const rawPools = await fetchPools(query);
    const pools = processPools(rawPools);
    return pools;
}

export async function fetchContributedPools(account: string): Promise<Pool[]> {
    const query = getPoolQuery(QueryType.CONTRIBUTED_POOLS, 1000, 0, account);
    const rawPools = await fetchPools(query);
    const pools = processPools(rawPools);
    return pools;
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
    const poolFields = `
        id
        publicSwap
        finalized
        swapFee
        totalWeight
        totalShares
        tokensList
        tokens {
            id
            address
            balance
            decimals
            symbol
            denormWeight
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
                    userAddress: "0x72aa5ad78fb4f2e567a5df833dad12f60b52db63"
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
    const pools = payload.data.pools
        ? payload.data.pools
        : payload.data.poolShares.map(poolShare => poolShare.poolId);
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
            swaps: [],
            // shares: pool.shares.map(share => {
            //     return {
            //         account: getAddress(share.userAddress.id),
            //         balance: bnum(share.balance),
            //         balanceProportion: bnum(share.balance).div(
            //             bnum(pool.totalShares)
            //         ),
            //     } as PoolShare;
            // }),
            // swaps: pool.swaps.map(swap => {
            //     return {
            //         tokenIn: getAddress(swap.tokenIn),
            //         tokenAmountIn: bnum(swap.tokenAmountIn),
            //         tokenInSym: swap.tokenInSym,
            //         tokenOut: getAddress(swap.tokenOut),
            //         tokenAmountOut: bnum(swap.tokenAmountOut),
            //         tokenOutSym: swap.tokenOutSym,
            //     } as Swap;
            // }),
        };

        return processedPool;
    });
}
