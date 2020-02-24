import RootStore from 'stores/Root';

export default class PoolStore {
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }
}
