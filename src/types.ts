import { BigNumber } from 'utils/bignumber';

export interface BigNumberMap {
    [index: string]: BigNumber;
}

export interface StringMap {
    [index: string]: string;
}

export interface Pool {
    address: string;
    publicSwap: boolean;
    finalized: boolean;
    totalWeight: BigNumber;
    totalShares: BigNumber;
    swapFee: BigNumber;
    tokens: PoolToken[];
    tokensList: string[];
    shares: PoolShare[];
}

export interface PoolToken {
    address: string;
    balance: BigNumber;
    decimals: number;
    denormWeight: BigNumber;
    denormWeightProportion: BigNumber;
    symbol: string;
}

export interface PoolShare {
    account: string;
    balance: BigNumber;
    balanceProportion: BigNumber;
}

export interface MarketAsset {
    id: string;
    symbol: string;
    name: string;
    price?: MarketAssetPrice;
}

export interface MarketAssetPrice {
    value: BigNumber;
    currency: string;
}

// Indexed by Symbol
export interface MarketAssetPriceMap {
    [index: string]: MarketAssetPrice;
}
