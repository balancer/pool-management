import React from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { BigNumberMap, Pool } from '../../types';
import {
    formatBalance,
    formatBalanceTruncated,
    fromWei,
} from '../../utils/helpers';
import { BigNumber } from '../../utils/bignumber';

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

const InputWrapper = styled.div`
    height: 60px;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 21px;
    padding-right: 21px;
    border-top: 1px solid var(--panel-border);
    border-radius: 0px 0px 4px 4px;
    input {
        width: 100px;
        color: var(--input-text);
        font-size: 16px;
        font-weight: 500;
        line-height: 19px;
        background-color: var(--panel-background);
        border: none;
        box-shadow: inset 0 0 0 1px var(--panel-background),
            inset 0 0 0 100px var(--panel-background);
        :-webkit-autofill,
        :-webkit-autofill:hover,
        :-webkit-autofill:focus,
        :-webkit-autofill:active,
        :-internal-autofill-selected {
            -webkit-text-fill-color: var(--body-text);
        }
        ::placeholder {
            color: var(--input-placeholder-text);
        }
        :focus {
            outline: none;
        }
    }
    border: ${props =>
        props.errorBorders ? '1px solid var(--error-color)' : ''};
    margin-left: ${props => (props.errorBorders ? '-1px' : '0px')}
    margin-right: ${props => (props.errorBorders ? '-1px' : '0px')}
    :hover {
        background-color: var(--input-hover-background);
        border: ${props =>
            props.errorBorders
                ? '1px solid var(--error-color)'
                : '1px solid var(--input-hover-border);'};
        margin-left: -1px;
        margin-right: -1px;
        input {
            background-color: var(--input-hover-background);
            box-shadow: inset 0 0 0 1px var(--input-hover-background),
                inset 0 0 0 100px var(--input-hover-background);
            ::placeholder {
                color: var(--input-hover-placeholder-text);
                background-color: var(--input-hover-background);
            }
        }
    }
`;

const AddAssetTable = observer((props: any) => {
    const {
        root: {
            poolStore,
            tokenStore,
            providerStore,
            contractMetadataStore,
            addLiquidityFormStore,
        },
    } = useStores();

    const web3React = providerStore.getActiveWeb3React();
    const { account } = web3React;

    const poolAddress = '0xa25bA3D820e9b572c0018Bb877e146d76af6a9cF';

    const pool = poolStore.getPool(poolAddress);
    let userBalances: undefined | BigNumberMap;
    let accountApprovalsLoaded = false;

    if (pool) {
        userBalances = tokenStore.getAccountBalances(pool.tokensList, account);
        accountApprovalsLoaded = tokenStore.areAccountApprovalsLoaded(
            poolStore.getPoolTokens(pool.address),
            account,
            pool.address
        );
    }

    const handleMaxLinkClick = async (
        tokenAddress: string,
        balance: BigNumber
    ) => {
        const maxValue = fromWei(balance);
        addLiquidityFormStore.setAmountInputValue(tokenAddress, maxValue);
    };

    const handleCheckboxChange = async (event, tokenAddress: string) => {
        const { checked } = event.target;

        addLiquidityFormStore.setApprovalCheckboxTouched(tokenAddress, true);
        addLiquidityFormStore.setApprovalCheckboxChecked(tokenAddress, checked);

        if (checked) {
            await tokenStore.approveMax(web3React, tokenAddress, pool.address);
        } else {
            await tokenStore.revokeApproval(
                web3React,
                tokenAddress,
                pool.address
            );
        }
    };

    const handleAmountInputChange = async (event, tokenAddress: string) => {
        const { value } = event.target;
        addLiquidityFormStore.setAmountInputValue(tokenAddress, value);
    };

    const renderAssetTable = (
        pool: Pool,
        userBalances: undefined | BigNumberMap
    ) => {
        return (
            <React.Fragment>
                {pool.tokensList.map(tokenAddress => {
                    const token = pool.tokens.find(token => {
                        return token.address === tokenAddress;
                    });

                    const tokenMetadata = contractMetadataStore.getTokenMetadata(
                        tokenAddress
                    );

                    const checked = addLiquidityFormStore.isCheckboxChecked(
                        tokenAddress
                    );
                    const touched = addLiquidityFormStore.isCheckboxTouched(
                        tokenAddress
                    );

                    let hasMaxApproval = false;

                    if (accountApprovalsLoaded) {
                        hasMaxApproval = tokenStore.hasMaxApproval(
                            tokenAddress,
                            account,
                            pool.address
                        );
                    }

                    let visuallyChecked;

                    if (touched) {
                        visuallyChecked = checked;
                    } else if (accountApprovalsLoaded) {
                        visuallyChecked = hasMaxApproval;
                    } else {
                        visuallyChecked = false;
                    }

                    // checked = tokenStore.hasMaxApproval(tokenAddress, account, pool.address);
                    // TODO: If neither, we should be in the loading state and never get here

                    const balanceToDisplay: string =
                        userBalances && userBalances[tokenAddress]
                            ? formatBalanceTruncated(
                                  userBalances[tokenAddress],
                                  tokenMetadata.precision,
                                  20
                              )
                            : '-';

                    return (
                        <TableRow>
                            <TableCell>
                                <TokenIcon
                                    src={TokenIconAddress(
                                        tokenMetadata.iconAddress
                                    )}
                                />
                                {token.symbol}
                            </TableCell>
                            <TableCell>
                                <Toggle>
                                    <ToggleInput
                                        type="checkbox"
                                        checked={visuallyChecked}
                                        onChange={e =>
                                            handleCheckboxChange(
                                                e,
                                                tokenAddress
                                            )
                                        }
                                    />
                                    <ToggleSlider></ToggleSlider>
                                </Toggle>
                            </TableCell>
                            <TableCell>
                                {balanceToDisplay} {token.symbol}
                            </TableCell>
                            <TableCellRight>
                                <DepositAmount>
                                    <InputWrapper errorBorders={false}>
                                        {userBalances &&
                                        userBalances[tokenAddress] ? (
                                            <MaxLink
                                                onClick={() => {
                                                    handleMaxLinkClick(
                                                        tokenAddress,
                                                        userBalances[
                                                            tokenAddress
                                                        ]
                                                    );
                                                }}
                                            >
                                                Max
                                            </MaxLink>
                                        ) : (
                                            <div />
                                        )}
                                        <input
                                            id={`input-${tokenAddress}`}
                                            name={`input-name-${tokenAddress}`}
                                            defaultValue={
                                                addLiquidityFormStore.getAmountInput(
                                                    tokenAddress
                                                ).value
                                            }
                                            onChange={e => {
                                                handleAmountInputChange(
                                                    e,
                                                    tokenAddress
                                                );
                                            }}
                                            // ref={textInput}
                                            placeholder=""
                                        />
                                    </InputWrapper>
                                </DepositAmount>
                            </TableCellRight>
                        </TableRow>
                    );
                })}
            </React.Fragment>
        );
    };

    return (
        <Wrapper>
            <HeaderRow>
                <TableCell>Asset</TableCell>
                <TableCell>Unlock</TableCell>
                <TableCell>Wallet Balance</TableCell>
                <TableCellRight>Deposit Amount</TableCellRight>
            </HeaderRow>
            {pool &&
            addLiquidityFormStore.isActivePool(poolAddress) &&
            addLiquidityFormStore.isActiveAccount(account) ? (
                renderAssetTable(pool, userBalances)
            ) : (
                <TableRow>Loading</TableRow>
            )}
        </Wrapper>
    );
});

export default AddAssetTable;
