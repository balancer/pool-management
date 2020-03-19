import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from 'provider/NetworkConnector';

export const supportedChainId = Number(
    process.env.REACT_APP_SUPPORTED_NETWORK_ID
);

export const getSupportedChainId = () => {
    return supportedChainId;
};

export const getSupportedChainName = () => {
    return chainNameById[supportedChainId];
};

export const chainNameById = {
    '1': 'mainnet',
    '42': 'kovan',
};

export const isChainIdSupported = (chainId: number): boolean => {
    return supportedChainId === chainId;
};

const POLLING_INTERVAL = 1000;
const RPC_URLS: { [chainId: number]: string } = {
    1: process.env.REACT_APP_RPC_URL_1 as string,
    42: process.env.REACT_APP_RPC_URL_42 as string,
};

export const SUBGRAPH_URLS: { [chainId: number]: string } = {
    1: process.env.REACT_APP_SUBGRAPH_URL_1 as string,
    42: process.env.REACT_APP_SUBGRAPH_URL_42 as string,
};

export const web3ContextNames = {
    backup: 'BACKUP',
    injected: 'INJECTED',
};

const backupUrls = {};
backupUrls[supportedChainId] = RPC_URLS[supportedChainId];

export const backup = new NetworkConnector({
    urls: backupUrls,
    defaultChainId: supportedChainId,
    pollingInterval: POLLING_INTERVAL,
});

export const injected = new InjectedConnector({
    // supportedChainIds: supportedNetworks,
});

export default {
    backup,
    injected,
};

export const SUPPORTED_WALLETS = {
    INJECTED: {
        connector: injected,
        name: 'Injected',
        iconName: 'arrow-right.svg',
        description: 'Injected web3 provider.',
        href: null,
        color: '#010101',
        primary: true,
    },
    METAMASK: {
        connector: injected,
        name: 'MetaMask',
        iconName: 'metamask.png',
        description: 'Easy-to-use browser extension.',
        href: null,
        color: '#E8831D',
    },
};
