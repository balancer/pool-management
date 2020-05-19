import fetch from 'isomorphic-fetch';
import { MarketAsset, MarketAssetPriceMap, StringMap } from '../types';
import { MarketAssetMap } from '../stores/Market';
import { bnum } from '../utils/helpers';

const MARKET_API_URL =
    process.env.MARKET_API_URL || 'https://api.coingecko.com/api/v3';

export async function fetchAssetPrices(
    symbolsToFetch: string[],
    assetData: MarketAssetMap,
    idToSymbolMap: StringMap
): Promise<MarketAssetPriceMap> {
    let idQueryString = '';
    symbolsToFetch.forEach((symbol, index) => {
        if (symbol !== '') {
            if (index === symbolsToFetch.length - 1) {
                idQueryString += `${assetData[symbol].id}`;
            } else {
                idQueryString += `${assetData[symbol].id}%2C`;
            }
        }
    });

    const query = `simple/price?ids=${idQueryString}&vs_currencies=usd&include_market_cap=false&include_last_updated_at=false`;

    const response = await fetch(`${MARKET_API_URL}/${query}`, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    const prices = await response.json();

    const priceMap: MarketAssetPriceMap = {};
    Object.keys(prices).forEach(key => {
        const price = prices[key].usd;
        const symbol = idToSymbolMap[key];
        priceMap[symbol] = {
            value: bnum(price),
            currency: 'usd',
        };
    });
    return priceMap;
}

export async function fetchAssetList(
    symbolsToFetch: string[]
): Promise<MarketAssetMap> {
    const query = `coins/list`;

    const response = await fetch(`${MARKET_API_URL}/${query}`, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    const formatAsset = (asset): MarketAsset => {
        return {
            id: asset.id,
            name: asset.name,
            symbol: asset.symbol.toUpperCase(),
        } as MarketAsset;
    };

    // Only store assets that map to deployed.json approved assets
    // toUpperCase symbol, compare to symbols in list, store if match
    const assets = await response.json();
    const result: MarketAssetMap = {};
    symbolsToFetch.forEach(assetSymbol => {
        const match = assets.find(
            value => value.symbol.toUpperCase() === assetSymbol.toUpperCase()
        );
        if (match) {
            result[assetSymbol] = formatAsset(match);
        }
    });

    return result;
}
