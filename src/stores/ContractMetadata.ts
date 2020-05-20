import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import * as deployed from 'deployed.json';
import { NumberMap, StringMap } from '../types';
import { getSupportedChainName } from '../provider/connectors';

export interface ContractMetadata {
    bFactory: string;
    proxy: string;
    weth: string;
    multicall: string;
    defaultPrecision: number;
    warnings: string[];
    tokens: TokenMetadata[];
}

export interface TokenMetadata {
    address: string;
    symbol: string;
    ticker: string;
    decimals: number;
    iconAddress: string;
    precision: number;
    chartColor: string;
    isSupported: boolean;
}

export default class ContractMetadataStore {
    @observable contractMetadata: ContractMetadata;
    @observable tokenSymbols: string[];
    @observable tickerSymbols: string[];
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

        this.tickerSymbols = this.getWhitelistedTokenMetadata().map(value => {
            return value.ticker;
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
            multicall: metadata.default[chainName].multicall,
            defaultPrecision: metadata.default[chainName].defaultPrecision,
            warnings: metadata.default[chainName].warnings,
            tokens: [] as TokenMetadata[],
        };

        tokenMetadata.forEach(token => {
            const {
                address,
                symbol,
                ticker,
                decimals,
                iconAddress,
                precision,
                chartColor,
            } = token;
            contractMetadata.tokens.push({
                address,
                symbol,
                ticker,
                decimals,
                iconAddress,
                precision,
                chartColor,
                isSupported: true,
            });
        });

        this.contractMetadata = contractMetadata;
    }

    getTokenColor(tokenAddress: string): string {
        return this.getTokenMetadata(tokenAddress).chartColor;
    }

    getDefaultPrecision(): number {
        return this.contractMetadata.defaultPrecision;
    }

    isSupported(tokenAddress: string): boolean {
        const metadata = this.getTokenMetadata(tokenAddress);
        return metadata.isSupported;
    }

    getBFactoryAddress(): string {
        const proxyAddress = this.contractMetadata.bFactory;
        if (!proxyAddress) {
            throw new Error(
                '[Invariant] Trying to get non-loaded static address'
            );
        }
        return proxyAddress;
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

    getMultiAddress(): string {
        const multiAddress = this.contractMetadata.multicall;
        if (!multiAddress) {
            throw new Error(
                '[Invariant] Trying to get non-loaded static address'
            );
        }
        return multiAddress;
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

    getTokenWarnings(): string[] {
        const tokens = this.contractMetadata.warnings;
        if (!tokens) {
            throw new Error(
                '[Invariant] Trying to get non-loaded static address'
            );
        }
        return tokens;
    }

    getWhiteListedTokenAddresses(): string[] {
        const whitelisted = this.getWhitelistedTokenMetadata();
        return whitelisted.map(token => token.address);
    }

    getTrackedTokenAddresses(): string[] {
        const tokens = this.getTrackedTokenMetadata();
        return tokens.map(token => token.address);
    }

    getTrackedTokenMetadata(): TokenMetadata[] {
        return this.contractMetadata.tokens;
    }

    getWhitelistedTokenMetadata(): TokenMetadata[] {
        return this.contractMetadata.tokens.filter(token => token.isSupported);
    }

    getTokenPrecision(address: string): number {
        const tokenMetadata = this.contractMetadata.tokens.find(
            element => element.address === address
        );

        return tokenMetadata.precision;
    }

    hasTokenMetadata(address: string): boolean {
        const tokenMetadata = this.contractMetadata.tokens.find(
            element => element.address === address
        );

        return !!tokenMetadata;
    }

    getTokenMetadataIndex(address: string): number | undefined {
        const index = this.contractMetadata.tokens.findIndex(
            element => element.address === address
        );

        if (index !== -1) {
            return index;
        } else {
            return undefined;
        }
    }

    @action addTokenMetadata(address: string, metadata: TokenMetadata) {
        const existingIndex = this.getTokenMetadataIndex(address);
        if (existingIndex) {
            throw new Error('Attempting to add metadata for existing token');
        }
        this.contractMetadata.tokens.push(metadata);
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
