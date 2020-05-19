import React from 'react';
import styled from 'styled-components';
import PrivatePools from '../components/Home/PrivatePools';

const PrivateWrapper = styled.div`
    position: relative;
    padding: 32px 30px 0px 30px;

    @media screen and (max-width: 1024px) {
        padding: 32px 10px 0px 10px;
    }
`;

const Private = () => {
    return (
        <PrivateWrapper>
            <PrivatePools />
        </PrivateWrapper>
    );
};

export default Private;
