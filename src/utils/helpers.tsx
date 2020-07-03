// Libraries
import React from 'react';
import jazzicon from 'jazzicon';
import { ethers, utils } from 'ethers';
import { BigNumber } from 'utils/bignumber';
import { Pool } from '../types';

// Utils
export const MAX_GAS = utils.bigNumberify('0xffffffff');
export const MAX_UINT = utils.bigNumberify(ethers.constants.MaxUint256);
export const POOL_TOKENS_DECIMALS = 18;

export function toChecksum(address) {
    return utils.getAddress(address);
}

export const formatDate = timestamp => {
    const date = new Date(timestamp * 1000);
    return `${date.toDateString()} ${addZero(date.getHours())}:${addZero(
        date.getMinutes()
    )}:${addZero(date.getSeconds())}`;
};

export const addZero = value => {
    return value > 9 ? value : `0${value}`;
};

export function bnum(
    val: string | number | utils.BigNumber | BigNumber
): BigNumber {
    return new BigNumber(val.toString());
}

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
    const scalePow = new BigNumber(decimalPlaces.toString());
    const scaleMul = new BigNumber(10).pow(scalePow);
    return input.times(scaleMul);
}

export function fromWei(val: string | utils.BigNumber | BigNumber): string {
    return utils.formatEther(val.toString());
}

export function toWei(val: string | utils.BigNumber | BigNumber): BigNumber {
    return scale(bnum(val.toString()), 18).integerValue();
}

export function setPropertyToMaxUintIfEmpty(value?): string {
    if (!value || value === 0 || value === '') {
        value = MAX_UINT.toString();
    }
    return value;
}

export function setPropertyToZeroIfEmpty(value?): string {
    if (!value || value === '') {
        value = '0';
    }
    return value;
}

export function hasApproval(amount: BigNumber): boolean {
    return amount.gt(bnum('0'));
}

export function hasMaxApproval(amount: BigNumber): boolean {
    return amount.gte(bnum('79228162514264337593543950335')); // uint96(-1)
}

export function toAddressStub(address) {
    const start = address.slice(0, 5);
    const end = address.slice(-3);

    return `${start}...${end}`;
}

export function isEmpty(str: string): boolean {
    return !str || 0 === str.length;
}

export function roundValue(value, decimals = 4): string {
    const decimalPoint = value.indexOf('.');
    if (decimalPoint === -1) {
        return value;
    }
    return value.slice(0, decimalPoint + decimals + 1);
}

export function str(value: any): string {
    return value.toString();
}

export function tinyAddress(address, digits = 4) {
    if (!isAddress(address)) {
        throw Error(`Invalid 'address' parameter '${address}'.`);
    }
    return `${address.substring(0, digits + 2)}..${address.substring(
        42 - digits
    )}`;
}

export function shortenAddress(address, digits = 4) {
    if (!isAddress(address)) {
        throw Error(`Invalid 'address' parameter '${address}'.`);
    }
    return `${address.substring(0, digits + 2)}...${address.substring(
        42 - digits
    )}`;
}

export function shortenTransactionHash(hash, digits = 4) {
    return `${hash.substring(0, digits + 2)}...${hash.substring(66 - digits)}`;
}

export function isAddress(value) {
    try {
        return ethers.utils.getAddress(value.toLowerCase());
    } catch {
        return false;
    }
}

export function formatFee(fee: BigNumber) {
    return fee.times(100).toString() + '%';
}

export function formatPercentage(
    value: BigNumber,
    decimals: number,
    useLowerLimit = true
): string {
    if (value.lte(0.0001) && value.gt(0) && useLowerLimit) {
        return '<0.01%';
    }

    return `${value.times(100).toFormat(decimals, BigNumber.ROUND_DOWN)}%`;
}

const ETHERSCAN_PREFIXES = {
    1: '',
    3: 'ropsten.',
    4: 'rinkeby.',
    5: 'goerli.',
    42: 'kovan.',
};

export function getEtherscanLink(networkId, data, type) {
    const prefix = `https://${ETHERSCAN_PREFIXES[networkId] ||
        ETHERSCAN_PREFIXES[1]}etherscan.io`;

    switch (type) {
        case 'transaction': {
            return `${prefix}/tx/${data}`;
        }
        case 'address':
        default: {
            return `${prefix}/address/${data}`;
        }
    }
}

export function fromPercentage(value: BigNumber | string): BigNumber {
    const bn = bnum(value.toString());
    return bn.div(100);
}

export function toPercentage(value: BigNumber | string): BigNumber {
    const bn = bnum(value.toString());
    return bn.times(100);
}

export function getQueryParam(windowLocation, name) {
    var q = windowLocation.search.match(
        new RegExp('[?&]' + name + '=([^&#?]*)')
    );
    return q && q[1];
}

export const copyToClipboard = e => {
    const value = e.target.title.replace(',', '');
    var aux = document.createElement('input');
    aux.setAttribute('value', value);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand('copy');
    document.body.removeChild(aux);
    alert(`Value: "${value}" copied to clipboard`);
};

export const etherscanUrl = network => {
    return `https://${network !== 'main' ? `${network}.` : ''}etherscan.io`;
};

export const etherscanAddress = (network, text, address) => {
    return (
        <a
            className="address"
            href={`${etherscanUrl(network)}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
        >
            {text}
        </a>
    );
};

export const etherscanTx = (network, text, tx) => {
    return (
        <a
            href={`${etherscanUrl(network)}/tx/${tx}`}
            target="_blank"
            rel="noopener noreferrer"
        >
            {text}
        </a>
    );
};

export const etherscanToken = (network, text, token, holder = false) => {
    return (
        <a
            href={`${etherscanUrl(network)}/token/${token}${
                holder ? `?a=${holder}` : ''
            }`}
            target="_blank"
            rel="noopener noreferrer"
        >
            {text}
        </a>
    );
};

export const generateIcon = address => {
    return jazzicon(28, address.substr(0, 10));
};

export const normalizePriceValues = (
    inputValue: BigNumber,
    outputValue: BigNumber
): {
    normalizedInput: BigNumber;
    normalizedOutput: BigNumber;
} => {
    const multiplier = bnum(1).div(inputValue);
    return {
        normalizedInput: bnum(1),
        normalizedOutput: outputValue.times(multiplier),
    };
};

export const formatNormalizedTokenValue = (
    normalizedBalance: BigNumber,
    displayPrecision: number,
    truncateAt?: number
): string => {
    if (normalizedBalance.eq(0)) {
        return bnum(0).toFixed(2);
    }

    let result = bnum(normalizedBalance)
        .decimalPlaces(displayPrecision, BigNumber.ROUND_DOWN)
        .toString();

    result = padToDecimalPlaces(result, 2);

    if (truncateAt && result.length > truncateAt) {
        return result.substring(0, 20) + '...';
    } else {
        return result;
    }
};

export const formatBalanceTruncated = (
    balance: BigNumber,
    decimals: number,
    precision: number,
    truncateAt: number
): string => {
    const result = formatBalance(balance, decimals, precision);
    if (result.length > truncateAt) {
        return result.substring(0, 20) + '...';
    } else {
        return result;
    }
};

export const formatCurrency = (balance: BigNumber): string => {
    const fmt = {
        decimalSeparator: '.',
        groupSeparator: ',',
        groupSize: 3,
    };
    return balance.toFormat(2, BigNumber.ROUND_DOWN, fmt);
};

export const formatBalance = (
    balance: BigNumber,
    decimals: number,
    precision: number
): string => {
    if (balance.eq(0)) {
        return bnum(0).toFixed(2);
    }

    const result = scale(balance, -decimals)
        .decimalPlaces(precision, BigNumber.ROUND_DOWN)
        .toString();

    return padToDecimalPlaces(result, 2);
};

export const padToDecimalPlaces = (
    value: string,
    minDecimals: number
): string => {
    const split = value.split('.');
    const zerosToPad = split[1] ? minDecimals - split[1].length : minDecimals;

    if (zerosToPad > 0) {
        let pad = '';

        // Add decimal point if no decimal portion in original number
        if (zerosToPad === minDecimals) {
            pad += '.';
        }
        for (let i = 0; i < zerosToPad; i++) {
            pad += '0';
        }
        return value + pad;
    }
    return value;
};

export const isTxReverted = response => {
    const { error } = response;
    if (!error) {
        return false;
    }
    return error.code === -32016;
};

export const getGasPriceFromETHGasStation = () => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject('Request timed out!');
        }, 3000);

        fetch('https://ethgasstation.info/json/ethgasAPI.json').then(
            stream => {
                stream.json().then(price => {
                    clearTimeout(timeout);
                    resolve(price);
                });
            },
            e => {
                clearTimeout(timeout);
                reject(e);
            }
        );
    });
};

export const printPool = (pool: Pool) => {
    console.log('pool', pool.address, pool);
};
