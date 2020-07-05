import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

const Wrapper = styled.div`
    height: 150px;
    border-bottom: 1px solid var(--panel-border);
`;

const NavContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const StyledLink = styled(NavLink)`
    display: flex;
    align-items: center;
    height: 40px;
    padding-left: 30px;
    color: var(--inactive-button-text);
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 22px;
    text-decoration: none;
    color: var(--highlighted-selector-text);
    padding-left: 27px;

    &.selected {
        background-color: var(--highlighted-selector-background);
        border-left: 3px solid var(--highlighted-selector-border);
    }
`;

const LeftNav = () => {
    return (
        <Wrapper>
            <NavContainer>
                <StyledLink exact activeClassName="selected" to={`/`}>
                    PIEs
                </StyledLink>
                <StyledLink activeClassName="selected" to={`/balancer`}>
                    Balancer Shared Pools
                </StyledLink>
                <StyledLink activeClassName="selected" to={`/dashboard`}>
                    Dashboard (beta)
                </StyledLink>
            </NavContainer>
        </Wrapper>
    );
};

export default LeftNav;
