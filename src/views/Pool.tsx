import React, { Component } from 'react';
import styled from 'styled-components';
import ChartPanel   from '../components/Pool/ChartPanel';
import AddRemovePanel   from '../components/Pool/AddRemovePanel';

const PoolViewWrapper = styled.div`
    padding: 27px 25px 0px 25px;
`

const InfoPanelWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`

const InfoPanel = styled.div`
`

const BalancesTable = styled.div`
`

const SwapsTable = styled.div`
`

const Pool = () => {

    return (
        <PoolViewWrapper>
            <InfoPanelWrapper>
            	<ChartPanel />
            	<AddRemovePanel />
            	<InfoPanel />
            	<InfoPanel />
            	<InfoPanel />
            	<InfoPanel />
            </InfoPanelWrapper>
            <BalancesTable />
            <SwapsTable />
        </PoolViewWrapper>
    );
};

export default Pool;
