import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { ContractTypes } from 'stores/Provider';
import * as helpers from 'utils/helpers';
import { bnum, scale } from 'utils/helpers';
import { parseEther, Interface } from 'ethers/utils';
import { FetchCode } from './Transaction';
import { BigNumber } from 'utils/bignumber';
import { AsyncStatus, UserAllowanceFetch } from './actions/fetch';
import { BigNumberMap } from '../types';
import { ActionResponse } from './actions/actions';

const tokenAbi = require('../abi/TestToken').abi;

export interface ContractMetadata {
    bFactory: string;
    proxy: string;
    weth: string;
    tokens: TokenMetadata[];
}

export interface TokenBalance {
    balance: BigNumber;
    lastFetched: number;
}

export interface UserAllowance {
    allowance: BigNumber;
    lastFetched: number;
}

export interface TotalSupply {
    totalSupply: BigNumber;
    lastFetched: number;
}

interface TotalSupplyMap {
    [index: string]: TotalSupply;
}

interface TokenBalanceMap {
    [index: string]: {
        [index: string]: TokenBalance;
    };
}

export interface TokenMetadata {
    address: string;
    symbol: string;
    decimals: number;
    iconAddress: string;
    precision: number;
}

interface BlockNumberMap {
    [index: number]: {
        [index: string]: number;
    };
}

interface UserAllowanceMap {
    [index: string]: {
        [index: string]: {
            [index: string]: UserAllowance;
        };
    };
}

export const EtherKey = 'ether';

export default class TokenStore {
    @observable symbols = {};
    @observable balances: TokenBalanceMap;
    @observable allowances: UserAllowanceMap;
    @observable totalSupplies: TotalSupplyMap;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.balances = {} as TokenBalanceMap;
        this.allowances = {} as UserAllowanceMap;
        this.totalSupplies = {} as TotalSupplyMap;
    }

    getAccountBalances(
        tokenAddresses: string[],
        account: string
    ): BigNumberMap {
        const result: BigNumberMap = {};
        tokenAddresses.forEach(tokenAddress => {
            if (
                this.balances[tokenAddress] &&
                this.balances[tokenAddress][account]
            ) {
                result[tokenAddress] = this.balances[tokenAddress][
                    account
                ].balance;
            }
        });

        return result;
    }

    areAccountApprovalsLoaded(
        tokenAddresses: string[],
        account: string,
        spender: string
    ): boolean {
        const approvals = this.getAllowances(tokenAddresses, account, spender);
        return Object.keys(approvals).length === tokenAddresses.length;
    }

    @action async fetchAccountApprovals(
        tokenAddresses: string[],
        account: string,
        spender: string
    ) {
        const { providerStore, contractMetadataStore } = this.rootStore;
        const calls = [];

        const multiAddress = contractMetadataStore.getMultiAddress();
        const multi = providerStore.getContract(
            ContractTypes.Multicall,
            multiAddress
        );

        const iface = new Interface(tokenAbi);

        tokenAddresses.forEach(value => {
            calls.push([
                value,
                iface.functions.allowance.encode([account, spender]),
            ]);
        });

        try {
            const [blockNumber, response] = await multi.aggregate(calls);
            const allowances = response.map(value => bnum(value));

            this.setAllowances(
                tokenAddresses,
                account,
                spender,
                allowances,
                blockNumber.toNumber()
            );
        } catch (e) {
            console.error(
                '[Fetch Account Approvals] Failure in one or more fetches',
                { error: e }
            );
            return FetchCode.FAILURE;
        }

        return FetchCode.SUCCESS;
    }

    getAllowances(
        tokenAddresses: string[],
        account: string,
        spender: string
    ): BigNumberMap {
        const result: BigNumberMap = {};
        tokenAddresses.forEach(tokenAddress => {
            if (
                this.allowances[tokenAddress] &&
                this.allowances[tokenAddress][account] &&
                this.allowances[tokenAddress][account][spender]
            ) {
                result[tokenAddress] = this.allowances[tokenAddress][account][
                    spender
                ].allowance;
            }
        });

        return result;
    }

    private setAllowances(
        tokens: string[],
        owner: string,
        spender: string,
        approvals: BigNumber[],
        fetchBlock: number
    ) {
        const chainApprovals = this.allowances;

        approvals.forEach((approval, index) => {
            const tokenAddress = tokens[index];

            if (
                (this.isAllowanceFetched(tokenAddress, owner, spender) &&
                    this.isAllowanceStale(
                        tokenAddress,
                        owner,
                        spender,
                        fetchBlock
                    )) ||
                !this.isAllowanceFetched(tokenAddress, owner, spender)
            ) {
                if (!chainApprovals[tokenAddress]) {
                    chainApprovals[tokenAddress] = {};
                }

                if (!chainApprovals[tokenAddress][owner]) {
                    chainApprovals[tokenAddress][owner] = {};
                }

                chainApprovals[tokenAddress][owner][spender] = {
                    allowance: approval,
                    lastFetched: fetchBlock,
                };
            }
        });

        this.allowances = {
            ...this.allowances,
            ...chainApprovals,
        };
    }

    private setAllowanceProperty(
        tokenAddress: string,
        owner: string,
        spender: string,
        approval: BigNumber,
        blockFetched: number
    ): void {
        const chainApprovals = this.allowances;

        if (!chainApprovals[tokenAddress]) {
            chainApprovals[tokenAddress] = {};
        }

        if (!chainApprovals[tokenAddress][owner]) {
            chainApprovals[tokenAddress][owner] = {};
        }

        chainApprovals[tokenAddress][owner][spender] = {
            allowance: approval,
            lastFetched: blockFetched,
        };

        this.allowances = chainApprovals;
    }

    isBalanceFetched(tokenAddress: string, account: string) {
        return (
            !!this.balances[tokenAddress] &&
            !!this.balances[tokenAddress][account]
        );
    }

    isBalanceStale(tokenAddress: string, account: string, blockNumber: number) {
        return this.balances[tokenAddress][account].lastFetched < blockNumber;
    }

    isSupplyFetched(tokenAddress: string) {
        return !!this.totalSupplies[tokenAddress];
    }

    isSupplyStale(tokenAddress: string, blockNumber: number): boolean {
        return this.totalSupplies[tokenAddress].lastFetched < blockNumber;
    }

    @action private setTotalSupplies(
        tokens: string[],
        supplies: BigNumber[],
        fetchBlock: number
    ) {
        const fetchedSupplies: TotalSupplyMap = {};

        supplies.forEach((supply, index) => {
            const tokenAddress = tokens[index];

            if (
                (this.isSupplyFetched(tokenAddress) &&
                    this.isSupplyStale(tokenAddress, fetchBlock)) ||
                !this.isSupplyFetched(tokenAddress)
            ) {
                fetchedSupplies[tokenAddress] = {
                    totalSupply: supply,
                    lastFetched: fetchBlock,
                };
            }
        });

        this.totalSupplies = {
            ...this.totalSupplies,
            ...fetchedSupplies,
        };
    }

    @action private setBalances(
        tokens: string[],
        balances: BigNumber[],
        account: string,
        fetchBlock: number
    ) {
        const fetchedBalances: TokenBalanceMap = {};

        balances.forEach((balance, index) => {
            const tokenAddress = tokens[index];

            if (
                (this.isBalanceFetched(tokenAddress, account) &&
                    this.isBalanceStale(tokenAddress, account, fetchBlock)) ||
                !this.isBalanceFetched(tokenAddress, account)
            ) {
                if (this.balances[tokenAddress]) {
                    fetchedBalances[tokenAddress] = this.balances[tokenAddress];
                } else {
                    fetchedBalances[tokenAddress] = {};
                }

                fetchedBalances[tokenAddress][account] = {
                    balance: balance,
                    lastFetched: fetchBlock,
                };
            }
        });

        this.balances = {
            ...this.balances,
            ...fetchedBalances,
        };
    }

    getTotalSupply(tokenAddress: string): BigNumber | undefined {
        if (this.totalSupplies[tokenAddress]) {
            return this.totalSupplies[tokenAddress].totalSupply;
        } else {
            return undefined;
        }
    }

    getBalance(tokenAddress: string, account: string): BigNumber | undefined {
        const tokenBalances = this.balances[tokenAddress];
        if (tokenBalances) {
            const balance = tokenBalances[account];
            if (balance) {
                if (balance.balance) {
                    return balance.balance;
                }
            }
        }

        return undefined;
    }

    private getBalanceLastFetched(
        tokenAddress: string,
        account: string
    ): number | undefined {
        const tokenBalances = this.balances[tokenAddress];
        if (tokenBalances) {
            const balance = tokenBalances[account];
            if (balance) {
                if (balance.lastFetched) {
                    return balance.lastFetched;
                }
            }
        }
        return undefined;
    }

    @action approveMax = async (
        tokenAddress,
        spender
    ): Promise<ActionResponse> => {
        const { providerStore } = this.rootStore;
        return await providerStore.sendTransaction(
            ContractTypes.TestToken,
            tokenAddress,
            'approve',
            [spender, helpers.MAX_UINT.toString()]
        );
    };

    @action revokeApproval = async (
        tokenAddress,
        spender
    ): Promise<ActionResponse> => {
        const { providerStore } = this.rootStore;
        return await providerStore.sendTransaction(
            ContractTypes.TestToken,
            tokenAddress,
            'approve',
            [spender, 0]
        );
    };

    @action fetchTotalSupplies = async (
        tokensToTrack: string[]
    ): Promise<FetchCode> => {
        const { providerStore, contractMetadataStore } = this.rootStore;
        const calls = [];
        const fetchBlock = providerStore.getCurrentBlockNumber();

        const stale =
            fetchBlock <= this.getTotalSupplyLastFetched(tokensToTrack[0]);
        if (!stale) {
            const multiAddress = contractMetadataStore.getMultiAddress();
            const multi = providerStore.getContract(
                ContractTypes.Multicall,
                multiAddress
            );

            const iface = new Interface(tokenAbi);

            tokensToTrack.forEach(value => {
                calls.push([value, iface.functions.totalSupply.encode([])]);
            });

            try {
                const [blockNumber, response] = await multi.aggregate(calls);
                const supplies = response.map(value =>
                    bnum(iface.functions.totalSupply.decode(value))
                );

                this.setTotalSupplies(
                    tokensToTrack,
                    supplies,
                    blockNumber.toNumber()
                );
                console.debug('[All Fetches Success]');
            } catch (e) {
                console.error('[Fetch] Total Supply Data', { error: e });
                return FetchCode.FAILURE;
            }
        }
        return FetchCode.SUCCESS;
    };

    @action fetchTokenBalances = async (
        account: string,
        tokensToTrack: string[]
    ): Promise<FetchCode> => {
        const { providerStore, contractMetadataStore } = this.rootStore;
        const calls = [];
        const promises: Promise<any>[] = [];

        const multiAddress = contractMetadataStore.getMultiAddress();
        const multi = providerStore.getContract(
            ContractTypes.Multicall,
            multiAddress
        );

        const iface = new Interface(tokenAbi);

        tokensToTrack.forEach(value => {
            if (value !== EtherKey) {
                calls.push([
                    value,
                    iface.functions.balanceOf.encode([account]),
                ]);
            }
        });

        promises.push(multi.aggregate(calls));
        promises.push(multi.getEthBalance(account));

        try {
            const [[blockNumber, response], ethBalance] = await Promise.all(
                promises
            );
            const balances = response.map(value =>
                bnum(iface.functions.balanceOf.decode(value))
            );
            if (tokensToTrack[0] === EtherKey) {
                balances.unshift(bnum(ethBalance));
            }

            this.setBalances(
                tokensToTrack,
                balances,
                account,
                blockNumber.toNumber()
            );

            console.debug('[All Fetches Success]');
        } catch (e) {
            console.error('[Fetch] Balancer Token Data', { error: e });
            return FetchCode.FAILURE;
        }
    };

    @action mint = async (tokenAddress: string, amount: string) => {
        const { providerStore } = this.rootStore;
        await providerStore.sendTransaction(
            ContractTypes.TestToken,
            tokenAddress,
            'mint',
            [parseEther(amount).toString()]
        );
    };

    isAllowanceFetched(tokenAddress: string, owner: string, spender: string) {
        const chainApprovals = this.allowances;
        return (
            !!chainApprovals[tokenAddress] &&
            !!chainApprovals[tokenAddress][owner] &&
            !!chainApprovals[tokenAddress][owner][spender]
        );
    }

    isAllowanceStale(
        tokenAddress: string,
        owner: string,
        spender: string,
        blockNumber: number
    ) {
        const chainApprovals = this.allowances;
        return (
            chainApprovals[tokenAddress][owner][spender].lastFetched <
            blockNumber
        );
    }

    @action fetchAllowance = async (
        tokenAddress: string,
        owner: string,
        spender: string,
        fetchBlock: number
    ): Promise<UserAllowanceFetch> => {
        const { providerStore } = this.rootStore;

        // Always max allowance for Ether
        if (tokenAddress === EtherKey) {
            return new UserAllowanceFetch({
                status: AsyncStatus.SUCCESS,
                request: {
                    tokenAddress,
                    owner,
                    spender,
                    fetchBlock,
                },
                payload: {
                    allowance: bnum(helpers.setPropertyToMaxUintIfEmpty()),
                    lastFetched: fetchBlock,
                },
            });
        }

        const token = providerStore.getContract(
            ContractTypes.TestToken,
            tokenAddress
        );

        /* Before and after the network operation, check for staleness
            If the fetch is stale, don't do network call
            If the fetch is stale after network call, don't set DB variable
        */
        const stale =
            fetchBlock <=
            this.getAllowanceLastFetched(tokenAddress, owner, spender);
        if (!stale) {
            try {
                const allowance = bnum(await token.allowance(owner, spender));

                const stale =
                    fetchBlock <=
                    this.getAllowanceLastFetched(tokenAddress, owner, spender);
                if (!stale) {
                    console.debug('[Allowance Fetch]', {
                        tokenAddress,
                        owner,
                        spender,
                        allowance: allowance.toString(),
                        fetchBlock,
                    });
                    return new UserAllowanceFetch({
                        status: AsyncStatus.SUCCESS,
                        request: {
                            tokenAddress,
                            owner,
                            spender,
                            fetchBlock,
                        },
                        payload: {
                            allowance,
                            lastFetched: fetchBlock,
                        },
                    });
                }
            } catch (e) {
                return new UserAllowanceFetch({
                    status: AsyncStatus.FAILURE,
                    request: {
                        tokenAddress,
                        owner,
                        spender,
                        fetchBlock,
                    },
                    payload: undefined,
                    error: e.message,
                });
            }
        } else {
            console.debug('[Allowance Fetch] - Stale', {
                tokenAddress,
                owner,
                spender,
                fetchBlock,
            });
            return new UserAllowanceFetch({
                status: AsyncStatus.STALE,
                request: {
                    tokenAddress,
                    owner,
                    spender,
                    fetchBlock,
                },
                payload: undefined,
            });
        }
    };

    // Token Scale -> Wei Scale
    denormalizeBalance(amount: BigNumber, tokenAddress: string): BigNumber {
        const { contractMetadataStore } = this.rootStore;
        return scale(
            bnum(amount),
            contractMetadataStore.getTokenMetadata(tokenAddress).decimals
        );
    }

    // Wei Scale -> Token Scale
    normalizeBalance(amount: BigNumber, tokenAddress: string): BigNumber {
        const { contractMetadataStore } = this.rootStore;
        return scale(
            bnum(amount),
            -contractMetadataStore.getTokenMetadata(tokenAddress).decimals
        );
    }

    hasApproval = (tokenAddress, account, spender): boolean => {
        const allowance = this.getAllowance(tokenAddress, account, spender);
        if (!allowance) {
            throw new Error(
                `Allowance not loaded for ${tokenAddress} ${account} ${spender}`
            );
        }
        return helpers.hasApproval(allowance);
    };

    hasMaxApproval = (tokenAddress, account, spender): boolean => {
        const allowance = this.getAllowance(tokenAddress, account, spender);
        if (!allowance) {
            throw new Error(
                `Allowance not loaded for ${tokenAddress} ${account} ${spender}`
            );
        }
        return helpers.hasMaxApproval(allowance);
    };

    getAllowance = (tokenAddress, account, spender): BigNumber | undefined => {
        const chainApprovals = this.allowances;
        if (chainApprovals) {
            const tokenApprovals = chainApprovals[tokenAddress];
            if (tokenApprovals) {
                const userApprovals = tokenApprovals[account];
                if (userApprovals) {
                    if (userApprovals[spender]) {
                        return userApprovals[spender].allowance;
                    }
                }
            }
        }
        return undefined;
    };

    getTotalSupplyLastFetched = (tokenAddress): number | undefined => {
        const totalSupplies = this.totalSupplies;
        if (totalSupplies) {
            const totalSupply = totalSupplies[tokenAddress];
            if (totalSupply) {
                return totalSupply.lastFetched;
            }
        }
        return undefined;
    };

    getAllowanceLastFetched = (
        tokenAddress,
        account,
        spender
    ): number | undefined => {
        const chainApprovals = this.allowances;
        if (chainApprovals) {
            const tokenApprovals = chainApprovals[tokenAddress];
            if (tokenApprovals) {
                const userApprovals = tokenApprovals[account];
                if (userApprovals) {
                    if (userApprovals[spender]) {
                        return userApprovals[spender].lastFetched;
                    }
                }
            }
        }
        return undefined;
    };
}
