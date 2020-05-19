import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Wrapper = styled.div`
    height: 150px;
    border-bottom: 1px solid var(--panel-border);
`;

const NavContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const StyledLink = styled(Link)`
    display: flex;
    align-items: center;
    height: 40px;
    padding-left: 30px;
    color: var(--inactive-button-text);
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 22px;
    text-decoration: none;
    color: var(--highlighted-selector-text);
    padding-left: 27px;
`;

const LeftNav = () => {
    return (
        <Wrapper>
            <NavContainer>
                <StyledLink to={`/`}>Shared Pools</StyledLink>
                <StyledLink to={`/private`}>Private Pools</StyledLink>
            </NavContainer>
        </Wrapper>
    );
};

export default LeftNav;
