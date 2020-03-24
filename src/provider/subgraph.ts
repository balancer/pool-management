import fetch from 'isomorphic-fetch';
import { getAddress } from 'ethers/utils';
import { NumberMap, Pool, PoolShare, PoolToken, PoolSwaps } from '../types';
import { bnum } from '../utils/helpers';
import {getSupportedChainId, SUBGRAPH_URLS} from "./connectors";
import RootStore from 'stores/Root';

const chainId = getSupportedChainId();
const SUBGRAPH_URL =
    SUBGRAPH_URLS[chainId];

function processSwapsLive(data, rootStore: RootStore): PoolSwaps[] {
    var poolSwaps: PoolSwaps[] = [];

    for (var swap in data.swaps) {
        let swapPoolAddress = data.swaps[swap].poolAddress.id;
        let swapTokenIn = data.swaps[swap].tokenIn;
        let swapTokenInSymbol = data.swaps[swap].tokenInSym;
        let swapTokenAmountIn = data.swaps[swap].tokenAmountIn;
        let swapTokenOut = data.swaps[swap].tokenOut;
        let swapTokenAmountOut = data.swaps[swap].tokenAmountOut;
        let swapTokenOutSymbol = data.swaps[swap].tokenOutSym;

        let tokenToCount = swapTokenIn;
        let tokenCount = swapTokenAmountIn;
        let tokenSymbol = swapTokenInSymbol;

        const { marketStore } = rootStore;
        var hasPrice = true;
        try {
          marketStore.getAssetPrice(tokenSymbol);
        } catch (error) {
          console.log(`!!!!!!! Error getting asset price: ${tokenSymbol}: ${tokenToCount}`);
          hasPrice = false;
        }

        if(tokenSymbol == '' || !hasPrice){
          tokenToCount = swapTokenOut;
          tokenCount = swapTokenAmountOut;
          tokenSymbol = swapTokenOutSymbol;
          console.log(`!!!!!!! In token price issue ${swapTokenInSymbol} ${swapTokenIn}. Try Out: ${swapTokenOutSymbol} ${swapTokenOut}`);
        }

        var pool = poolSwaps.find(
            poolSwap => poolSwap.poolAddress == swapPoolAddress
        );

        if (pool) {
            // Add token volume for pool
            var tokenVolume = pool.tokenVolumes.find(
                token => token.tokenAddress == tokenToCount
            );
            if (tokenVolume) {
                tokenVolume.totalVolume = tokenVolume.totalVolume.plus(
                    bnum(tokenCount)
                );
            } else {
                pool.tokenVolumes.push({
                    tokenAddress: tokenToCount,
                    totalVolume: bnum(tokenCount),
                    tokenSymbol: tokenSymbol
                });
            }
        } else {
            poolSwaps.push({
                poolAddress: swapPoolAddress,
                tokenVolumes: [
                    {
                        tokenAddress: tokenToCount,
                        totalVolume: bnum(tokenCount),
                        tokenSymbol: tokenSymbol
                    },
                ],
            });
        }
    }

    return poolSwaps;
}

async function fetchSwaps(rootStore: RootStore): Promise<PoolSwaps[]> {

  var ts = Math.round((new Date()).getTime() / 1000);
  var tsYesterday = ts - (24 * 3600);

  const query = `
      {
        swaps (where: {timestamp_gt: ${tsYesterday}}){
          id
          poolAddress {
            id
          }
          caller
          tokenIn
          tokenInSym
          tokenAmountIn
          tokenOut
          tokenOutSym
          tokenAmountOut
          timestamp
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

  var poolSwaps: PoolSwaps[] = processSwapsLive(data, rootStore);

  return poolSwaps;
}

export async function fetchPublicPools(tokenIndex: NumberMap, rootStore: RootStore): Promise<Pool[]> {
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

    var allSwaps = await fetchSwaps(rootStore);

    return data.pools.map(pool => {

        var poolSwaps = allSwaps.find(swap => swap.poolAddress == pool.id);
        if(!poolSwaps){
          poolSwaps = {poolAddress: pool.id, tokenVolumes: []};
        }

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
            swaps: poolSwaps
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
