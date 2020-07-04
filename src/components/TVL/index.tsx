import React from 'react';
import styled, { keyframes } from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { formatCurrency, bnum } from '../../utils/helpers';

const Label = styled.span`
    color: var(--highlighted-selector-background);
    font-size: 2rem;
    font-weight: 800;
    margin-right: 50px;
`;

const TVL = observer(() => {
    const {
        root: { poolStore, marketStore },
    } = useStores();

    let TVL = bnum(0);
    const pools = poolStore.getPrivatePools();

    pools.forEach(pool => {
        const poolLiquidity = marketStore.getPortfolioValue(pool);
        TVL = TVL.plus(bnum(poolLiquidity));
    });

    let tvlText = formatCurrency(TVL);
    return <Label>TVL: ${tvlText}</Label>;
});

export default TVL;
