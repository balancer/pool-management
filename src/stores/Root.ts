// Stores
import ProviderStore from 'stores/Provider';
import BlockchainFetchStore from 'stores/BlockchainFetch';
import TokenStore from 'stores/Token';
import TransactionStore from './Transaction';
import PoolStore from './Pool';
import ModalStore from './Modal';
import AppSettingsStore from './AppSettings';
import ContractMetadataStore from './ContractMetadata';

export default class RootStore {
    providerStore: ProviderStore;
    blockchainFetchStore: BlockchainFetchStore;
    tokenStore: TokenStore;
    poolStore: PoolStore;
    transactionStore: TransactionStore;
    modalStore: ModalStore;
    appSettingsStore: AppSettingsStore;
    contractMetadataStore: ContractMetadataStore;

    constructor() {
        this.providerStore = new ProviderStore(this);
        this.blockchainFetchStore = new BlockchainFetchStore(this);
        this.tokenStore = new TokenStore(this);
        this.poolStore = new PoolStore(this);
        this.transactionStore = new TransactionStore(this);
        this.modalStore = new ModalStore(this);
        this.appSettingsStore = new AppSettingsStore(this);
        this.contractMetadataStore = new ContractMetadataStore(this);
    }
}
