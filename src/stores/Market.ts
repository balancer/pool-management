import RootStore from 'stores/Root';
import { action, observable } from 'mobx';
import { MarketAsset, MarketAssetPriceMap, StringMap } from 'types';
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

        console.log('fetchAssetPrices Complete', response);
        this.setAssetPrices(response);
        this.assetPricesLoaded = true;
    }

    @action async fetchAssetList(symbolsToFetch: string[]) {
        console.log('fetchAssetList');
        const response = await fetchAssetList(symbolsToFetch);

        console.log('fetchAssetList Complete', response);
        this.setAssetList(response);
    }

    @action setAssetPrices(prices: MarketAssetPriceMap) {
        Object.keys(this.assets).forEach(key => {
            this.assets[key].price = prices[key];
        });
    }

    @action setAssetList(assets: MarketAssetMap) {
        console.log('setAssetList', assets);
        this.assets = assets;
        Object.keys(this.assets).forEach(key => {
            const asset = this.assets[key];
            this.idToSymbolMap[asset.id] = asset.symbol;
        });
        this.assetsLoaded = true;
        console.log(this.idToSymbolMap);
    }

    getSymbolById(id: string): string {
        if (!this.idToSymbolMap[id]) {
            throw new Error('No Symbol found for specified ID');
        }
        return this.idToSymbolMap[id];
    }

    getValue(symbol: string, balance: BigNumber): BigNumber {
        if (!this.assets[symbol] || !this.assets[symbol].price) {
            throw new Error('Symbol price not found for ' + symbol);
        }

        console.log(symbol, balance.toString(), this.assets[symbol].price.value.times(balance).toString())
        return this.assets[symbol].price.value.times(balance);
    }

    getPortfolioValue(symbols: string[], balances: BigNumber[]): BigNumber {
        console.log('getPortfolioValue', symbols, balances.map(balance => balance.toString()));
        if (symbols.length !== balances.length) {
            throw new Error('Input array lengths do not match');
        }

        let portfolioValue = bnum(0);

        symbols.forEach((symbol, index) => {
            console.log(symbol, balances[index].toString(), this.getValue(symbol, balances[index]).toString());
            portfolioValue = portfolioValue.plus(this.getValue(symbol, balances[index]));
        });

        return portfolioValue;
    }

    getAssetPrice(assetSymbol: string): BigNumber | undefined {
        if (!this.assets[assetSymbol]) {
            throw new Error(`Asset ${assetSymbol} not fetched`);
        }

        return this.assets[assetSymbol].price
            ? this.assets[assetSymbol].price.value
            : undefined;
    }
}
