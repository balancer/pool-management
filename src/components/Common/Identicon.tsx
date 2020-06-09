import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Jazzicon from 'jazzicon';

const StyledIdenticon = styled.div`
    height: 1rem;
    width: 1rem;
    border-radius: 1.125rem;
`;

const Identicon = ({ address }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (address && ref.current) {
            ref.current.innerHTML = '';
            ref.current.appendChild(
                Jazzicon(16, parseInt(address.slice(2, 10), 16))
            );
        }
    });

    return <StyledIdenticon ref={ref} />;
};

export default Identicon;
