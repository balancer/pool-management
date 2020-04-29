import React, { useEffect, useState } from 'react';
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

const TableRowLoad = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--panel-row-text);
    text-align: center;
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
    justify-content: center;
`;

const TableCellLoad = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    text-align: center;
    vertical-align: middle;
    justify-content: center;
    cursor: pointer;
`;

const SwapsTable = observer((props: Props) => {
    const { poolAddress } = props;

    const {
        root: { swapsTableStore },
    } = useStores();

    const pageIncrement = 50;
    const [graphSkip, setGraphSkip] = useState(0);

    useEffect(() => {
        if (graphSkip === 0) swapsTableStore.clearPoolSwaps();

        swapsTableStore.fetchPoolSwaps(poolAddress, pageIncrement, graphSkip);
    }, [poolAddress, graphSkip, swapsTableStore]);

    const pageGraph = () => {
        setGraphSkip(graphSkip + pageIncrement);
    };

    const swaps = swapsTableStore.swaps;

    const renderBottomRow = swaps => {
        if (swaps.length > 0) {
            return (
                <TableRowLoad key={'more'}>
                    <TableCellLoad onClick={e => pageGraph()}>
                        LOAD MORE
                    </TableCellLoad>
                </TableRowLoad>
            );
        } else {
            return (
                <TableRowLoad key={'no-swaps'}>
                    <TableCellLoad>NO SWAPS</TableCellLoad>
                </TableRowLoad>
            );
        }
    };

    const renderSwapsTable = swaps => {
        let bottomRow = renderBottomRow(swaps);

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

                {bottomRow}
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
