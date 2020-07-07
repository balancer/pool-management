import React from 'react';
import styled from 'styled-components';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import BalancesTable from './BalancesTable';
import SwapsTable from './SwapsTable';
import { observer } from 'mobx-react';

const STabs = styled(Tabs)`
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    padding-top: 8px;
    padding-bottom: 16px;
`;

const STabList = styled(TabList)`
    margin: 20px 0 0 0;
    padding: 0;
`;

const STab = styled(Tab)`
    display: inline-block;
    border-bottom: none;
    bottom: -1px;
    position: relative;
    list-style: none;
    padding: 10px 15px;
    cursor: pointer;
    color: var(--body-text);
    &.react-tabs__tab--selected {
        background: var(--highlighted-selector-background);
        border-color: var(--panel-border);
        color: var(--header-text);
        border-radius: 4px 4px 0 0;
    }
    &.react-tabs__tab--disabled {
        color: GrayText;
        cursor: default;
    }
    &.react-tabs__tab:focus {
        box-shadow: 0 0 5px hsl(208, 99%, 50%);
        border-color: hsl(208, 99%, 50%);
        outline: none;
    }
    &.react-tabs__tab:focus:after {
        content: '';
        position: absolute;
        height: 5px;
        left: -4px;
        right: -4px;
        bottom: -5px;
        background: #fff;
    }
`;

const STabPanel = styled(TabPanel)`
    display: none;
    &.react-tabs__tab-panel--selected {
        display: block;
    }
`;

interface Props {
    poolAddress: string;
}

const PoolTabs = observer((props: Props) => {
    const { poolAddress } = props;

    return (
        <STabs>
            <STabList>
                <STab>Balances</STab>
                <STab>Swaps</STab>
            </STabList>

            <STabPanel>
                <BalancesTable poolAddress={poolAddress} />
            </STabPanel>
            <STabPanel>
                <SwapsTable poolAddress={poolAddress} />
            </STabPanel>
        </STabs>
    );
});

export default PoolTabs;
