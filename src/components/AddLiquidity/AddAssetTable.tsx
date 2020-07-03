import React from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';
import RadioButton from '../Common/RadioButton';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { BigNumberMap, Pool } from '../../types';
import { formatBalanceTruncated } from '../../utils/helpers';
import { BigNumber } from '../../utils/bignumber';
import { DepositType } from '../../stores/AddLiquidityForm';
import { ValidationStatus } from '../../stores/actions/validators';

const Wrapper = styled.div`
    width: calc(80% - 20px);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
    margin-top: 20px;
    margin-left: 20px;
`;

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    color: var(--body-text);
    border-bottom: 1px solid var(--panel-border);
    padding: 20px 25px 20px 25px;
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
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    opacity: ${props => (props.inactive ? 0.6 : 1)};
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
    border-radius: 4px;
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

const RadioButtonWrapper = styled.div`
    margin-right: 8px;
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

const InputWrapper = styled.div`
    height: 30px;
    padding: 0px 17px;
    font-style: normal;
    font-weight: 500;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    input {
        width: 70px;
        text-align: right;
        color: var(--input-text);
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
        letter-spacing: 0.2px;
        padding-left: 5px;
        background-color: var(--panel-background);
        border: none;
        box-shadow: inset 0 0 0 1px var(--panel-background),
            inset 0 0 0 70px var(--panel-background);
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
    border: ${props => (props.errorBorders ? '1px solid var(--error)' : '')};
    margin-left: ${props => (props.errorBorders ? '-1px' : '0px')}
    margin-right: ${props => (props.errorBorders ? '-1px' : '0px')}
    :hover {
        background-color: var(--input-hover-background);
        border: ${props =>
            props.errorBorders
                ? '1px solid var(--error)'
                : '1px solid var(--input-hover-border);'};
        margin-left: -1px;
        margin-right: -1px;
        input {
            background-color: var(--input-hover-background);
            box-shadow: inset 0 0 0 1px var(--input-hover-background),
                inset 0 0 0 70px var(--input-hover-background);
            ::placeholder {
                color: var(--input-hover-placeholder-text);
                background-color: var(--input-hover-background);
            }
        }
    }
`;

interface Props {
    poolAddress: string;
}

const AddAssetTable = observer((props: Props) => {
    const { poolAddress } = props;

    const {
        root: {
            poolStore,
            tokenStore,
            providerStore,
            proxyStore,
            contractMetadataStore,
            addLiquidityFormStore,
        },
    } = useStores();

    const account = providerStore.providerStatus.account;

    const pool = poolStore.getPool(poolAddress);
    const proxyAddress = proxyStore.getInstanceAddress();
    let userBalances: undefined | BigNumberMap;
    let accountApprovalsLoaded = false;

    if (pool) {
        userBalances = tokenStore.getAccountBalances(pool.tokensList, account);
        accountApprovalsLoaded = tokenStore.areAccountApprovalsLoaded(
            poolStore.getPoolTokens(pool.address),
            account,
            proxyAddress
        );
    }

    const handleMaxLinkClick = async (
        tokenAddress: string,
        balance: BigNumber
    ) => {
        let maxValue = '0.00';
        const userBalance = tokenStore.normalizeBalance(balance, tokenAddress);

        if (userBalance && !userBalance.eq(0)) {
            maxValue = userBalance.toString();
        }

        addLiquidityFormStore.setInputValue(tokenAddress, maxValue);
        addLiquidityFormStore.setActiveInputKey(tokenAddress);

        const ratio = addLiquidityFormStore.calcRatio(
            pool,
            tokenAddress,
            maxValue
        );

        addLiquidityFormStore.setJoinRatio(ratio);
        addLiquidityFormStore.refreshInputAmounts(pool, account, ratio);
    };

    const handleCheckboxChange = async (event, tokenAddress: string) => {
        const { checked } = event.target;

        addLiquidityFormStore.setApprovalCheckboxTouched(tokenAddress, true);
        addLiquidityFormStore.setApprovalCheckboxChecked(tokenAddress, checked);

        if (checked) {
            const response = await tokenStore.approveMax(
                tokenAddress,
                proxyAddress
            );

            // Revert change on metamask error
            if (response.error) {
                addLiquidityFormStore.setApprovalCheckboxChecked(
                    tokenAddress,
                    !checked
                );
            }
        } else {
            const response = await tokenStore.revokeApproval(
                tokenAddress,
                proxyAddress
            );

            // Revert change on metamask error
            if (response.error) {
                addLiquidityFormStore.setApprovalCheckboxChecked(
                    tokenAddress,
                    !checked
                );
            }
        }
    };

    const handleInputChange = async (event, tokenAddress: string) => {
        const { value } = event.target;
        addLiquidityFormStore.setInputValue(tokenAddress, value);
        addLiquidityFormStore.setActiveInputKey(tokenAddress);

        const ratio = addLiquidityFormStore.calcRatio(
            pool,
            tokenAddress,
            value
        );
        addLiquidityFormStore.setJoinRatio(ratio);
        addLiquidityFormStore.refreshInputAmounts(pool, account, ratio);
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

                    const checkbox = addLiquidityFormStore.getCheckbox(
                        tokenAddress
                    );
                    const input = addLiquidityFormStore.getInput(tokenAddress);

                    let hasMaxApproval = false;

                    if (accountApprovalsLoaded) {
                        hasMaxApproval = tokenStore.hasMaxApproval(
                            tokenAddress,
                            account,
                            proxyAddress
                        );
                    }

                    let visuallyChecked;

                    if (checkbox.touched) {
                        visuallyChecked = checkbox.checked;
                    } else if (accountApprovalsLoaded) {
                        visuallyChecked = hasMaxApproval;
                    } else {
                        visuallyChecked = false;
                    }

                    let normalizedUserBalance = '0';
                    let userBalanceToDisplay = '-';

                    if (userBalances && userBalances[tokenAddress]) {
                        normalizedUserBalance = formatBalanceTruncated(
                            userBalances[tokenAddress],
                            tokenMetadata.decimals,
                            tokenMetadata.precision,
                            20
                        );

                        userBalanceToDisplay = normalizedUserBalance;
                    }

                    const inactiveToken =
                        addLiquidityFormStore.depositType ===
                            DepositType.SINGLE_ASSET &&
                        addLiquidityFormStore.activeToken !== token.address;

                    let hasError =
                        input.validation ===
                        ValidationStatus.INSUFFICIENT_BALANCE;

                    if (
                        addLiquidityFormStore.activeInputKey === token.address
                    ) {
                        hasError =
                            input.validation !== ValidationStatus.VALID &&
                            input.validation !== ValidationStatus.EMPTY;
                    }

                    return (
                        <TableRow key={token.address} inactive={inactiveToken}>
                            <TableCell>
                                {addLiquidityFormStore.depositType ===
                                DepositType.SINGLE_ASSET ? (
                                    <RadioButtonWrapper>
                                        <RadioButton
                                            checked={
                                                addLiquidityFormStore.activeToken ===
                                                token.address
                                            }
                                            onChange={e =>
                                                addLiquidityFormStore.setActiveToken(
                                                    tokenAddress
                                                )
                                            }
                                        />
                                    </RadioButtonWrapper>
                                ) : (
                                    <div />
                                )}
                                <TokenIcon
                                    src={TokenIconAddress(
                                        tokenMetadata.iconAddress,
                                        tokenMetadata.isSupported
                                    )}
                                />
                                {tokenMetadata.symbol}
                            </TableCell>
                            <TableCell>
                                <Toggle>
                                    <ToggleInput
                                        type="checkbox"
                                        checked={visuallyChecked}
                                        disabled={!account}
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
                                {userBalanceToDisplay} {token.symbol}
                            </TableCell>
                            <TableCellRight>
                                {addLiquidityFormStore.depositType ===
                                    DepositType.MULTI_ASSET ||
                                addLiquidityFormStore.activeToken ===
                                    tokenAddress ? (
                                    <DepositAmount>
                                        <InputWrapper errorBorders={hasError}>
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
                                                value={
                                                    addLiquidityFormStore.getInput(
                                                        tokenAddress
                                                    ).value
                                                }
                                                onChange={e => {
                                                    handleInputChange(
                                                        e,
                                                        tokenAddress
                                                    );
                                                }}
                                                // ref={textInput}
                                                placeholder=""
                                            />
                                        </InputWrapper>
                                    </DepositAmount>
                                ) : (
                                    <div />
                                )}
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
            {pool ? (
                renderAssetTable(pool, userBalances)
            ) : (
                <TableRow>Loading</TableRow>
            )}
        </Wrapper>
    );
});

export default AddAssetTable;
