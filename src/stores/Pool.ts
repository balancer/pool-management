import RootStore from 'stores/Root';
import { action, observable } from 'mobx';
import { fetchPublicPools } from 'provider/subgraph';
import { Pool, PoolToken } from 'types';
import { BigNumber } from '../utils/bignumber';
import {
    bnum,
    fromPercentage,
    tinyAddress,
} from '../utils/helpers';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { ContractTypes } from './Provider';
import { getNextTokenColor } from '../utils/tokenColorPicker';

interface PoolData {
    blockLastFetched: number;
    data: Pool;
}

interface PoolMap {
    [index: string]: PoolData;
}

export default class PoolStore {
    @observable pools: PoolMap;
    @observable poolsLoaded: boolean;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.pools = {} as PoolMap;
    }

    @action processUnknownTokens(web3React, pool: Pool): Pool {
        const {
            contractMetadataStore,
            tokenStore,
        } = this.rootStore;
        const { account } = web3React;
        const defaultPrecision = contractMetadataStore.getDefaultPrecision();

        pool.tokens.forEach((token, index) => {
            if (!contractMetadataStore.hasTokenMetadata(token.address)) {
                pool.tokens[token.symbol] = tinyAddress(token.address, 3);

                // We just discovered a new token, so should do an initial fetch for it outside of loop
                if (account && !tokenStore.getBalance(token.address, account)) {
                    tokenStore.fetchTokenBalances(web3React, account, [
                        token.address,
                    ]);
                }

                contractMetadataStore.addTokenMetadata(token.address, {
                    address: token.address,
                    precision: defaultPrecision,
                    chartColor: getNextTokenColor(),
                    decimals: token.decimals,
                    symbol: tinyAddress(token.address, 3),
                    iconAddress: token.address,
                    isSupported: false,
                });
            }
        });
        return pool;
    }

    @action async fetchPublicPools(web3React) {
        const { providerStore, contractMetadataStore } = this.rootStore;
        // The subgraph and local block could be out of sync
        const currentBlock = providerStore.getCurrentBlockNumber();

        console.debug('[fetchPublicPools] Fetch pools');
        const pools = await fetchPublicPools(contractMetadataStore.tokenIndex);

        pools.forEach(pool => {
            const processedPool = this.processUnknownTokens(web3React, pool);
            this.setPool(pool.address, processedPool, currentBlock);
        });
        this.poolsLoaded = true;

        console.debug('[fetchPublicPools] Pools fetched & stored');
    }

    @action private setPool(
        poolAddress: string,
        newPool: Pool,
        blockFetched: number
    ) {
        const poolData = this.getPoolData(poolAddress);
        // If already exists, only overwrite if stale
        if (poolData) {
            if (blockFetched > poolData.blockLastFetched) {
                this.pools[poolAddress] = {
                    blockLastFetched: blockFetched,
                    data: newPool,
                };
            }
        } else {
            this.pools[poolAddress] = {
                blockLastFetched: blockFetched,
                data: newPool,
            };
        }
    }

    getPoolToken(poolAddress: string, tokenAddress: string): PoolToken {
        return this.getPool(poolAddress).tokens.find(
            token => token.address === tokenAddress
        );
    }

    getPoolTokenBalance(poolAddress: string, tokenAddress: string): BigNumber {
        const token = this.getPool(poolAddress).tokens.find(
            token => token.address === tokenAddress
        );
        if (!token) {
            throw new Error(
                `Token ${tokenAddress} not found in pool ${poolAddress}`
            );
        }
        return token.balance;
    }

    getUserLiquidityContribution(
        poolAddress: string,
        tokenAddress: string,
        account: string
    ): BigNumber {
        const userProportion = this.getUserShareProportion(
            poolAddress,
            account
        );
        const poolTokenBalance = this.getPoolTokenBalance(
            poolAddress,
            tokenAddress
        );

        return poolTokenBalance.times(userProportion);
    }

    getUserShare(poolAddress: string, account: string): BigNumber | undefined {
        const { tokenStore } = this.rootStore;
        const userShare = tokenStore.getBalance(poolAddress, account);

        if (userShare) {
            return userShare;
        } else {
            return undefined;
        }
    }

    getUserShareProportion(
        poolAddress: string,
        account: string
    ): BigNumber | undefined {
        const { tokenStore } = this.rootStore;
        const userShare = tokenStore.getBalance(poolAddress, account);
        const totalShares = tokenStore.getTotalSupply(poolAddress);

        if (userShare && totalShares) {
            return userShare.div(totalShares);
        } else {
            return undefined;
        }
    }

    formatZeroMinAmountsOut(poolAddress: string): string[] {
        const pool = this.pools[poolAddress];
        return pool.data.tokens.map(token => '0');
    }

    calcUserLiquidity(
        poolAddress: string,
        account: string
    ): BigNumber | undefined {
        const { marketStore } = this.rootStore;
        const poolValue = marketStore.getPortfolioValue(
            this.getPool(poolAddress)
        );
        const userProportion = this.getUserShareProportion(
            poolAddress,
            account
        );
        if (userProportion) {
            return userProportion.times(poolValue);
        } else {
            return undefined;
        }
    }

    getPoolSymbols(poolAddress: string): string[] {
        return this.getPool(poolAddress).tokens.map(token => token.symbol);
    }

    getPoolBalances(poolAddress: string): BigNumber[] {
        return this.getPool(poolAddress).tokens.map(token => token.balance);
    }

    getPoolData(poolAddress: string): PoolData | undefined {
        if (this.pools[poolAddress]) {
            return this.pools[poolAddress];
        }
        return undefined;
    }

    getPublicPools(filter?: object): Pool[] {
        let pools: Pool[] = [];
        Object.keys(this.pools).forEach(key => {
            if (this.pools[key].data.finalized) {
                pools.push(this.pools[key].data);
            }
        });
        return pools;
    }

    getPool(poolAddress: string): Pool | undefined {
        if (this.pools[poolAddress]) {
            return this.pools[poolAddress].data;
        }
        return undefined;
    }

    calcPoolTokensByRatio(pool: Pool, ratio: BigNumber): BigNumber {
        const { tokenStore } = this.rootStore;
        const totalPoolTokens = tokenStore.getTotalSupply(pool.address);
        // TODO - fix calcs so no buffer is needed
        const buffer = bnum(100)
        return (ratio.times(totalPoolTokens).integerValue(BigNumber.ROUND_DOWN)).minus(buffer);
    }

    getPoolTokenPercentage(poolAddress: string, percentage: string) {
        const totalPoolTokens = this.rootStore.tokenStore.getTotalSupply(
            poolAddress
        );
        return bnum(fromPercentage(percentage)).times(totalPoolTokens);
    }

    getPoolTokens(poolAddress: string): string[] {
        if (!this.pools[poolAddress]) {
            throw new Error(`Pool ${poolAddress} not loaded`);
        }
        return this.pools[poolAddress].data.tokensList;
    }

    calcPoolVolume(
        poolAddress: string
    ): BigNumber | undefined {

        const { marketStore } = this.rootStore;

        var pool = this.getPool(poolAddress);

        let total = new BigNumber(0);

        for (var swap in pool.swaps) {
            let swapTokenIn = pool.swaps[swap].tokenIn;
            let swapTokenInSymbol = pool.swaps[swap].tokenInSym;
            let swapTokenAmountIn = pool.swaps[swap].tokenAmountIn;
            let swapTokenOut = pool.swaps[swap].tokenOut;
            let swapTokenAmountOut = pool.swaps[swap].tokenAmountOut;
            let swapTokenOutSymbol = pool.swaps[swap].tokenOutSym;

            let tokenToCount = swapTokenIn;
            let tokenCount = swapTokenAmountIn;
            let tokenSymbol = swapTokenInSymbol;

            try {
              marketStore.getAssetPrice(tokenSymbol);
            } catch (error) {
              console.log(`!!!!!!! In token price issue ${swapTokenInSymbol} ${swapTokenIn}. Try Out: ${swapTokenOutSymbol} ${swapTokenOut}`);
              tokenToCount = swapTokenOut;
              tokenCount = swapTokenAmountOut;
              tokenSymbol = swapTokenOutSymbol;
            }

            let value = new BigNumber(0);
            try {
              value = marketStore.getValue(tokenSymbol, tokenCount)
            } catch (error) {
              console.log(`!!!!!!! Error getting asset value: ${tokenSymbol}: ${tokenToCount}`);
            }
            total = total.plus(value);
        }

        return total;
    }

    @action exitPool = async (
        web3React: Web3ReactContextInterface,
        poolAddress: string,
        poolAmountIn: string,
        minAmountsOut: string[]
    ) => {
        const { providerStore } = this.rootStore;

        await providerStore.sendTransaction(
            web3React,
            ContractTypes.BPool,
            poolAddress,
            'exitPool',
            [poolAmountIn, minAmountsOut]
        );

    };

    @action joinPool = async (
        web3React: Web3ReactContextInterface,
        poolAddress: string,
        poolAmountOut: string,
        maxAmountsIn: string[]
    ) => {
        const { providerStore } = this.rootStore;

        await providerStore.sendTransaction(
            web3React,
            ContractTypes.BPool,
            poolAddress,
            'joinPool',
            [
                poolAmountOut.toString(),
                maxAmountsIn,
            ]
        );
    };
}
