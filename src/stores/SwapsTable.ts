import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { fetchPoolSwaps } from 'provider/subgraph';

export default class SwapsTableStore {
    @observable swaps: any[];
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.swaps = [];
    }

    @action async fetchPoolSwaps(poolAddress, startIndex, stopIndex) {
        console.debug('[SwapsTable] Fetching Swaps: ', {
            poolAddress,
            startIndex,
            stopIndex,
        });

        this.swaps = await fetchPoolSwaps(poolAddress, startIndex, stopIndex);
    }
}
