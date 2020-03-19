import React from 'react';
import styled from 'styled-components';
import Web3ConnectStatus from '../Web3ConnectStatus';

const HeaderFrame = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background-color: var(--panel-background);
    border-bottom: 1px solid var(--panel-border);
`;

const HeaderElement = styled.div`
    margin: 19px 30px;
    display: flex;
    min-width: 0;
    display: flex;
    align-items: center;
`;

const Title = styled.a`
    display: flex;
    text-decoration: none;
    align-items: center;
    cursor: pointer;
    height: 32px;
    img {
        font-size: 15px;
        font-weight: 500;
        height: 32px;
        width: 32px;
    }
`;

const AppName = styled.div`
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 18px;
    letter-spacing: 1px;
    color: var(--app-header-text);
    margin-left: 12px;
`;

const Header = () => {
    return (
        <HeaderFrame>
            <HeaderElement>
                <Title href="/">
                    <img alt="pebbles" src="pebbles-pad.svg" />
                    <AppName>Balancer</AppName>
                </Title>
            </HeaderElement>
            <HeaderElement>
                <Web3ConnectStatus />
            </HeaderElement>
        </HeaderFrame>
    );
};

export default Header;
