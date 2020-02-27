import { action, observable, ObservableMap } from 'mobx';
import RootStore from 'stores/Root';
import { ContractTypes } from 'stores/Provider';
import * as helpers from 'utils/helpers';
import { bnum } from 'utils/helpers';
import { parseEther } from 'ethers/utils';
import * as deployed from 'deployed.json';
import { FetchCode } from './Transaction';
import { BigNumber } from 'utils/bignumber';
import {
    AsyncStatus,
    TokenBalanceFetch,
    UserAllowanceFetch,
} from './actions/fetch';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';

export interface ContractMetadata {
    bFactory: string;
    proxy: string;
    weth: string;
    tokens: TokenMetadata[];
}

export interface TokenMetadata {
    address: string;
    symbol: string;
    decimals: number;
    iconAddress: string;
    precision: number;
}

export default class ContractMetadataStore {
    @observable contractMetadata: ContractMetadata;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.contractMetadata = {} as ContractMetadata;
        this.loadWhitelistedTokenMetadata();
    }

    // Take the data from the JSON and get it into the store, so we access it just like other data
    @action loadWhitelistedTokenMetadata() {
        const tokenMetadata = deployed['kovan'].tokens;

        const contractMetadata = {
            bFactory: deployed['kovan'].bFactory,
            proxy: deployed['kovan'].proxy,
            weth: deployed['kovan'].weth,
            tokens: [] as TokenMetadata[],
        };

        tokenMetadata.forEach(token => {
            const { address, symbol, decimals, iconAddress, precision } = token;
            contractMetadata.tokens.push({
                address,
                symbol,
                decimals,
                iconAddress,
                precision,
            });
        });

        this.contractMetadata = contractMetadata;
    }

    getProxyAddress(): string {
        const proxyAddress = this.contractMetadata.proxy;
        if (!proxyAddress) {
            throw new Error(
                '[Invariant] Trying to get non-loaded static address'
            );
        }
        return proxyAddress;
    }

    getWethAddress(): string {
        const address = this.contractMetadata.weth;
        if (!address) {
            throw new Error(
                '[Invariant] Trying to get non-loaded static address'
            );
        }
        return address;
    }

    getWhitelistedTokenMetadata(): TokenMetadata[] {
        return this.contractMetadata.tokens;
    }

    getTokenMetadata(address: string): TokenMetadata {
        const tokenMetadata = this.contractMetadata.tokens.find(
            element => element.address === address
        );

        if (!tokenMetadata) {
            throw new Error(
                'Attempting to get metadata for untracked token address'
            );
        }

        return tokenMetadata;
    }

    getFilteredTokenMetadata(chainId: number, filter: string): TokenMetadata[] {
        const tokens = this.contractMetadata.tokens || undefined;

        if (!tokens) {
            throw new Error(
                'Attempting to get user balances for untracked chainId'
            );
        }

        let filteredMetadata: TokenMetadata[] = [];

        if (filter.indexOf('0x') === 0) {
            //Search by address
            filteredMetadata = tokens.filter(value => {
                return value.address === filter;
            });
        } else {
            //Search by symbol
            filteredMetadata = tokens.filter(value => {
                const valueString = value.symbol.toLowerCase();
                filter = filter.toLowerCase();
                return valueString.includes(filter);
            });
        }

        return filteredMetadata;
    }
}
