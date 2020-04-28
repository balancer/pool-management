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
    // !!!!!!! Add real query
    const swaps = [
        {
            timestamp: 1588084510,
            tokenAmountIn: '0.113651902640757892',
            tokenAmountOut: '0.195755569115769796',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1588075288,
            tokenAmountIn: '2.03800893566648832',
            tokenAmountOut: '3.518613300579654482',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1588057027,
            tokenAmountIn: '0.554490970293730525',
            tokenAmountOut: '0.96005814427151034',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1588048040,
            tokenAmountIn: '5.582029364208308621',
            tokenAmountOut: '3.220546672338239347',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1588047944,
            tokenAmountIn: '3.849332499529089159',
            tokenAmountOut: '2.234257915036880948',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1588036809,
            tokenAmountIn: '1.488004665297916784',
            tokenAmountOut: '2.551292107062423516',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1588014194,
            tokenAmountIn: '2.19737997519359617',
            tokenAmountOut: '3.7828503523413075',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1588014034,
            tokenAmountIn: '3.721100582740134216',
            tokenAmountOut: '6.447823863922942967',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1588013526,
            tokenAmountIn: '3.688470729879325863',
            tokenAmountOut: '6.443666524087490137',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1588008187,
            tokenAmountIn: '1.211845427054507862',
            tokenAmountOut: '2.128533429195135758',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587998977,
            tokenAmountIn: '4.845828867951707998',
            tokenAmountOut: '2.752581611402577376',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587998481,
            tokenAmountIn: '1.167281588437205522',
            tokenAmountOut: '0.665563881473743202',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587942791,
            tokenAmountIn: '0.822105532580571798',
            tokenAmountOut: '0.469338989867885966',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587933427,
            tokenAmountIn: '1.252113607603912847',
            tokenAmountOut: '2.186354952015639307',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587933003,
            tokenAmountIn: '1.248601343733985092',
            tokenAmountOut: '2.186244132847333641',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587931954,
            tokenAmountIn: '0.580995109093511582',
            tokenAmountOut: '1.019351584568887932',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587913988,
            tokenAmountIn: '5.977687263839491427',
            tokenAmountOut: '3.404112240150321254',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587911543,
            tokenAmountIn: '2.130276299254616142',
            tokenAmountOut: '1.219351484770730807',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587906684,
            tokenAmountIn: '0.578086693511681266',
            tokenAmountOut: '1.005201365505272624',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587906578,
            tokenAmountIn: '5.607001426826647126',
            tokenAmountOut: '3.221090770287211024',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587895780,
            tokenAmountIn: '6.991340525553401439',
            tokenAmountOut: '4.04873969698656227',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587894852,
            tokenAmountIn: '1.928032327809534686',
            tokenAmountOut: '3.308255252355027505',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587894717,
            tokenAmountIn: '6.241499712810119618',
            tokenAmountOut: '3.629820505565154414',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587893706,
            tokenAmountIn: '12.412173872948024755',
            tokenAmountOut: '7.305845719009181855',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587879023,
            tokenAmountIn: '2.157499606683899278',
            tokenAmountOut: '1.281945235775933902',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587875102,
            tokenAmountIn: '2.157167963927894132',
            tokenAmountOut: '1.285360549769649185',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587866729,
            tokenAmountIn: '1.697784820708612806',
            tokenAmountOut: '1.014185918246827081',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587861969,
            tokenAmountIn: '2.079617748358116766',
            tokenAmountOut: '1.245354231381740565',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587860475,
            tokenAmountIn: '0.25',
            tokenAmountOut: '0.149938054025520478',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587860016,
            tokenAmountIn: '3.65300150161210954',
            tokenAmountOut: '2.196530314680580381',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587859783,
            tokenAmountIn: '1.6606433934',
            tokenAmountOut: '1.002031642764160184',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587859749,
            tokenAmountIn: '13.119812916946904476',
            tokenAmountOut: '21.945518328762639797',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587850762,
            tokenAmountIn: '2.931379313179744246',
            tokenAmountOut: '1.723944775632422064',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587848800,
            tokenAmountIn: '0.390876584651740892',
            tokenAmountOut: '0.230368526658278756',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587845884,
            tokenAmountIn: '4.477942593717796352',
            tokenAmountOut: '7.597443378704267069',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587845884,
            tokenAmountIn: '0.5570844291',
            tokenAmountOut: '0.328527157581774402',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587834935,
            tokenAmountIn: '0.462147510787059',
            tokenAmountOut: '0.270054438537563252',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587829886,
            tokenAmountIn: '2.394972532599883026',
            tokenAmountOut: '4.091741944800436143',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587814620,
            tokenAmountIn: '3.563199647244150296',
            tokenAmountOut: '2.076569418190395111',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587807177,
            tokenAmountIn: '3.7739222604',
            tokenAmountOut: '2.209807654884097086',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587807111,
            tokenAmountIn: '2.3744362554',
            tokenAmountOut: '1.395882055279740797',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587805178,
            tokenAmountIn: '2.2852024448201144',
            tokenAmountOut: '1.347490344759117122',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587800700,
            tokenAmountIn: '2.282488843032345136',
            tokenAmountOut: '1.349893378321945609',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
        {
            timestamp: 1587795577,
            tokenAmountIn: '2.301511233513210016',
            tokenAmountOut: '3.880046295953623805',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587793839,
            tokenAmountIn: '3.15127682875981344',
            tokenAmountOut: '5.344564440892428828',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587792908,
            tokenAmountIn: '1.769812792051740426',
            tokenAmountOut: '3.017886959136197604',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587792295,
            tokenAmountIn: '3.633797798000284672',
            tokenAmountOut: '6.233372650477852441',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587792196,
            tokenAmountIn: '3.140858787214623791',
            tokenAmountOut: '5.428211725635846547',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587792111,
            tokenAmountIn: '2.307321578119066825',
            tokenAmountOut: '4.011724111411508215',
            tokenIn: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenInSym: 'MKR',
            tokenOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenOutSym: 'WETH',
        },
        {
            timestamp: 1587791423,
            tokenAmountIn: '2.869341306300000256',
            tokenAmountOut: '1.642499943334510315',
            tokenIn: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            tokenInSym: 'WETH',
            tokenOut: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
            tokenOutSym: 'MKR',
        },
    ];

    return swaps;
    /*
    // Returns all swaps for all pools in last 24hours
    var ts = Math.round((new Date()).getTime() / 1000);
    var tsYesterday = ts - (24 * 3600);

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
                    tokenOutSym: swap.tokenOutSym
                } as Swap
            })
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
    */
}
