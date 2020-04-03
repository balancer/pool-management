import { action, observable, ObservableMap } from 'mobx';
import RootStore from 'stores/Root';
import { ethers } from 'ethers';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import UncheckedJsonRpcSigner from 'provider/UncheckedJsonRpcSigner';
import { ActionResponse, sendAction } from './actions/actions';
import { supportedChainId, web3ContextNames } from '../provider/connectors';
import { web3Window as window } from 'provider/Web3Window';


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
}

type ChainDataMap = ObservableMap<number, ChainData>;

export default class ProviderStore {

    @observable web3Contexts: object;
    @observable chainData: ChainData;
    @observable activeAccount: string;
    @observable chainId: number;
    @observable account: string;
    @observable library: any;
    @observable active: boolean;
    @observable error: Error;
    rootStore: RootStore;

    constructor(rootStore) {
        console.debug(`!!!!!!! Provider Constructor`)
        this.rootStore = rootStore;
        this.web3Contexts = {};
        this.chainData = { currentBlockNumber: -1 } as ChainData;
        this.active = false;
    }

    isBlockStale(blockNumber: number) {
        return blockNumber < this.chainData.currentBlockNumber;
    }

    getCurrentBlockNumber(): number {
        return this.chainData.currentBlockNumber;
    }

    @action setCurrentBlockNumber(blockNumber): void {
        this.chainData.currentBlockNumber = blockNumber;
    }

    @action setActiveAccount(account: string) {
        this.activeAccount = account;
    }

    @action fetchUserBlockchainData = async (
        web3React: Web3ReactContextInterface,
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

        transactionStore.checkPendingTransactions(web3React, account);
        tokenStore
            .fetchTokenBalances(
                web3React,
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
        web3React: Web3ReactContextInterface,
        type: ContractTypes,
        address: string,
        signerAccount?: string
    ): ethers.Contract {
        const { library } = web3React;

        if (signerAccount) {
            return new ethers.Contract(
                address,
                schema[type],
                this.getProviderOrSigner(library, signerAccount)
            );
        }

        return new ethers.Contract(address, schema[type], library);
    }

    getActiveWeb3React(): Web3ReactContextInterface {
        const contextBackup = this.web3Contexts[web3ContextNames.backup];
        const contextInjected = this.web3Contexts[web3ContextNames.injected];

        return contextInjected.active &&
            contextInjected.chainId === supportedChainId
            ? contextInjected
            : contextBackup;
    }

    getWeb3React(name): Web3ReactContextInterface {
        if (!this.web3Contexts[name]) {
            throw new Error(ERRORS.ContextNotFound);
        }
        return this.web3Contexts[name];
    }

    @action setWeb3Context(name, context: Web3ReactContextInterface) {
        console.debug('[setWeb3Context]', name, context);
        this.web3Contexts[name] = context;
    }

    @action sendTransaction = async (
        web3React: Web3ReactContextInterface,
        contractType: ContractTypes,
        contractAddress: string,
        action: string,
        params: any[],
        overrides?: any
    ): Promise<ActionResponse> => {
        const { transactionStore } = this.rootStore;
        const { chainId, account } = web3React;

        overrides = overrides ? overrides : {};

        if (!account) {
            throw new Error(ERRORS.BlockchainActionNoAccount);
        }

        if (!chainId) {
            throw new Error(ERRORS.BlockchainActionNoChainId);
        }

        const contract = this.getContract(
            web3React,
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
      console.log(`!!!!!!! handleClose`);
      if (window.ethereum && window.ethereum.removeListener) {
        console.log(`!!!!!!! removingListeners`);

        window.ethereum.removeListener('chainChanged', this.handleNetworkChanged)
        window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged)
        window.ethereum.removeListener('close', this.handleClose)
        window.ethereum.removeListener('networkChanged', this.handleNetworkChanged)
      }

      this.loadWeb3();
    }

    @action handleAccountsChanged(accounts: string[]): void {
      console.log(`!!!!!!! handleAccountsChanged`, accounts);

      if (accounts.length === 0) {
        this.handleClose();
      } else {
        this.account = accounts[0];
      }
    }

    async loadWeb3() {
        console.log(`loadWeb3()`);

        if (!window.ethereum) {
          console.log(`!!!!!!! NOETHPROVIDER`);
          return;
          // !!!!!!! Handle this
          // throw new NoEthereumProviderError();
        }
        const web3 = new ethers.providers.Web3Provider(window.ethereum);
        let network = await web3.getNetwork();

        const accounts = await web3.listAccounts();
        let account = null;
        if(accounts.length > 0)
          account = accounts[0];

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

        this.chainId = network.chainId;
        this.account = account;
        this.library = web3;
        this.active = true;

        /*
        !!!!!!! check if this is needed

        // try to activate + get account via eth_requestAccounts
        let account
        try {
          account = await (window.ethereum.send as Send)('eth_requestAccounts').then(
            sendReturn => parseSendReturn(sendReturn)[0]
          )
        } catch (error) {
          if ((error as any).code === 4001) {
            throw new UserRejectedRequestError()
          }
          warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable')
        }

        // if unsuccessful, try enable
        if (!account) {
          // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
          account = await window.ethereum.enable().then(sendReturn => sendReturn && parseSendReturn(sendReturn)[0])
        }

        return { provider: window.ethereum, ...(account ? { account } : {}) }
        */
    }
}
