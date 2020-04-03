import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
    backup,
    web3ContextNames,
} from 'provider/connectors';
import { useStores } from 'contexts/storesContext';
import { useInterval } from 'utils/helperHooks';

const MessageWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20rem;
`;

const Message = styled.h2`
    color: ${({ theme }) => theme.bodyText};
`;

const Web3ReactManager = ({ children }) => {
    console.log(`!!!!!!! Web3ReactManager()`)
    const {
        root: { providerStore, blockchainFetchStore },
    } = useStores();

    // handle delayed loader state
    const [showLoader, setShowLoader] = useState(true);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowLoader(true);
        }, 600);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    //Fetch user blockchain data on an interval using current params
    useInterval(
        () => blockchainFetchStore.setFetchLoop(false),
        1000
    );

    // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
    /*
    !!!!!!! user Provider state/error for this
    if (!injectedActive && networkError) {
        return (
            <MessageWrapper>
                <Message>unknownError</Message>
            </MessageWrapper>
        );
    }


    // if neither context is active, spin
    if (!injectedActive && !networkActive) {
        console.debug(
            '[Web3ReactManager] Render: No active network, show loading'
        );
        return showLoader ? (
            <MessageWrapper>
                <Message>Loading</Message>
            </MessageWrapper>
        ) : null;
    }
    */

    return children;
};

export default Web3ReactManager;
