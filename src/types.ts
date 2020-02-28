import { BigNumber } from 'utils/bignumber';

export interface BigNumberMap {
    [index: string]: BigNumber;
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
}

export interface PoolToken {
    address: string;
    balance: BigNumber;
    decimals: number;
    denormWeight: BigNumber;
    denormWeightProportion: BigNumber;
    symbol: string;
}
