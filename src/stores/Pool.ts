import RootStore from 'stores/Root';
import { action, observable } from 'mobx';
import { fetchSharedPools, fetchContributedPools } from 'provider/subgraph';
import { Pool, PoolToken } from 'types';
import { BigNumber } from '../utils/bignumber';
import { bnum, fromPercentage, tinyAddress } from '../utils/helpers';
import { ContractTypes } from './Provider';
import { getNextTokenColor } from '../utils/tokenColorPicker';

interface PoolData {
    blockLastFetched: number;
    data: Pool;
}

interface PoolMap {
    [index: string]: PoolData;
}

const SUBGRAPH_SKIP_STEP = 12;

export default class PoolStore {
    @observable pools: PoolMap;
    @observable contributedPools: PoolMap;
    @observable poolsLoaded: boolean;
    pageIncrement: number;
    graphSkip: number;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.pools = {} as PoolMap;
        this.contributedPools = {} as PoolMap;
        this.graphSkip = 0;
    }

    @action processUnknownTokens(pool: Pool) {
        const {
            contractMetadataStore,
            tokenStore,
            providerStore,
        } = this.rootStore;
        const account = providerStore.providerStatus.account;
        const defaultPrecision = contractMetadataStore.getDefaultPrecision();

        pool.tokens.forEach((token, index) => {
            if (!contractMetadataStore.hasTokenMetadata(token.address)) {
                pool.tokens[token.symbol] = tinyAddress(token.address, 3);

                // We just discovered a new token, so should do an initial fetch for it outside of loop
                if (account && !tokenStore.getBalance(token.address, account)) {
                    tokenStore.fetchTokenBalances(account, [token.address]);
                }

                contractMetadataStore.addTokenMetadata(token.address, {
                    address: token.address,
                    precision: defaultPrecision,
                    chartColor: getNextTokenColor(),
                    decimals: token.decimals,
                    symbol: tinyAddress(token.address, 3),
                    ticker: '',
                    iconAddress: token.address,
                    isSupported: false,
                });
            }
        });
    }

    @action async fetchPools() {
        const { providerStore } = this.rootStore;
        // The subgraph and local block could be out of sync
        const currentBlock = providerStore.getCurrentBlockNumber();

        console.debug('[fetchPools] Fetch pools');
        const pools = await fetchSharedPools(
            SUBGRAPH_SKIP_STEP,
            this.graphSkip
        );

        pools.forEach(pool => {
            this.processUnknownTokens(pool);
        });
        this.setPools(pools, currentBlock);
        this.poolsLoaded = true;

        console.debug('[fetchPools] Pools fetched & stored');
    }

    @action async fetchContributedPools() {
        // get account
        const { providerStore } = this.rootStore;
        // The subgraph and local block could be out of sync
        const currentBlock = providerStore.getCurrentBlockNumber();
        const account = providerStore.providerStatus.account;

        if (!account) {
            return;
        }

        console.debug('[fetchContributedPools] Fetch pools');
        const pools = await fetchContributedPools(account);

        pools.forEach(pool => {
            this.processUnknownTokens(pool);
        });
        this.setContributedPools(pools, currentBlock);

        console.debug('[fetchContributedPools] Pools fetched & stored');
    }

    @action async pagePools(next: boolean) {
        if (next) {
            this.graphSkip += SUBGRAPH_SKIP_STEP;
        } else {
            this.graphSkip -= SUBGRAPH_SKIP_STEP;
            if (this.graphSkip < 0) {
                this.graphSkip = 0;
            }
        }
        this.fetchPools();
    }

    @action private setPools(pools: Pool[], blockFetched: number) {
        this.pools = {};
        for (const pool of pools) {
            this.pools[pool.address] = {
                blockLastFetched: blockFetched,
                data: pool,
            };
        }
    }

    @action private setContributedPools(pools: Pool[], blockFetched: number) {
        this.contributedPools = {};
        for (const pool of pools) {
            this.contributedPools[pool.address] = {
                blockLastFetched: blockFetched,
                data: pool,
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

    getPublicPools(): Pool[] {
        const pools: Pool[] = [];
        Object.keys(this.pools).forEach(key => {
            if (this.pools[key].data.finalized) {
                pools.push(this.pools[key].data);
            }
        });
        return pools;
    }

    getPrivatePools(): Pool[] {
        const pools: Pool[] = [];
        Object.keys(this.pools).forEach(key => {
            if (!this.pools[key].data.finalized) {
                pools.push(this.pools[key].data);
            }
        });
        return pools;
    }

    getContributedPools(): Pool[] {
        const pools: Pool[] = [];
        Object.keys(this.contributedPools).forEach(key => {
            pools.push(this.contributedPools[key].data);
        });
        return pools;
    }

    getPool(poolAddress: string): Pool | undefined {
        if (this.pools[poolAddress]) {
            return this.pools[poolAddress].data;
        }
        if (this.contributedPools[poolAddress]) {
            return this.contributedPools[poolAddress].data;
        }
        return undefined;
    }

    calcPoolTokensByRatio(pool: Pool, ratio: BigNumber): BigNumber {
        const { tokenStore } = this.rootStore;
        const totalPoolTokens = tokenStore.getTotalSupply(pool.address);
        // TODO - fix calcs so no buffer is needed
        const buffer = bnum(100);
        return ratio
            .times(totalPoolTokens)
            .integerValue(BigNumber.ROUND_DOWN)
            .minus(buffer);
    }

    getUserTokenPercentage(
        poolAddress: string,
        account: string,
        percentage: string
    ) {
        const { tokenStore } = this.rootStore;
        const userPoolTokens = tokenStore.getBalance(poolAddress, account);
        return bnum(fromPercentage(percentage)).times(userPoolTokens);
    }

    getPoolTokens(poolAddress: string): string[] {
        const pool = this.getPool(poolAddress);
        if (!pool) {
            throw new Error(`Pool ${poolAddress} not loaded`);
        }
        return pool.tokensList;
    }

    @action exitPool = async (
        poolAddress: string,
        poolAmountIn: string,
        minAmountsOut: string[]
    ) => {
        const { providerStore } = this.rootStore;

        console.debug('exitPool', {
            poolAddress,
            poolAmountIn,
            minAmountsOut,
        });

        await providerStore.sendTransaction(
            ContractTypes.BPool,
            poolAddress,
            'exitPool',
            [poolAmountIn, minAmountsOut]
        );
    };

    @action joinPool = async (
        poolAddress: string,
        poolAmountOut: string,
        maxAmountsIn: string[]
    ) => {
        const {
            contractMetadataStore,
            providerStore,
            proxyStore,
        } = this.rootStore;

        const dsProxyAddress = proxyStore.getInstanceAddress();
        const bActionsAddress = contractMetadataStore.getBActionsAddress();

        const data = proxyStore.wrapTransaction(
            ContractTypes.BActions,
            'joinPool',
            [poolAddress, poolAmountOut.toString(), maxAmountsIn]
        );
        await providerStore.sendTransaction(
            ContractTypes.DSProxy,
            dsProxyAddress,
            'execute',
            [bActionsAddress, data]
        );
    };
}
