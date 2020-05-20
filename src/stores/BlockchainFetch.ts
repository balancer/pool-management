import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { supportedChainId } from '../provider/connectors';

export default class BlockchainFetchStore {
    @observable activeFetchLoop: any;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action onActivePoolChanged() {
        const { providerStore } = this.rootStore;

        if (
            providerStore.providerStatus.active &&
            providerStore.providerStatus.account &&
            providerStore.providerStatus.activeChainId === supportedChainId
        ) {
            this.fetchActivePoolAllowances();
        }
    }

    @action fetchPoolTotalSupplies() {
        const { tokenStore, poolStore } = this.rootStore;
        const poolAddresses = poolStore
            .getPublicPools()
            .map(pool => pool.address);
        tokenStore.fetchTotalSupplies(poolAddresses);
    }

    @action fetchPoolUserBalances() {
        const { tokenStore, poolStore, providerStore } = this.rootStore;
        const account = providerStore.providerStatus.account;
        const poolAddresses = poolStore
            .getPublicPools()
            .map(pool => pool.address);
        tokenStore.fetchTokenBalances(account, poolAddresses);
    }

    @action fetchBActionsAllowances() {
        const {
            tokenStore,
            providerStore,
            contractMetadataStore,
        } = this.rootStore;

        const account = providerStore.providerStatus.account;
        const trackedTokenAddresses = contractMetadataStore.getTrackedTokenAddresses();
        const addresses = trackedTokenAddresses.filter(
            address => address !== 'ether'
        );
        const bActionsAddress = contractMetadataStore.getBActionsAddress();
        tokenStore.fetchAccountApprovals(addresses, account, bActionsAddress);
    }

    @action async fetchActivePoolAllowances() {
        const { providerStore } = this.rootStore;

        const account = providerStore.providerStatus.account;
        const { appSettingsStore, poolStore, tokenStore } = this.rootStore;
        const poolAddress = appSettingsStore.getActivePoolAddress();
        const tokenAddresses = poolStore.getPoolTokens(poolAddress);
        await tokenStore.fetchAccountApprovals(
            tokenAddresses,
            account,
            poolAddress
        );
    }

    @action setFetchLoop(forceFetch?: boolean) {
        const { providerStore } = this.rootStore;

        const active = providerStore.providerStatus.active;
        const chainId = providerStore.providerStatus.activeChainId;
        const library = providerStore.providerStatus.library;
        const account = providerStore.providerStatus.account;

        if (active && chainId === supportedChainId) {
            const { poolStore, appSettingsStore } = this.rootStore;

            library
                .getBlockNumber()
                .then(blockNumber => {
                    const lastCheckedBlock = providerStore.getCurrentBlockNumber();

                    const doFetch =
                        blockNumber !== lastCheckedBlock || forceFetch;

                    if (doFetch) {
                        console.debug('[Fetch Loop] Fetch Blockchain Data', {
                            blockNumber,
                            account,
                        });

                        // Set block number
                        providerStore.setCurrentBlockNumber(blockNumber);

                        // Get global blockchain data
                        poolStore.fetchAllPools().then(() => {
                            // Fetch user pool shares after pools loaded
                            this.fetchPoolTotalSupplies();

                            if (account) {
                                this.fetchPoolUserBalances();
                                this.fetchBActionsAllowances();
                            }

                            if (account && appSettingsStore.hasActivePool()) {
                                this.fetchActivePoolAllowances();
                            }
                        });

                        // Get user-specific blockchain data
                        if (account) {
                            providerStore.fetchUserBlockchainData(account);
                        }
                    }
                })
                .catch(error => {
                    console.error('[Fetch Loop Failure]', {
                        providerStore,
                        forceFetch,
                        chainId,
                        account,
                        library,
                        error,
                    });
                    providerStore.setCurrentBlockNumber(undefined);
                });
        }
    }
}
