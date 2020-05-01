import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { fetchPoolSwaps } from 'provider/subgraph';

export default class SwapsTableStore {
    @observable swaps: any[];
    @observable isLoaded: boolean;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.swaps = [];
        this.isLoaded = false;
    }

    @action async fetchPoolSwaps(poolAddress, pageIncrement, graphSkip) {
        console.debug('[SwapsTable] Fetching Swaps: ', {
            poolAddress,
            pageIncrement,
            graphSkip,
        });

        const newSwaps = await fetchPoolSwaps(
            poolAddress,
            pageIncrement,
            graphSkip
        );
        this.swaps = this.swaps.concat(newSwaps);
        this.isLoaded = true;
    }

    @action async clearPoolSwaps() {
        console.debug('[SwapsTable] Clearing Old Swaps.');
        this.swaps = [];
        this.isLoaded = false;
    }
}
