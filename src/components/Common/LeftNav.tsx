import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    height: 201px;
    border-bottom: 1px solid var(--panel-border);
`;

const NavContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const NavElement = styled.a`
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
`;

const ActiveNavElement = styled(NavElement)`
    color: var(--highlighted-selector-text);
    background-color: var(--highlighted-selector-background);
    border-left: 3px solid var(--highlighted-selector-border);
    padding-left: 27px;
`;

const LeftNav = () => {
    return (
        <Wrapper>
            <NavContainer>
                <ActiveNavElement href="/">Shared Pools</ActiveNavElement>
                <NavElement>My Private Pools</NavElement>
            </NavContainer>
        </Wrapper>
    );
};

export default LeftNav;
