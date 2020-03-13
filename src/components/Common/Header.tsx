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

const Title = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 32px;
    a {
        display: inline;
        font-size: 15px;
        font-weight: 500;
        text-decoration: none;
        img {
            height: 32px;
            width: 32px;
        }
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
                <Title>
                    <a href="/">
                        <img src="pebbles-pad.svg" />
                    </a>
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
