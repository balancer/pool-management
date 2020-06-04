import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 108px;
    background: var(--panel-background);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    width: calc(25% - 21px);
    @media screen and (max-width: 1024px) {
        width: 100%;
        margin-left: 0px;
    }
    font-style: normal;
    margin-top: 30px;
    margin-left: 25px;
    :first-of-type {
        margin-left: 0px;
    }
`;

const InfoPanelText = styled.div`
    font-weight: 500;
    font-size: 20px;
    line-height: 23px;
    color: var(--panel-row-text);
`;

const InfoPanelSubText = styled.div`
    font-weight: normal;
    font-size: 16px;
    line-height: 19px;
    color: var(--body-text);
    margin-top: 12px;
`;

const InfoPanel = ({ text, subText }) => {
    return (
        <Wrapper>
            <InfoPanelText>{text}</InfoPanelText>
            <InfoPanelSubText>{subText}</InfoPanelSubText>
        </Wrapper>
    );
};

export default InfoPanel;
