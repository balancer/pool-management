import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Activity } from 'react-feather';
import { observer } from 'mobx-react';
import { shortenAddress } from 'utils/helpers';
import WalletDropdown from 'components/WalletDropdown';
import Identicon from '../Common/Identicon';
import { useStores } from '../../contexts/storesContext';
import Button from '../Common/Button';

const Circle = require('../../assets/images/circle.svg') as string;
const Dropdown = require('../../assets/images/dropdown.svg') as string;
const Dropup = require('../../assets/images/dropup.svg') as string;

const WarningIcon = styled.img`
    width: 22px;
    height: 26px;
    margin-right: 0px;
    color: var(--error);
`;

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

const Spinner = styled.img`
    animation: 2s ${rotate} linear infinite;
    width: 16px;
    height: 16px;
`;

const Address = styled.div`
    color: var(--address-color);
`;

const WalletButton = styled.button`
    background-color: var(--panel);
    display: flex;
    flex-flow: row nowrap;
    border-radius: 4px;
    padding: 0.5rem;
    border: 1px solid var(--panel-border);
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    cursor: pointer;
    justify-content: space-evenly;
    align-items: center;
    text-align: center;
    height: 40px;
    width: 160px;
    :focus {
        outline: none;
    }
`;

const Error = styled.button`
    background-color: var(--panel);
    border: 1px solid var(--error);
    display: flex;
    flex-flow: row nowrap;
    width: 100%;
    font-size: 0.9rem;
    align-items: center;
    padding: 0.5rem;
    border-radius: 4px;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    :focus {
        outline: none;
    }
    color: #ffffff;
    font-weight: 500;
`;

const ErrorMessage = styled.span`
    color: var(--error);
    margin: 0 0.5rem 0 0.25rem;
    font-size: 0.83rem;
`;

const NetworkIcon = styled(Activity)`
    margin-left: 0.25rem;
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
`;

const SpinnerWrapper = styled(Spinner)`
    margin: 0 0.25rem 0 0.25rem;
`;

const Wallet = observer(() => {
    const {
        root: { dropdownStore, transactionStore, providerStore },
    } = useStores();

    const account = providerStore.providerStatus.account;
    const activeChainId = providerStore.providerStatus.activeChainId;
    const active = providerStore.providerStatus.active;
    const error = providerStore.providerStatus.error;
    const injectedActive = providerStore.providerStatus.injectedActive;
    const injectedLoaded = providerStore.providerStatus.injectedLoaded;

    if (!activeChainId && active) {
        throw new Error(`No chain ID specified ${activeChainId}`);
    }

    let hasPendingTransactions = transactionStore.hasPendingTransactions(
        account
    );

    const toggleWalletDropdown = async () => {
        dropdownStore.toggleWalletDropdown();
    };

    // handle the logo we want to show with the account
    function getStatusIcon(account) {
        if (injectedActive) {
            return <Identicon address={account} />;
        }
    }

    function getWalletDetails() {
        // Wrong network
        if (injectedLoaded && !injectedActive) {
            return (
                <Error onClick={toggleWalletDropdown}>
                    <WarningIcon src="ErrorSign.svg" />
                    <ErrorMessage>Wrong Network</ErrorMessage>
                </Error>
            );
        } else if (account) {
            return (
                <WalletButton onClick={toggleWalletDropdown}>
                    {hasPendingTransactions && (
                        <SpinnerWrapper src={Circle} alt="loader" />
                    )}
                    {getStatusIcon(account)}
                    <Address>{shortenAddress(account)}</Address>
                    {dropdownStore.walletDropdownVisible ? (
                        <img src={Dropup} alt="v" />
                    ) : (
                        <img src={Dropdown} alt="^" />
                    )}
                </WalletButton>
            );
        } else if (error) {
            return (
                <Error onClick={toggleWalletDropdown}>
                    <NetworkIcon />
                    <ErrorMessage>Error</ErrorMessage>
                </Error>
            );
        } else {
            return (
                <Button
                    text="Connect Wallet"
                    onClick={toggleWalletDropdown}
                    isPrimary={true}
                />
            );
        }
    }

    return (
        <>
            {getWalletDetails()}
            <WalletDropdown />
        </>
    );
});

export default Wallet;
