import RootStore from 'stores/Root';
import { action, observable } from 'mobx';
import { MarketAsset, MarketAssetPriceMap, Pool, StringMap } from 'types';
import { fetchAssetList, fetchAssetPrices } from 'provider/market';
import { BigNumber } from 'utils/bignumber';
import { bnum } from '../utils/helpers';

// Index by symbol
export interface MarketAssetMap {
    [index: string]: MarketAsset;
}

export default class MarketStore {
    @observable assets: MarketAssetMap;
    @observable assetsLoaded: boolean = false;
    @observable assetPricesLoaded: boolean = false;
    @observable idToSymbolMap: StringMap;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.assets = {} as MarketAssetMap;
        this.idToSymbolMap = {} as StringMap;
    }

    @action async fetchAssetPrices(symbolsToFetch: string[]) {
        if (!this.assetsLoaded || !this.assets[symbolsToFetch[0]]) {
            throw new Error('Data not initialized to fetch asset prices');
        }
        const response = await fetchAssetPrices(
            symbolsToFetch,
            this.assets,
            this.idToSymbolMap
        );

        this.setAssetPrices(response);
        this.assetPricesLoaded = true;
    }

    @action async fetchAssetList(symbolsToFetch: string[]) {
        const response = await fetchAssetList(symbolsToFetch);

        this.setAssetList(response);
    }

    @action setAssetPrices(prices: MarketAssetPriceMap) {
        Object.keys(this.assets).forEach(key => {
            this.assets[key].price = prices[key.toUpperCase()];
        });
    }

    @action setAssetList(assets: MarketAssetMap) {
        this.assets = assets;
        Object.keys(this.assets).forEach(key => {
            const asset = this.assets[key];
            this.idToSymbolMap[asset.id] = asset.symbol;
        });
        this.assetsLoaded = true;
    }

    getSymbolById(id: string): string {
        if (!this.idToSymbolMap[id]) {
            throw new Error('No Symbol found for specified ID');
        }
        return this.idToSymbolMap[id];
    }

    // Tokens with unknown symbol have 0 value
    getValue(symbol: string, balance: BigNumber): BigNumber {
        if (!this.hasAssetPrice(symbol)) {
            // console.warn('Symbol price not found for ' + symbol);
            return bnum(0);
        }

        return this.assets[symbol].price.value.times(balance);
    }

    getPortfolioValue(pool: Pool): BigNumber {
        const { contractMetadataStore } = this.rootStore;
        let sumValue = bnum(0);
        let sumWeight = bnum(0);
        let portfolioValue = bnum(0);
        pool.tokens.forEach((token, index) => {
            if (contractMetadataStore.isSupported(token.address)) {
                let ticker = contractMetadataStore.getTokenMetadata(
                    token.address
                ).ticker;
                let tokenValue = this.getValue(ticker, token.balance);
                sumValue = sumValue.plus(tokenValue);
                if (tokenValue.isGreaterThan(bnum(0))) {
                    sumWeight = sumWeight.plus(token.denormWeightProportion);
                }
            }
        });

        if (sumWeight.isGreaterThan(bnum(0))) {
            portfolioValue = sumValue.div(sumWeight);
        }

        return portfolioValue;
    }

    getPoolVolume(pool: Pool): BigNumber | undefined {
        const { contractMetadataStore } = this.rootStore;
        let volumeTotal = bnum(0);

        pool.swaps.forEach(swap => {
            if (contractMetadataStore.hasTokenMetadata(swap.tokenIn)) {
                let ticker = contractMetadataStore.getTokenMetadata(
                    swap.tokenIn
                ).ticker;
                volumeTotal = volumeTotal.plus(
                    this.getValue(ticker, swap.tokenAmountIn)
                );
            } else if (contractMetadataStore.hasTokenMetadata(swap.tokenOut)) {
                let ticker = contractMetadataStore.getTokenMetadata(
                    swap.tokenOut
                ).ticker;
                volumeTotal = volumeTotal.plus(
                    this.getValue(ticker, swap.tokenAmountOut)
                );
            }
        });

        return volumeTotal;
    }

    getAssetPrice(assetSymbol: string): BigNumber | undefined {
        if (!this.assets[assetSymbol]) {
            throw new Error(`Asset ${assetSymbol} not fetched`);
        }

        return this.assets[assetSymbol].price
            ? this.assets[assetSymbol].price.value
            : undefined;
    }

    hasAssetPrice(assetSymbol: string): boolean {
        return !!this.assets[assetSymbol] && !!this.assets[assetSymbol].price;
    }
}
