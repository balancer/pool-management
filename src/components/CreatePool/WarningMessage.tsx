import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    margin-bottom: 24px;
`;

const Warning = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    color: var(--warning);
    height: 67px;
    border: 1px solid var(--warning);
    border-radius: 4px;
    padding-left: 20px;
`;

const Message = styled.div`
    display: inline;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.2px;
`;

const WarningIcon = styled.img`
    width: 22px;
    height: 26px;
    margin-right: 20px;
    color: var(--warning);
`;

const Link = styled.a`
    color: var(--warning);
`;

const WarningMessage = () => {
    return (
        <Wrapper>
            <Warning>
                <WarningIcon src="WarningSign.svg" />
                <Message>
                    This feature is in beta. Currently, only creating shared
                    pools is supported. Use carefully and with small amounts.
                    You can add more liquidity later, after pool creation. Make
                    sure tokens are ERC20-compliant otherwise{' '}
                    <Link
                        href="https://medium.com/coinmonks/missing-return-value-bug-at-least-130-tokens-affected-d67bf08521ca"
                        target="_blank"
                    >
                        funds will be stuck forever
                    </Link>
                    .
                </Message>
            </Warning>
        </Wrapper>
    );
};

export default WarningMessage;
