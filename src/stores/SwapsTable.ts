import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { fetchPoolSwaps } from 'provider/subgraph';

export default class SwapsTableStore {
    @observable swaps: any[];
    @observable isLoaded: boolean;
    pageIncrement: number;
    graphSkip: number;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.swaps = [];
        this.isLoaded = false;
        this.pageIncrement = 50;
        this.graphSkip = 0;
    }

    @action async fetchPoolSwaps(poolAddress) {
        this.isLoaded = true;
        console.debug('[SwapsTable] Fetching Swaps: ', {
            poolAddress,
            pageIncrement: this.pageIncrement,
            graphSkip: this.graphSkip,
        });

        const newSwaps = await fetchPoolSwaps(
            poolAddress,
            this.pageIncrement,
            this.graphSkip
        );
        this.swaps = this.swaps.concat(newSwaps);
    }

    @action async pagePoolSwaps(poolAddress) {
        this.graphSkip += this.pageIncrement;

        console.debug('[SwapsTable] Paging Swaps: ', {
            poolAddress,
            pageIncrement: this.pageIncrement,
            graphSkip: this.graphSkip,
        });

        this.fetchPoolSwaps(poolAddress);
    }

    @action async clearPoolSwaps() {
        console.debug('[SwapsTable] Clearing Old Swaps.');
        this.swaps = [];
        this.isLoaded = false;
        this.graphSkip = 0;
    }
}
