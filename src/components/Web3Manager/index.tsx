import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useStores } from 'contexts/storesContext';
import { useInterval } from 'utils/helperHooks';
import { observer } from 'mobx-react';


const MessageWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20rem;
`;

const Message = styled.h2`
    color: ${({ theme }) => theme.bodyText};
`;

const Web3Manager = observer(({ children }) => {
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

    // if the web3 context isn't active, and there's an error it's an irrecoverable error
    if (!providerStore.providerStatus.active && providerStore.providerStatus.error) {
        return (
            <MessageWrapper>
                <Message>unknownError</Message>
            </MessageWrapper>
        );
    }

    // This means no injected web3 and infura backup has failed
    if (!providerStore.providerStatus.active) {
        console.debug(
            '[Web3Manager] Render: No active network, show loading'
        );
        return showLoader ? (
            <MessageWrapper>
                <Message>Loading</Message>
            </MessageWrapper>
        ) : null;
    }

    return children;
});

export default Web3Manager;
