import fetch from 'isomorphic-fetch';
import { MarketAsset, MarketAssetPriceMap, StringMap } from '../types';
import { MarketAssetMap } from '../stores/Market';
import { bnum } from '../utils/helpers';
const pricesBackup = require('./pricesBackup.json');
const listBackup = require('./listBackup.json');

const conflictSymbols = [
    'master-usd',
    'compound-coin',
    'blazecoin',
    'ong',
    'swapcash',
    'swaps-network',
    'swap-token',
];

const MARKET_API_URL =
    process.env.REACT_APP_MARKET_API_URL || 'https://api.coingecko.com/api/v3';

export async function fetchAssetPrices(
    symbolsToFetch: string[],
    assetData: MarketAssetMap,
    idToSymbolMap: StringMap
): Promise<MarketAssetPriceMap> {
    let idQueryString = '';
    symbolsToFetch.forEach((symbol, index) => {
        if (symbol !== '' && assetData[symbol] !== undefined) {
            if (index === symbolsToFetch.length - 1) {
                idQueryString += `${assetData[symbol].id}`;
            } else {
                idQueryString += `${assetData[symbol].id}%2C`;
            }
        }
    });

    const query = `simple/price?ids=${idQueryString}&vs_currencies=usd&include_market_cap=false&include_last_updated_at=false`;
    let priceMap: MarketAssetPriceMap = {};
    let prices = {};
    try {
        const response = await fetch(`${MARKET_API_URL}/${query}`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        prices = await response.json();
    } catch (err) {
        console.log(`Coingecko call error. Using backup prices.`);
        prices = pricesBackup;
    }

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

    let assets = [];

    try {
        const response = await fetch(`${MARKET_API_URL}/${query}`, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        assets = await response.json();
    } catch (err) {
        console.log(`Coingecko call error. Using backup prices.`);
        assets = listBackup;
    }

    const formatAsset = (asset): MarketAsset => {
        return {
            id: asset.id,
            name: asset.name,
            symbol: asset.symbol.toUpperCase(),
        } as MarketAsset;
    };

    // Only store assets that map to deployed.json approved assets
    // toUpperCase symbol, compare to symbols in list, store if match

    const result: MarketAssetMap = {};
    symbolsToFetch.forEach(assetSymbol => {
        const match = assets.find(
            value =>
                value.symbol.toUpperCase() === assetSymbol.toUpperCase() &&
                !conflictSymbols.includes(value.id)
        );
        if (match) {
            result[assetSymbol] = formatAsset(match);
        }
    });

    return result;
}
