import { BigNumber } from 'utils/bignumber';
import { ValidationStatus } from './stores/actions/validators';

export interface BigNumberMap {
    [index: string]: BigNumber;
}

export interface StringMap {
    [index: string]: string;
}

export interface NumberMap {
    [index: string]: number;
}

export interface Pool {
    address: string;
    publicSwap: boolean;
    finalized: boolean;
    totalWeight: BigNumber;
    totalShares: BigNumber;
    totalSwapVolume: BigNumber;
    swapFee: BigNumber;
    tokens: PoolToken[];
    tokensList: string[];
    shares: PoolShare[];
    swaps: Swap[];
    lastSwapVolume?: BigNumber;
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

// Token Address -> checked
export interface CheckboxMap {
    [index: string]: Checkbox;
}

// Token -> amount
export interface InputMap {
    [index: string]: Input;
}

export interface Input {
    value: string;
    touched: boolean;
    validation: ValidationStatus;
}

export interface Checkbox {
    checked: boolean;
    touched: boolean;
}

export interface Swap {
    tokenIn;
    tokenInSym;
    tokenAmountIn;
    tokenOut;
    tokenOutSym;
    tokenAmountOut;
    poolTotalSwapVolume;
}

export interface UserShare {
    current?: BigNumber;
    future?: BigNumber;
}

export interface TokenErrors {
    noBool: string[];
    transferFee: string[];
}

export class Web3 {
    currentProvider;
    setProvider;
}
