import { action, observable } from 'mobx';
import RootStore from 'stores/Root';

export default class AppSettingsStore {
    @observable darkMode: boolean;
    @observable activePoolAddress: string;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.darkMode = false;
    }

    hasActivePool(): boolean {
        return !!this.activePoolAddress;
    }

    getActivePoolAddress() {
        return this.activePoolAddress;
    }

    @action setActivePoolAddress(poolAddress) {
        this.activePoolAddress = poolAddress;
    }

    @action toggleDarkMode() {
        this.darkMode = !this.darkMode;
    }

    @action setDarkMode(visible: boolean) {
        this.darkMode = visible;
    }
}
