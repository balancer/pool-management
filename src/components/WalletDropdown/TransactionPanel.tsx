import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from 'contexts/storesContext';
import Transaction from './Transaction';
import { TransactionRecord } from 'stores/Transaction';
import { isChainIdSupported } from '../../provider/connectors';


const TransactionListWrapper = styled.div`
    display: flex;
    flex-flow: column nowrap;
`;

const Panel = styled.div`
    display: flex;
    flex-flow: column nowrap;
    padding: 2rem;
    flex-grow: 1;
    overflow: auto;
    background-color: var(--panel-background);
`;

const TransactionPanel = observer(() => {

        const {
            root: { transactionStore, providerStore },
        } = useStores();

        const account = providerStore.providerStatus.account;
        const activeChainId = providerStore.providerStatus.activeChainId;

        let pending = undefined;
        let confirmed = undefined;

        if (account && isChainIdSupported(activeChainId)) {
            pending = transactionStore.getPendingTransactions(account);
            confirmed = transactionStore.getConfirmedTransactions(account);
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

      let hasTx = !!pending.length || !!confirmed.length;

      if(hasTx){
        return (
          <Panel>
          <h5>Recent Transactions</h5>
            {renderTransactions(pending, true)}
            {renderTransactions(confirmed, false)}
          </Panel>
        )
      }

      return <></>
    }
);

export default TransactionPanel;
