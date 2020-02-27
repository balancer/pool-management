import React from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';
import {observer} from "mobx-react";
import {useStores} from "../../contexts/storesContext";
import {Pool, BigNumberMap} from "../../types";
import {formatBalanceTruncated} from "../../utils/helpers";

const Wrapper = styled.div`
    width: calc(80% - 20px);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
    margin-top: 32px;
    margin-left: 20px;
`;

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    color: var(--body-text);
    border-bottom: 1px solid var(--panel-border);
    padding: 20px 25px 20px 25px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const TableRow = styled.div`
    display: flex;
    flex-direction: row;
    color: var(--panel-row-text);
    text-align: left;
    padding: 16px 20px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '25%'};
`;

const TableCellRight = styled(TableCell)`
    justify-content: flex-end;
`;

const TokenIcon = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 13px;
`;

const DepositAmount = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    width: 80%;
    padding: 0px 17px;
`;

const MaxLink = styled.div`
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    text-decoration-line: underline;
    color: var(--link-text);
    cursor: pointer;
`;

const Toggle = styled.label`
    position: relative;
    display: inline-block;
    width: 42px;
    height: 24px;
    input {
        opacity: 0;
        width: 0;
        height: 0;
    }
`;

const ToggleInput = styled.input`
    &:checked + span {
        background-color: var(--highlighted-selector-background);
    }
    &:checked + span:before {
        -webkit-transform: translateX(18px);
        -ms-transform: translateX(18px);
        transform: translateX(18px);
        background-color: var(--slider-main);
        background-image: url('Checkbox.svg');
        background-repeat: no-repeat;
        background-position: center;
        background-size: 14px 14px;
    }
    &:focus + span {
        box-shadow: 0 0 1px #2196f3;
    }
`;

const ToggleSlider = styled.span`
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--highlighted-selector-background);
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 18px;
    :before {
        position: absolute;
        content: '';
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: var(--input-text);
        -webkit-transition: 0.4s;
        transition: 0.4s;
        border-radius: 50%;
    }
`;

const ToggleCheck = styled.img`
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 21px;
    bottom: 3px;
    font-size: 12px;
    color: blue;
    background-color: none;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
`;

const CheckBoxWrapper = styled.div`
    position: relative;
`;

const CheckBoxLabel = styled.label`
    position: absolute;
    top: 0;
    left: 0;
    width: 42px;
    height: 26px;
    border-radius: 15px;
    background: #bebebe;
    cursor: pointer;
    &::after {
        content: '';
        display: block;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        margin: 3px;
        background: #ffffff;
        box-shadow: 1px 3px 3px 1px rgba(0, 0, 0, 0.2);
        transition: 0.2s;
    }
`;

const CheckBox = styled.input`
    opacity: 0;
    z-index: 1;
    border-radius: 15px;
    width: 42px;
    height: 26px;
    &:checked + ${CheckBoxLabel} {
        background: #4fbe79;
        &::after {
            content: '';
            display: block;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            margin-left: 21px;
            transition: 0.2s;
        }
    }
`;

const AddAssetTable = observer(() => {

    const {
        root: { poolStore, tokenStore, providerStore },
    } = useStores();

    const {account} = providerStore.getActiveWeb3React();

    const poolAddress = "0xa25bA3D820e9b572c0018Bb877e146d76af6a9cF";

    const pool = poolStore.getPool(poolAddress);
    let userBalances: undefined | BigNumberMap;

    if (pool) {
        userBalances = tokenStore.getAccountBalances(pool.tokensList, account);
    }
    console.log('Read Pool', pool);

    const renderAssetTable = (pool: Pool, userBalances: undefined | BigNumberMap) => {
        return <React.Fragment>
            {pool.tokensList.map(tokenAddress => {

                const token = pool.tokens.find(token => {
                    return token.address === tokenAddress
                })

                const balanceToDisplay: string = userBalances && userBalances[tokenAddress] ? formatBalanceTruncated(userBalances[tokenAddress], 4, 20) : "-";

                return <TableRow>
                    <TableCell>
                        <TokenIcon
                            src={TokenIconAddress(
                                tokenAddress
                            )}
                        />
                        {token.symbol}
                    </TableCell>
                    <TableCell>
                        <Toggle>
                            <ToggleInput type="checkbox" />
                            <ToggleSlider></ToggleSlider>
                        </Toggle>
                    </TableCell>
                    <TableCell>{balanceToDisplay} {token.symbol}</TableCell>
                    <TableCellRight>
                        <DepositAmount>
                            <MaxLink>Max</MaxLink>
                            1,500
                        </DepositAmount>
                    </TableCellRight>
                </TableRow>
            })}
        </React.Fragment>
    };
    return (
        <Wrapper>
            <HeaderRow>
                <TableCell>Asset</TableCell>
                <TableCell>Unlock</TableCell>
                <TableCell>Wallet Balance</TableCell>
                <TableCellRight>Deposit Amount</TableCellRight>
            </HeaderRow>
            {pool ? renderAssetTable(pool, userBalances): <TableRow>Loading</TableRow>}
        </Wrapper>
    );
});

export default AddAssetTable;
