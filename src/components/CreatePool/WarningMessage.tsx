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

const WarningMessage = () => {
    return (
        <Wrapper>
            <Warning>
                <WarningIcon src="WarningSign.svg" />
                <Message>
                    This feature is in beta. Currently, only creating shared
                    pools is supported. Make sure tokens are ERC20-compliant
                    otherwise funds can get stuck. The default list in the asset
                    selector has been vetted.
                </Message>
            </Warning>
        </Wrapper>
    );
};

export default WarningMessage;
