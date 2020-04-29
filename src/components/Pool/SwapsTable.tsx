import React, { useEffect } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { formatDate } from '../../utils/helpers';
import { useStores } from '../../contexts/storesContext';

interface Props {
    poolAddress: string;
}

const Wrapper = styled.div`
    width: 100%;
    padding-top: 8px;
`;

const TableWrapper = styled.div`
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
`;

const TableRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--panel-row-text);
    text-align: left;
    border-bottom: 1px solid var(--panel-border);
    :last-of-type {
        border-bottom: none;
    }
    padding: 20px 25px 20px 25px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--body-text);
    border-bottom: 1px solid var(--panel-border);
    padding: 20px 25px 20px 25px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '33.33%'};
`;

const SwapsTable = observer((props: Props) => {
    const { poolAddress } = props;

    const {
        root: { swapsTableStore },
    } = useStores();

    // !!!!!!! This will be updated by pagination button
    let startIndex = 0;
    let stopIndex = 50;

    useEffect(() => {
        swapsTableStore.fetchPoolSwaps(poolAddress, startIndex, stopIndex);
    }, [poolAddress, startIndex, stopIndex, swapsTableStore]);

    const swaps = swapsTableStore.swaps;

    const renderSwapsTable = swaps => {
        return (
            <React.Fragment>
                {swaps.map((swap, index) => {
                    return (
                        <TableRow key={index}>
                            <TableCell>{formatDate(swap.timestamp)}</TableCell>
                            <TableCell>
                                {swap.tokenAmountIn} {swap.tokenInSym}
                            </TableCell>
                            <TableCell>
                                {swap.tokenAmountOut} {swap.tokenOutSym}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </React.Fragment>
        );
    };

    return (
        <Wrapper>
            <TableWrapper>
                <HeaderRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Token In</TableCell>
                    <TableCell>Token Out</TableCell>
                </HeaderRow>
                {renderSwapsTable(swaps)}
            </TableWrapper>
        </Wrapper>
    );
});

export default SwapsTable;
