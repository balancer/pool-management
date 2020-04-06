import { action, observable, ObservableMap } from 'mobx';
import RootStore from 'stores/Root';
import { ethers } from 'ethers';
import UncheckedJsonRpcSigner from 'provider/UncheckedJsonRpcSigner';
import { ActionResponse, sendAction } from './actions/actions';
import { web3Window as window } from 'provider/Web3Window';
import { backupUrls, supportedChainId } from 'provider/connectors';

export enum ContractTypes {
    BPool = 'BPool',
    BFactory = 'BFactory',
    TestToken = 'TestToken',
    ExchangeProxy = 'ExchangeProxy',
    ExchangeProxyCallable = 'ExchangeProxyCallable',
    Weth = 'Weth'
}

export const schema = {
    BPool: require('../abi/BPool').abi,
    BFactory: require('../abi/BFactory').abi,
    TestToken: require('../abi/TestToken').abi,
    ExchangeProxy: require('../abi/ExchangeProxy').abi,
    ExchangeProxyCallable: require('../abi/ExchangeProxyCallable').abi,
    Weth: require('../abi/Weth').abi
};

export interface ChainData {
    currentBlockNumber: number;
}

enum ERRORS {
    UntrackedChainId = 'Attempting to access data for untracked chainId',
    ContextNotFound = 'Specified context name note stored',
    BlockchainActionNoAccount = 'Attempting to do blockchain transaction with no account',
    BlockchainActionNoChainId = 'Attempting to do blockchain transaction with no chainId',
    BlockchainActionNoResponse = 'No error or response received from blockchain action',
    NoWeb3 = 'Error Loading Web3'
}

type ChainDataMap = ObservableMap<number, ChainData>;

export default class ProviderStore {

    @observable chainData: ChainData;
    @observable chainId: number;
    @observable account: string;
    @observable library: any;
    @observable active: boolean;
    @observable error: Error;
    @observable isInjected: boolean;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.chainData = { currentBlockNumber: -1 } as ChainData;
        this.active = false;
        this.isInjected = false;
    }

    getCurrentBlockNumber(): number {
        return this.chainData.currentBlockNumber;
    }

    @action setCurrentBlockNumber(blockNumber): void {
        this.chainData.currentBlockNumber = blockNumber;
    }

    @action fetchUserBlockchainData = async (
        account: string
    ) => {
        const {
            transactionStore,
            tokenStore,
            contractMetadataStore,
        } = this.rootStore;

        console.debug('[Fetch Start - User Blockchain Data]', {
            account,
        });

        transactionStore.checkPendingTransactions(account);
        tokenStore
            .fetchTokenBalances(
                account,
                contractMetadataStore.getTrackedTokenAddresses()
            )
            .then(result => {
                console.debug('[Fetch End - User Blockchain Data]', {
                    account,
                });
            });
    };

    // account is optional
    getProviderOrSigner(library, account) {
        console.debug('[getProviderOrSigner', {
            library,
            account,
            signer: library.getSigner(account),
        });

        return account
            ? new UncheckedJsonRpcSigner(library.getSigner(account))
            : library;
    }

    getContract(
        type: ContractTypes,
        address: string,
        signerAccount?: string
    ): ethers.Contract {
        const library = this.library;

        if (signerAccount) {
            return new ethers.Contract(
                address,
                schema[type],
                this.getProviderOrSigner(this.library, signerAccount)
            );
        }

        return new ethers.Contract(address, schema[type], library);
    }

    @action sendTransaction = async (
        contractType: ContractTypes,
        contractAddress: string,
        action: string,
        params: any[],
        overrides?: any
    ): Promise<ActionResponse> => {
        const { transactionStore } = this.rootStore;
        const chainId = this.chainId;
        const account = this.account;

        overrides = overrides ? overrides : {};

        if (!account) {
            throw new Error(ERRORS.BlockchainActionNoAccount);
        }

        if (!chainId) {
            throw new Error(ERRORS.BlockchainActionNoChainId);
        }

        const contract = this.getContract(
            contractType,
            contractAddress,
            account
        );

        const response = await sendAction({
            contract,
            action,
            sender: account,
            data: params,
            overrides,
        });

        const { error, txResponse } = response;

        if (error) {
            console.warn('[Send Transaction Error', error);
        } else if (txResponse) {
            transactionStore.addTransactionRecord(account, txResponse);
        } else {
            throw new Error(ERRORS.BlockchainActionNoResponse);
        }

        return response;
    };

    getChainId(): number {
        return this.chainId;
    }

    @action handleNetworkChanged(networkId: string | number): void {
      this.chainId = Number(networkId);
    }

    @action handleClose(): void {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('chainChanged', this.handleNetworkChanged)
        window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged)
        window.ethereum.removeListener('close', this.handleClose)
        window.ethereum.removeListener('networkChanged', this.handleNetworkChanged)
      }

      this.loadWeb3();
    }

    @action handleAccountsChanged(accounts: string[]): void {
      if (accounts.length === 0) {
        this.handleClose();
      } else {
        this.account = accounts[0];
      }
    }

    @action async loadWeb3() {
        let web3;

        if (!window.ethereum) {
          console.log(`[Provider] No Injected Provider. Reverting To Backup.`);
          try{
            web3 = new ethers.providers.JsonRpcProvider(backupUrls[supportedChainId]);
            this.isInjected = false;
          }catch(err){
            console.error(`[Provider] loadWeb3 BackUp Error`, err);
            this.isInjected = false;
            this.chainId = null;
            this.account = null;
            this.library = null;
            this.active = false;
            this.error = new Error(ERRORS.NoWeb3);
          }
        }else{
          web3 = new ethers.providers.Web3Provider(window.ethereum);

          if ((window.ethereum as any).isMetaMask) {
            ;(window.ethereum as any).autoRefreshOnNetworkChange = false
          }

          this.handleNetworkChanged = this.handleNetworkChanged.bind(this);
          this.handleClose = this.handleClose.bind(this);
          this.handleAccountsChanged = this.handleAccountsChanged.bind(this);

          if (window.ethereum.on) {
            window.ethereum.on('chainChanged', this.handleNetworkChanged)           // For now assume network/chain ids are same thing as only rare case when they don't match
            window.ethereum.on('accountsChanged', this.handleAccountsChanged)
            window.ethereum.on('close', this.handleClose)
            window.ethereum.on('networkChanged', this.handleNetworkChanged)
          }

          this.isInjected = true;
          console.log(`[Provider] Using injected provider.`)
        }

        try{
          let network = await web3.getNetwork();

          const accounts = await web3.listAccounts();
          let account = null;
          if(accounts.length > 0)
            account = accounts[0];

          this.chainId = network.chainId;
          this.account = account;
          this.library = web3;
          this.active = true;
          console.log(`[Provider] Successfully loaded provider.`)

        }catch(err){
          console.error(`[Provider] loadWeb3 Error`, err);
          console.log(web3)
          this.isInjected = false;
          this.chainId = null;
          this.account = null;
          this.library = null;
          this.active = false;
          this.error = new Error(ERRORS.NoWeb3);
        }
    }
}
