// Stores
import ProviderStore from 'stores/Provider';
import BlockchainFetchStore from 'stores/BlockchainFetch';
import TokenStore from 'stores/Token';
import TransactionStore from './Transaction';
import { supportedNetworks } from 'provider/connectors';
import PoolStore from './Pool';
import ModalStore from "./Modal";
import AppSettingsStore from "./AppSettings";

export default class RootStore {
    providerStore: ProviderStore;
    blockchainFetchStore: BlockchainFetchStore;
    tokenStore: TokenStore;
    poolStore: PoolStore;
    transactionStore: TransactionStore;
    modalStore: ModalStore;
    appSettingsStore: AppSettingsStore;

    constructor() {
        this.providerStore = new ProviderStore(this, supportedNetworks);
        this.blockchainFetchStore = new BlockchainFetchStore(this);
        this.tokenStore = new TokenStore(this, supportedNetworks);
        this.poolStore = new PoolStore(this);
        this.transactionStore = new TransactionStore(this);
        this.modalStore = new ModalStore(this);
        this.appSettingsStore = new AppSettingsStore(this);
    }
}
