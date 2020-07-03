import React from 'react';
import styled from 'styled-components';
import { TokenIconAddress } from '../Common/WalletBalances';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { bnum, formatCurrency, formatPercentage } from '../../utils/helpers';
import { ValidationStatus } from '../../stores/actions/validators';
const Cross = require('../../assets/images/x.svg') as string;
const Dropdown = require('../../assets/images/dropdown.svg') as string;

const Wrapper = styled.div`
    width: 90%;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
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
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    width: ${props => props.width || '10%'};
`;

const TableCellRight = styled(TableCell)`
    justify-content: flex-end;
`;

const TokenIcon = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 13px;
`;

const WeightAmount = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    border-radius: 4px;
`;

const DepositAmount = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    border-radius: 4px;
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
            -webkit-appearance: none;
            margin: 0;
            -webkit-text-fill-color: var(--body-text);
        }
        ::placeholder {
            color: var(--input-placeholder-text);
        }
        :focus {
            outline: none;
        }
        :-webkit-outer-spin-button,
        :-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
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

const ValueLabel = styled.span``;

const ExternalIcon = styled.img`
    cursor: pointer;
    filter: invert(67%) sepia(15%) saturate(333%) hue-rotate(155deg)
        brightness(94%) contrast(88%);
`;

const DropdownIcon = styled(ExternalIcon)`
    width: 12px;
    height: 12px;
    padding: 8px;
`;

const CloseIcon = styled(ExternalIcon)`
    width: 16px;
    height: 16px;
`;

const CreatePoolTable = observer(() => {
    const {
        root: {
            tokenStore,
            providerStore,
            proxyStore,
            marketStore,
            contractMetadataStore,
            createPoolFormStore,
        },
    } = useStores();

    const account = providerStore.providerStatus.account;

    let accountApprovalsLoaded = false;
    const tokens = createPoolFormStore.tokens;
    const proxyAddress = proxyStore.getInstanceAddress();

    accountApprovalsLoaded = tokenStore.areAccountApprovalsLoaded(
        tokens,
        account,
        proxyAddress
    );

    const handleCheckboxChange = async (event, tokenAddress: string) => {
        const { checked } = event.target;

        createPoolFormStore.setApprovalCheckboxTouched(tokenAddress, true);
        createPoolFormStore.setApprovalCheckboxChecked(tokenAddress, checked);

        if (checked) {
            const response = await tokenStore.approveMax(
                tokenAddress,
                proxyAddress
            );

            // Revert change on metamask error
            if (response.error) {
                createPoolFormStore.setApprovalCheckboxChecked(
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
                createPoolFormStore.setApprovalCheckboxChecked(
                    tokenAddress,
                    !checked
                );
            }
        }
    };

    const handleWeightInputChange = async (event, tokenAddress: string) => {
        const { value } = event.target;
        createPoolFormStore.setTokenWeight(tokenAddress, value);
        createPoolFormStore.setActiveInputKey(tokenAddress);
        createPoolFormStore.refreshWeights(tokenAddress);
        createPoolFormStore.refreshAmounts(tokenAddress, account);
    };

    const handleAmountInputChange = async (event, tokenAddress: string) => {
        const { value } = event.target;
        createPoolFormStore.setTokenAmount(tokenAddress, value);
        createPoolFormStore.setActiveInputKey(tokenAddress);
        createPoolFormStore.refreshAmounts(tokenAddress, account);
    };

    const handleChangeClick = async (tokenAddress: string) => {
        createPoolFormStore.openModal(tokenAddress);
    };

    const handleRemoveClick = async (tokenAddress: string) => {
        createPoolFormStore.removeToken(tokenAddress);
    };

    const formatRelativeWeight = (tokenAddress: string) => {
        const relativeWeight = createPoolFormStore.getRelativeWeight(
            tokenAddress
        );
        if (relativeWeight.isNaN()) {
            return '-';
        }
        return formatPercentage(relativeWeight, 2);
    };

    const renderAssetTable = (tokens: string[]) => {
        const tokenValues = {};
        for (const token of tokens) {
            const amountInput = createPoolFormStore.getAmountInput(token);
            const amount = bnum(amountInput.value);
            const tokenMetadata = contractMetadataStore.getTokenMetadata(token);
            const tokenValue = marketStore.hasAssetPrice(tokenMetadata.ticker)
                ? marketStore.getValue(tokenMetadata.ticker, amount)
                : bnum(NaN);
            tokenValues[token] = tokenValue;
        }

        return (
            <React.Fragment>
                {tokens.map(token => {
                    const tokenMetadata = contractMetadataStore.getTokenMetadata(
                        token
                    );

                    const checkbox = createPoolFormStore.getCheckbox(token);
                    const weightInput = createPoolFormStore.getWeightInput(
                        token
                    );
                    const amountInput = createPoolFormStore.getAmountInput(
                        token
                    );

                    let hasMaxApproval = false;

                    if (accountApprovalsLoaded) {
                        hasMaxApproval = tokenStore.hasMaxApproval(
                            token,
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

                    const valueText = tokenValues[token].isNaN()
                        ? '-'
                        : `$ ${formatCurrency(tokenValues[token])}`;

                    const hasWeightError =
                        weightInput.validation !== ValidationStatus.VALID &&
                        weightInput.validation !== ValidationStatus.EMPTY;
                    const hasAmountError =
                        amountInput.validation !== ValidationStatus.VALID &&
                        amountInput.validation !== ValidationStatus.EMPTY;

                    return (
                        <TableRow key={token}>
                            <TableCell width={'15%'}>
                                <TokenIcon
                                    src={TokenIconAddress(
                                        tokenMetadata.iconAddress,
                                        tokenMetadata.isSupported
                                    )}
                                />
                                {tokenMetadata.symbol}
                                <DropdownIcon
                                    src={Dropdown}
                                    alt="v"
                                    onClick={e => {
                                        handleChangeClick(token);
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Toggle>
                                    <ToggleInput
                                        type="checkbox"
                                        checked={visuallyChecked}
                                        disabled={!account}
                                        onChange={e =>
                                            handleCheckboxChange(e, token)
                                        }
                                    />
                                    <ToggleSlider></ToggleSlider>
                                </Toggle>
                            </TableCell>
                            <TableCellRight width={'20%'}>
                                <WeightAmount>
                                    <InputWrapper errorBorders={hasWeightError}>
                                        <input
                                            id={`input-weight-${token}`}
                                            name={`input-weight-name-${token}`}
                                            value={weightInput.value}
                                            onChange={e => {
                                                handleWeightInputChange(
                                                    e,
                                                    token
                                                );
                                            }}
                                            placeholder=""
                                        />
                                    </InputWrapper>
                                </WeightAmount>
                            </TableCellRight>
                            <TableCellRight>
                                {formatRelativeWeight(token)}
                            </TableCellRight>
                            <TableCellRight width={'20%'}>
                                <DepositAmount>
                                    <InputWrapper errorBorders={hasAmountError}>
                                        <input
                                            id={`input-amount-${token}`}
                                            name={`input-amount-name-${token}`}
                                            value={amountInput.value}
                                            onChange={e => {
                                                handleAmountInputChange(
                                                    e,
                                                    token
                                                );
                                            }}
                                            placeholder=""
                                        />
                                    </InputWrapper>
                                </DepositAmount>
                            </TableCellRight>
                            <TableCellRight width={'15%'}>
                                <ValueLabel>{valueText}</ValueLabel>
                            </TableCellRight>
                            <TableCellRight>
                                <CloseIcon
                                    src={Cross}
                                    alt="x"
                                    onClick={e => {
                                        handleRemoveClick(token);
                                    }}
                                />
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
                <TableCell width={'15%'}>Asset</TableCell>
                <TableCell>Unlock</TableCell>
                <TableCellRight width={'30%'}>
                    Weight (total max: 100)
                </TableCellRight>
                <TableCellRight width={'20%'}>Amount</TableCellRight>
                <TableCellRight width={'15%'}>Value</TableCellRight>
                <TableCellRight>Remove</TableCellRight>
            </HeaderRow>
            {renderAssetTable(tokens)}
        </Wrapper>
    );
});

export default CreatePoolTable;
