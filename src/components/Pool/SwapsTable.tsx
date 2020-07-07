import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { padToDecimalPlaces } from '../../utils/helpers';
import { getEtherscanLink } from '../../utils/helpers';
import { useStores } from '../../contexts/storesContext';
import { TokenIconAddress } from '../Common/WalletBalances';
import { getAddress } from 'ethers/utils';
const ExternalLink = require('../../assets/images/external-link.svg') as string;

const formatDate = timestamp => {
    const date = new Date(timestamp * 1000);
    let z = date.getTimezoneOffset() * 60 * 1000;
    let tLocal = new Date(timestamp * 1000 - z);
    let iso = tLocal.toISOString();
    iso = iso.slice(0, 19).replace('T', ' ');
    return iso;
};

interface Props {
    poolAddress: string;
}

const Wrapper = styled.div`
    width: 100%;
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
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '20%'};
`;

const TableCellHideMobile = styled(TableCell)`
    @media screen and (max-width: 1024px) {
        display: none;
        width: 0%;
    }
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

const TableCellTokenHeader = styled.div`
    display: flex;
    width: ${props => props.width || '30%'};
    align-items: center;
    justify-content: center;
`;

const TableCellTokenIn = styled.div`
    display: flex;
    width: ${props => props.width || '10%'};
    align-items: center;
    justify-content: flex-end;
`;

const TableCellTokenOut = styled.div`
    display: flex;
    width: ${props => props.width || '10%'};
    align-items: center;
    justify-content: flex-start;
`;

const TokenIconOut = styled.img`
    width: 20px;
    height: 20px;
    margin-left: 7px;
    margin-right: 7px;
`;

const TokenIconIn = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 7px;
    margin-left: 7px;
`;

const TokenSymbol = styled.div`
    @media screen and (max-width: 1024px) {
        display: none;
        width: 0%;
    }
`;

const TableCellAmountIn = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: ${props => props.width || '20%'};
    @media screen and (max-width: 1024px) {
        width: 40%;
    }
`;

const TableCellAmountOut = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: ${props => props.width || '17%'};
    @media screen and (max-width: 1024px) {
        width: 40%;
    }
`;

const TableCellTxHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: ${props => props.width || '20%'};
`;

const TableCellTxDetails = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: ${props => props.width || '23%'};
`;

const StyledLink = styled.a`
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 22px;
    text-decoration: none;
    color: var(--highlighted-selector-text);
`;

const ExternalIcon = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 7px;
    margin-left: 7px;
    filter: invert(67%) sepia(15%) saturate(333%) hue-rotate(155deg)
        brightness(94%) contrast(88%);
`;

const SwapsTable = observer((props: Props) => {
    const { poolAddress } = props;

    const {
        root: { swapsTableStore, contractMetadataStore, providerStore },
    } = useStores();

    const chainId = providerStore.providerStatus.activeChainId;

    const pageGraph = () => {
        swapsTableStore.pagePoolSwaps(poolAddress);
    };

    const swapsLoaded = swapsTableStore.isLoaded;
    const swaps = swapsTableStore.swaps;

    if (!swapsLoaded) {
        swapsTableStore.fetchPoolSwaps(poolAddress);
    }

    const renderBottomRow = swaps => {
        if (swapsLoaded) {
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
        } else {
            return (
                <TableRowLoad key={'loading'}>
                    <TableCellLoad>Loading...</TableCellLoad>
                </TableRowLoad>
            );
        }
    };

    const renderSwapsTable = (swaps, contractMetadataStore) => {
        let bottomRow = renderBottomRow(swaps);

        return (
            <React.Fragment>
                {swaps.map((swap, index) => {
                    const tokenInMetadata = contractMetadataStore.getTokenMetadata(
                        getAddress(swap.tokenIn)
                    );
                    const tokenOutMetadata = contractMetadataStore.getTokenMetadata(
                        getAddress(swap.tokenOut)
                    );

                    let tokenInIcon,
                        tokenOutIcon = '';
                    try {
                        tokenInIcon = TokenIconAddress(
                            tokenInMetadata.iconAddress,
                            tokenInMetadata.isSupported
                        );

                        tokenOutIcon = TokenIconAddress(
                            tokenOutMetadata.iconAddress,
                            tokenOutMetadata.isSupported
                        );
                    } catch (err) {
                        console.log(`[SwapsTable] Error Loading Token Icon.`);
                    }

                    const tx = swap.id.split('-')[0];
                    const amountOut = padToDecimalPlaces(
                        swap.tokenAmountOut,
                        tokenOutMetadata.decimals
                    );
                    const amountIn = padToDecimalPlaces(
                        swap.tokenAmountIn,
                        tokenInMetadata.decimals
                    );

                    return (
                        <TableRow key={index}>
                            <TableCellHideMobile>
                                {formatDate(swap.timestamp)}
                            </TableCellHideMobile>
                            <TableCellAmountIn>{amountIn}</TableCellAmountIn>
                            <TableCellTokenIn>
                                <TokenSymbol>{swap.tokenInSym}</TokenSymbol>
                                <TokenIconIn src={tokenInIcon} />
                            </TableCellTokenIn>
                            <TableCellTokenOut>
                                <TokenIconOut src={tokenOutIcon} />
                                <TokenSymbol>{swap.tokenOutSym}</TokenSymbol>
                            </TableCellTokenOut>
                            <TableCellAmountOut>{amountOut}</TableCellAmountOut>
                            <TableCellTxDetails>
                                <StyledLink
                                    href={getEtherscanLink(
                                        chainId,
                                        tx,
                                        'transaction'
                                    )}
                                    target="_blank"
                                >
                                    <ExternalIcon src={ExternalLink} alt="^" />
                                </StyledLink>
                            </TableCellTxDetails>
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
                    <TableCellHideMobile>Time</TableCellHideMobile>
                    <TableCellTokenHeader>Trade In</TableCellTokenHeader>
                    <TableCellTokenHeader>Trade Out</TableCellTokenHeader>
                    <TableCellTxHeader>Tx Details</TableCellTxHeader>
                </HeaderRow>
                {renderSwapsTable(swaps, contractMetadataStore)}
            </TableWrapper>
        </Wrapper>
    );
});

export default SwapsTable;
