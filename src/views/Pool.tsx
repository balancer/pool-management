import React, { Component } from 'react';
import styled from 'styled-components';
import ChartPanel   from '../components/Pool/ChartPanel';

const PoolViewWrapper = styled.div`
    padding: 32px 30px 0px 30px;
`

const InfoPanelWrapper = styled.div`
`

const AddRemovePanel = styled.div`
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
