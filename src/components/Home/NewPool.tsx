import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';

const Wrapper = styled.div`
    padding-top: 8px;
`;

const Header = styled.div`
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 19px;
    color: var(--header-text);
    padding: 0px 0px 24px 0px;
`;

const NewPool = observer(() => {
    return (
        <Wrapper>
            <Header>Tokens</Header>
        </Wrapper>
    );
});

export default NewPool;
