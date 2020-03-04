// Stores
import ProviderStore from 'stores/Provider';
import BlockchainFetchStore from 'stores/BlockchainFetch';
import TokenStore from 'stores/Token';
import TransactionStore from './Transaction';
import PoolStore from './Pool';
import ModalStore from './Modal';
import AppSettingsStore from './AppSettings';
import ContractMetadataStore from './ContractMetadata';
import MarketStore from './Market';
import AddLiquidityFormStore from './AddLiquidityForm';

export default class RootStore {
    providerStore: ProviderStore;
    blockchainFetchStore: BlockchainFetchStore;
    tokenStore: TokenStore;
    poolStore: PoolStore;
    marketStore: MarketStore;
    transactionStore: TransactionStore;
    modalStore: ModalStore;
    appSettingsStore: AppSettingsStore;
    contractMetadataStore: ContractMetadataStore;
    addLiquidityFormStore: AddLiquidityFormStore;

    constructor() {
        this.providerStore = new ProviderStore(this);
        this.blockchainFetchStore = new BlockchainFetchStore(this);
        this.tokenStore = new TokenStore(this);
        this.poolStore = new PoolStore(this);
        this.marketStore = new MarketStore(this);
        this.transactionStore = new TransactionStore(this);
        this.modalStore = new ModalStore(this);
        this.appSettingsStore = new AppSettingsStore(this);
        this.contractMetadataStore = new ContractMetadataStore(this);
        this.addLiquidityFormStore = new AddLiquidityFormStore(this);

        this.asyncSetup().catch(e => {
            //TODO: Add retry on these fetches
            throw new Error('Async Setup Failed ' + e);
        });
    }

    async asyncSetup() {
        await this.marketStore.fetchAssetList(
            this.contractMetadataStore.tokenSymbols
        );
        await this.marketStore.fetchAssetPrices(
            this.contractMetadataStore.tokenSymbols
        );
    }
}
