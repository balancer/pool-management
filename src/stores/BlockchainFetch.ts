import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { supportedChainId } from '../provider/connectors';

export default class BlockchainFetchStore {
    @observable activeFetchLoop: any;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action onActivePoolChanged(web3React: Web3ReactContextInterface) {
        if (
            web3React.active &&
            web3React.account &&
            web3React.chainId === supportedChainId
        ) {
            this.fetchActivePoolAllowances(web3React);
        }
    }

    @action async fetchActivePoolAllowances(web3React) {
        const { account } = web3React;
        const {
            appSettingsStore,
            poolStore,
            tokenStore
        } = this.rootStore;
        const poolAddress = appSettingsStore.getActivePoolAddress();
        const tokenAddresses = poolStore.getPoolTokens(poolAddress);
        await tokenStore
            .fetchAccountApprovals(
                web3React,
                tokenAddresses,
                account,
                poolAddress
            );
    }

    @action setFetchLoop(
        web3React: Web3ReactContextInterface,
        forceFetch?: boolean
    ) {
        if (
            web3React.active &&
            web3React.account &&
            web3React.chainId === supportedChainId
        ) {
            const { library, account, chainId } = web3React;
            const {
                providerStore,
                poolStore,
                marketStore,
                contractMetadataStore,
                appSettingsStore,
            } = this.rootStore;

            library
                .getBlockNumber()
                .then(blockNumber => {
                    const lastCheckedBlock = providerStore.getCurrentBlockNumber();

                    // console.debug('[Fetch Loop] Staleness Evaluation', {
                    //     blockNumber,
                    //     lastCheckedBlock,
                    //     forceFetch,
                    //     account: web3React.account,
                    //     doFetch: blockNumber !== lastCheckedBlock || forceFetch,
                    // });

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
                        poolStore.fetchPublicPools();
                        if (marketStore.assetsLoaded) {
                            marketStore.fetchAssetPrices(
                                contractMetadataStore.tokenSymbols
                            );
                        }

                        // Get user-specific blockchain data
                        if (account) {
                            providerStore.fetchUserBlockchainData(
                                web3React,
                                account
                            );

                            if (appSettingsStore.hasActivePool()) {
                                this.fetchActivePoolAllowances(web3React);
                            }
                        }
                    }
                })
                .catch(error => {
                    console.error('[Fetch Loop Failure]', {
                        web3React,
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
