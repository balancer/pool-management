import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import * as deployed from 'deployed.json';
import { NumberMap, StringMap } from '../types';
import { getSupportedChainName } from '../provider/connectors';

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
    chartColor: string;
}

export default class ContractMetadataStore {
    @observable contractMetadata: ContractMetadata;
    @observable tokenSymbols: string[];
    @observable tokenIndex: NumberMap;
    @observable symbolToAddressMap: StringMap;
    @observable addressToSymbolMap: StringMap;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.contractMetadata = {} as ContractMetadata;
        this.loadWhitelistedTokenMetadata();

        this.tokenSymbols = this.getWhitelistedTokenMetadata().map(value => {
            return value.symbol;
        });

        this.tokenIndex = {} as NumberMap;
        this.symbolToAddressMap = {} as StringMap;
        this.addressToSymbolMap = {} as StringMap;

        this.getWhitelistedTokenMetadata().forEach((value, index) => {
            this.symbolToAddressMap[value.symbol] = value.address;
            this.addressToSymbolMap[value.address] = value.symbol;
            this.tokenIndex[value.symbol] = index;
        });
    }

    getTokenIndex(symbol: string) {
        return this.tokenIndex[symbol] ? this.tokenIndex[symbol] : -1;
    }

    // Take the data from the JSON and get it into the store, so we access it just like other data
    @action loadWhitelistedTokenMetadata() {
        const chainName = getSupportedChainName();
        const metadata = JSON.parse(JSON.stringify(deployed));
        const tokenMetadata = metadata.default[chainName].tokens;

        const contractMetadata = {
            bFactory: metadata.default[chainName].bFactory,
            proxy: metadata.default[chainName].proxy,
            weth: metadata.default[chainName].weth,
            tokens: [] as TokenMetadata[],
        };

        tokenMetadata.forEach(token => {
            const {
                address,
                symbol,
                decimals,
                iconAddress,
                precision,
                chartColor,
            } = token;
            contractMetadata.tokens.push({
                address,
                symbol,
                decimals,
                iconAddress,
                precision,
                chartColor,
            });
        });

        this.contractMetadata = contractMetadata;
    }

    getTokenColor(tokenAddress: string): string {
        return this.getTokenMetadata(tokenAddress).chartColor;
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

    getWhiteListedTokenAddresses(): string[] {
        return this.contractMetadata.tokens.map(token => token.address);
    }

    getWhitelistedTokenMetadata(): TokenMetadata[] {
        return this.contractMetadata.tokens;
    }

    getTokenPrecision(address: string): number {
        const tokenMetadata = this.contractMetadata.tokens.find(
            element => element.address === address
        );

        return tokenMetadata.precision;
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
