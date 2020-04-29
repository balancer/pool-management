import fetch from 'isomorphic-fetch';
import { getAddress } from 'ethers/utils';
import { NumberMap, Pool, PoolShare, PoolToken, Swap } from '../types';
import { bnum } from '../utils/helpers';
import { getSupportedChainId, SUBGRAPH_URLS } from './connectors';

const chainId = getSupportedChainId();
const SUBGRAPH_URL = SUBGRAPH_URLS[chainId];

export async function fetchPublicPools(tokenIndex: NumberMap): Promise<Pool[]> {
    // Returns all swaps for all pools in last 24hours
    var ts = Math.round(new Date().getTime() / 1000);
    var tsYesterday = ts - 24 * 3600;

    const query = `
        {
          pools (where: {finalized: true}) {
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
            shares {
              id
              poolId {
                id
              }
              userAddress {
                id
              }
              balance
            }

            swaps(where: {timestamp_gt: ${tsYesterday}}) {
              tokenIn
              tokenInSym
              tokenAmountIn
              tokenOut
              tokenOutSym
              tokenAmountOut
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

    const { data } = await response.json();

    return data.pools.map(pool => {
        const parsedPool: Pool = {
            address: getAddress(pool.id),
            publicSwap: pool.publicSwap,
            finalized: pool.finalized,
            swapFee: bnum(pool.swapFee),
            totalWeight: bnum(pool.totalWeight),
            totalShares: bnum(pool.totalShares),
            tokensList: pool.tokensList.map(tokenAddress => {
                return getAddress(tokenAddress);
            }),
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
            shares: pool.shares.map(share => {
                return {
                    account: getAddress(share.userAddress.id),
                    balance: bnum(share.balance),
                    balanceProportion: bnum(share.balance).div(
                        bnum(pool.totalShares)
                    ),
                } as PoolShare;
            }),
            swaps: pool.swaps.map(swap => {
                return {
                    tokenIn: getAddress(swap.tokenIn),
                    tokenAmountIn: bnum(swap.tokenAmountIn),
                    tokenInSym: swap.tokenInSym,
                    tokenOut: getAddress(swap.tokenOut),
                    tokenAmountOut: bnum(swap.tokenAmountOut),
                    tokenOutSym: swap.tokenOutSym,
                } as Swap;
            }),
        };

        parsedPool.tokensList = parsedPool.tokensList.sort((a, b) => {
            const aKnown = !!tokenIndex[a];
            const bKnown = !!tokenIndex[b];
            if (aKnown && bKnown) {
                return tokenIndex[a] < tokenIndex[b] ? -1 : 1;
            } else if (aKnown && !bKnown) {
                return -1;
            } else if (!aKnown && bKnown) {
                return 1;
            } else {
                // Both unknown, sort by address
                return a.localeCompare(b);
            }
        });

        parsedPool.tokens = parsedPool.tokens.sort((a, b) => {
            const aKnown = !!tokenIndex[a.symbol];
            const bKnown = !!tokenIndex[b.symbol];
            if (aKnown && bKnown) {
                return tokenIndex[a.symbol] < tokenIndex[b.symbol] ? -1 : 1;
            } else if (aKnown && !bKnown) {
                return -1;
            } else if (!aKnown && bKnown) {
                return 1;
            } else {
                // Both unknown, sort by address
                return a.address.localeCompare(b.address);
            }
        });

        return parsedPool;
    });
}

export async function fetchPoolSwaps(
    poolAddress: string,
    startIndex: number,
    stopIndex: number
): Promise<any[]> {
    const query = `
      {
        pools(where: {id: "${poolAddress.toLowerCase()}"}) {
          swaps(first: ${stopIndex} , skip: ${startIndex}, orderBy: timestamp, orderDirection: desc) {
            timestamp
            tokenIn
            tokenInSym
            tokenAmountIn
            tokenOut
            tokenOutSym
            tokenAmountOut
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

    const { data } = await response.json();
    console.log(data);
    if (data.pools.length > 0) return data.pools[0].swaps;
    else return [];
}
