import React, { Component } from 'react';
import styled from 'styled-components';

const PoolViewWrapper = styled.div`
`

const InfoPanelWrapper = styled.div`
`

const ChartPanel = styled.div`
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
