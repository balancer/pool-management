import fetch from 'isomorphic-fetch';
import { getAddress } from 'ethers/utils';
import { NumberMap, Pool, PoolShare, PoolToken, PoolSwaps } from '../types';
import { bnum } from '../utils/helpers';
import {getSupportedChainId, SUBGRAPH_URLS} from "./connectors";

const chainId = getSupportedChainId();
const SUBGRAPH_URL =
    SUBGRAPH_URLS[chainId];

function processSwapsTest(data): PoolSwaps[] {
  var poolSwaps: PoolSwaps[] = [
    {
      poolAddress: '0x165021f95efb42643e9c3d8677c3430795a29806',
      tokenVolumes: [
        {
            tokenAddress: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
            totalVolume: bnum(20),
        },
        {
            tokenAddress: '0x1528F3FCc26d13F7079325Fb78D9442607781c8C',
            totalVolume: bnum(7000),
        }
      ]
    },
    {
      poolAddress: '0x208a560d57e25c74b4052c9bad253bbaf507f126',
      tokenVolumes: [
        {
            tokenAddress: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
            totalVolume: bnum(0.1111111111111),
        },
        {
            tokenAddress: '0x1528F3FCc26d13F7079325Fb78D9442607781c8C',
            totalVolume: bnum(0.6666666666666),
        }
      ]
    }];

  return poolSwaps;
}

function coinGeckoList(TokenAddress) {
    var allowed = [
        '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE',
        '0x1528f3fcc26d13f7079325fb78d9442607781c8c',
        '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    ];

    var isAvailable = allowed.find(address => address == TokenAddress);
    isAvailable = 'true';
    // !!!!!!!
    return isAvailable;
}

function processSwapsLive(data): PoolSwaps[] {
    var poolSwaps: PoolSwaps[] = [];

    for (var swap in data.swaps) {
        let swapPoolAddress = data.swaps[swap].poolAddress.id;
        let swapTokenIn = data.swaps[swap].tokenIn;
        let swapTokenAmountIn = data.swaps[swap].tokenAmountIn;
        let swapTokenOut = data.swaps[swap].tokenOut;
        let swapTokenAmountOut = data.swaps[swap].tokenAmountOut;

        let tokenToCount = swapTokenIn;
        let tokenCount = swapTokenAmountIn;

        if (!coinGeckoList(swapTokenIn)) {
            tokenToCount = swapTokenOut;
            tokenCount = swapTokenAmountOut;
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
                });
            }
        } else {
            poolSwaps.push({
                poolAddress: swapPoolAddress,
                tokenVolumes: [
                    {
                        tokenAddress: tokenToCount,
                        totalVolume: bnum(tokenCount),
                    },
                ],
            });
        }
    }

    return poolSwaps;
}

async function fetchSwaps(): Promise<PoolSwaps[]> {

  console.log('!!!! fetchSwaps');

  // !!! ADD TIMESTAMP CHECK TOO

  var ts = Math.round((new Date()).getTime() / 1000);

  const query = `
      {
        swaps{
          id
          poolAddress {
            id
          }
          caller
          tokenIn
          tokenAmountIn
          tokenOut
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

  // !!!!!!!
  var poolSwaps: PoolSwaps[] = processSwapsTest(data);
  // var poolSwaps: PoolSwaps[] = processSwapsLive(data);

  return poolSwaps;
}

export async function fetchPublicPools(tokenIndex: NumberMap): Promise<Pool[]> {
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

    console.log('!!!!!!! FETCH PUBLIC POOLS');
    var allSwaps = await fetchSwaps();

    return data.pools.map(pool => {

        var poolSwaps = allSwaps.find(swap => swap.poolAddress == pool.id);

        if(poolSwaps){
          console.log('\n\nPool Has Swaps!!' + pool.id);
          console.log(poolSwaps)
        }
        else{
          console.log('\n\nPool Has No Swaps!!' + pool.id);
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
