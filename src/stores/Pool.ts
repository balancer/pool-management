import RootStore from 'stores/Root';
import { action, observable } from 'mobx';
import { fetchPublicPools } from 'provider/subgraph';
import { Pool } from 'types';

interface PoolData {
    blockLastFetched: number;
    data: Pool;
}

interface PoolMap {
    [index: string]: PoolData;
}

export default class PoolStore {
    @observable pools: PoolMap;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.pools = {} as PoolMap;
    }

    @action async fetchPublicPools() {
        const { providerStore } = this.rootStore;
        // The subgraph and local block could be out of sync
        const currentBlock = providerStore.getCurrentBlockNumber();

        console.debug('[fetchPublicPools] Fetch pools');
        const pools = await fetchPublicPools();

        pools.forEach(pool => {
            this.setPool(pool.address, pool, currentBlock);
        });

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

    getPoolData(poolAddress: string): PoolData | undefined {
        if (this.pools[poolAddress]) {
            return this.pools[poolAddress];
        }
        return undefined;
    }

    getPool(poolAddress: string): Pool | undefined {
        if (this.pools[poolAddress]) {
            return this.pools[poolAddress].data;
        }
        return undefined;
    }
}
