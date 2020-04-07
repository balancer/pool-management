import React from 'react';
import styled from 'styled-components';
import { Activity } from 'react-feather';
import { observer } from 'mobx-react';
import { shortenAddress } from 'utils/helpers';
import WalletModal from 'components/WalletModal';
import { Spinner } from '../../theme';
import Circle from 'assets/images/circle.svg';
import Identicon from '../Identicon';
import { useStores } from '../../contexts/storesContext';
import Button from '../Common/Button';
import Web3PillBox from '../Web3PillBox';
import { isChainIdSupported } from '../../provider/connectors';

const Web3StatusGeneric = styled.button`
    ${({ theme }) => theme.flexRowNoWrap}
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
`;

const WarningIcon = styled.img`
    width: 22px;
    height: 26px;
    margin-right: 0px;
    color: var(--warning);
`;

const Web3StatusError = styled(Web3StatusGeneric)`
    background-color: var(--panel);
    border: 1px solid var(--warning);
    color: ${({ theme }) => theme.white};
    font-weight: 500;
`;

const Text = styled.p`
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

const Web3ConnectStatus = observer(() => {

    const {
        root: { modalStore, transactionStore, providerStore },
    } = useStores();

    const account = providerStore.providerStatus.account;
    const activeChainId = providerStore.providerStatus.activeChainId;
    const active = providerStore.providerStatus.active;
    const error = providerStore.providerStatus.error;
    const injectedActive = providerStore.providerStatus.injectedActive;
    const injectedLoaded = providerStore.providerStatus.injectedLoaded;

    console.log('[Web3ConnectStatus]', {
        account,
        activeChainId,
        isChainIdSupported: isChainIdSupported(activeChainId),
        active,
        injectedActive,
        error,
    });

    if (!activeChainId && active) {
        throw new Error(`No chain ID specified ${activeChainId}`);
    }

    let pending = undefined;
    let confirmed = undefined;
    let hasPendingTransactions = false;

    if (account && isChainIdSupported(activeChainId)) {
        pending = transactionStore.getPendingTransactions(account);
        confirmed = transactionStore.getConfirmedTransactions(account);
        hasPendingTransactions = !!pending.length;
    }

    const toggleWalletModal = async() => {
      modalStore.toggleWalletModal();
    };

    // handle the logo we want to show with the account
    function getStatusIcon() {
        if(injectedActive){
          return <Identicon />;
        }
    }

    function getWeb3Status() {
        console.log('[GetWeb3Status]', {
            account,
            activeChainId,
            isChainIdSupported: isChainIdSupported(activeChainId),
            active,
            injectedActive,
            error,
        });
        // Wrong network
        if (injectedLoaded && !injectedActive ) {
            return (
                <Web3StatusError onClick={toggleWalletModal}>
                    <WarningIcon src="WarningSign.svg" />
                    <Text>Wrong Network</Text>
                </Web3StatusError>
            );
        } else if (account) {
            return (
                <Web3PillBox onClick={toggleWalletModal}>
                    {hasPendingTransactions && (
                        <SpinnerWrapper src={Circle} alt="loader" />
                    )}
                    {getStatusIcon()}
                    {shortenAddress(account)}
                </Web3PillBox>
            );
        } else if (error) {
            return (
                <Web3StatusError onClick={toggleWalletModal}>
                    <NetworkIcon />
                    <Text>Error</Text>
                </Web3StatusError>
            );
        } else {
            return (
                <Button
                    onClick={toggleWalletModal}
                    buttonText="Connect Wallet"
                    active={true}
                />
            );
        }
    }

    // ??????? Not really sure what this one was doing if (!contextNetwork.active && !active) {
    /*
    if (!active) {
        return null;
    }
    */

    return (
        <>
            {getWeb3Status()}
            <WalletModal
                pendingTransactions={pending}
                confirmedTransactions={confirmed}
            />
        </>
    );
});

export default Web3ConnectStatus;
