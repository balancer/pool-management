import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { web3Window as window } from 'provider/Web3Window';
import { usePrevious } from 'utils/helperHooks';
import { useStores } from 'contexts/storesContext';
import Transaction from './Transaction';
import { TransactionRecord } from 'stores/Transaction';

const StyledLink = styled.a`
    color: #FFFFFF;
    cursor: pointer;
`;

const Lightbox = styled.div`
    text-align: center;
    position: fixed;
    width: 100vw;
    height: 100vh;
    margin-left: -50vw;
    top: 78px;
    pointer-events: none;
    left: 50%;
    z-index: 2;
    will-change: opacity;
    background-color: rgba(0, 0, 0, 0.4);
`;

const Wrapper = styled.div`
    background-color: var(--panel-background);
    position: absolute;
    top: 0px;
    right: 25px;
    padding: 20px;
    transition: all .5s ease;
    margin: 0;
    width: 300px;
    pointer-events: auto;
    z-index: 100;
    border: 1px solid var(--panel-border);
    border-radius: 0 0 4px 4px;
`;

const TransactionListWrapper = styled.div`
    display: flex;
    flex-flow: column nowrap;
`;

const TransactionPanel = styled.div`
    display: flex;
    flex-flow: column nowrap;
    padding: 2rem;
    flex-grow: 1;
    overflow: auto;
    background-color: var(--panel-background);
`;

const WALLET_VIEWS = {
    OPTIONS: 'options',
    OPTIONS_SECONDARY: 'options_secondary',
    ACCOUNT: 'account',
    PENDING: 'pending',
};

interface Props {
    toggleWalletDropdown: any;
    pendingTransactions: TransactionRecord[];
    confirmedTransactions: TransactionRecord[];
    ENSName: any;
    openOptions: any;
}

const WalletDropdown = observer(
    ({ pendingTransactions, confirmedTransactions }) => {

        const {
            root: { dropdownStore, providerStore },
        } = useStores();

        const active = providerStore.providerStatus.active;
        const error = providerStore.providerStatus.error;
        const account = providerStore.providerStatus.account;
        const injectedActive = providerStore.providerStatus.injectedActive;
        const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

        const walletDropdownOpen = dropdownStore.walletDropdownVisible;

        const toggleWalletDropdown = () => {
            dropdownStore.toggleWalletDropdown();
        };

        // always reset to account view
        useEffect(() => {
            if (walletDropdownOpen) {
                setWalletView(WALLET_VIEWS.ACCOUNT);
            }
        }, [walletDropdownOpen]);

        // close modal when a connection is successful
        const activePrevious = usePrevious(active);
        useEffect(() => {
            if (
                walletDropdownOpen && (active && !activePrevious)
            ) {
                setWalletView(WALLET_VIEWS.ACCOUNT);
            }
        }, [
            setWalletView,
            active,
            error,
            walletDropdownOpen,
            activePrevious
        ]);

        async function loadWalletDropdown(){
          if(walletDropdownOpen){
            toggleWalletDropdown();
          }
          setWalletView(WALLET_VIEWS.ACCOUNT);
          await providerStore.loadWeb3Modal();
        }

        function renderTransactions(transactions: TransactionRecord[], pending) {
            return (
                <TransactionListWrapper>
                    {transactions.map((value, i) => {
                        return (
                            <Transaction
                                key={i}
                                hash={value.hash}
                                pending={pending}
                            />
                        );
                    })}
                </TransactionListWrapper>
            );
        }

        function getDropdownContent() {
            if (account &&
                injectedActive &&
                (walletView === WALLET_VIEWS.ACCOUNT)) {
                const hasTx =
        !!pendingTransactions.length || !!confirmedTransactions.length;
                return (

                    <>
                        <>

                            {(window.web3 || window.ethereum) && (
                                <StyledLink onClick={() => {
                                    setWalletView(WALLET_VIEWS.OPTIONS)
                                }}>Connect to a different wallet</StyledLink>
                            )}
                        </>
                        {hasTx ? (
                            <TransactionPanel>
                                <h5>Recent Transactions</h5>
                                {renderTransactions(pendingTransactions, true)}
                                {renderTransactions(confirmedTransactions, false)}
                            </TransactionPanel>
                        ) : ( <></>
                        )}
                    </>
                );
            }

            if(walletDropdownOpen){
              loadWalletDropdown();
            }
            return null;

        }

        if(walletDropdownOpen) {
            return (
                <Lightbox>
                    <Wrapper>{getDropdownContent()}</Wrapper>
                </Lightbox>
            );
        }

    }
);

export default WalletDropdown;
