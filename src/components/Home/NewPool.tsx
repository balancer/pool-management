import React, { useEffect } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import { bnum, toWei } from 'utils/helpers';
import { ContractTypes } from '../../stores/Provider';
import { EtherKey } from '../../stores/Token';
import { ValidationStatus } from '../../stores/actions/validators';
import { useStores } from '../../contexts/storesContext';
import CreatePoolTable from '../CreatePool/CreatePoolTable';
import SelectAssetModal from '../CreatePool/SelectAssetModal';
import WarningMessage from '../CreatePool/WarningMessage';
import Button from '../Common/Button';
import { BigNumber } from 'utils/bignumber';

const Wrapper = styled.div`
    padding-top: 8px;
`;

const Header = styled.div`
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 19px;
    color: var(--header-text);
    padding: 0px 0px 24px 0px;
`;

const SingleElement = styled.div`
    display: flex;
`;

const Section = styled.div`
    margin-top: 16px;
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
    color: var(--input-text);
    border: 1px solid var(--panel-border);
    background-color: var(--panel-background);
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
                inset 0 0 0 70px var(--input-hover-background);
            ::placeholder {
                color: var(--input-hover-placeholder-text);
                background-color: var(--input-hover-background);
            }
        }
    }
`;

const Error = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 90%;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
    color: var(--error-color);
`;

const NewPool = observer(() => {
    const findLockedToken = (
        tokens: string[],
        account: string
    ): string | undefined => {
        return tokens.find(token => {
            return !tokenStore.hasMaxApproval(token, account, proxyAddress);
        });
    };

    const {
        root: {
            contractMetadataStore,
            createPoolFormStore,
            providerStore,
            proxyStore,
            tokenStore,
        },
    } = useStores();

    const account = providerStore.providerStatus.account;
    const history = useHistory();
    const hasProxyInstance = proxyStore.hasInstance();
    const proxyAddress = proxyStore.getInstanceAddress();

    const feeInput = createPoolFormStore.fee;
    const hasFeeError = feeInput.validation === ValidationStatus.BAD_FEE;

    const validationStatus = createPoolFormStore.validationStatus;

    const tokens = createPoolFormStore.tokens;
    let lockedToken;
    if (account) {
        const accountApprovalsLoaded = tokenStore.areAccountApprovalsLoaded(
            tokens,
            account,
            proxyAddress
        );
        if (accountApprovalsLoaded) {
            lockedToken = findLockedToken(tokens, account);
        }
    }

    useEffect(() => {
        if (!hasProxyInstance) {
            history.push('/setup');
        }
    }, [hasProxyInstance, history]);

    const handleAddButtonClick = async () => {
        const trackedTokenAddresses = contractMetadataStore.getTrackedTokenAddresses();
        const tokens = createPoolFormStore.tokens;
        const newToken = trackedTokenAddresses.find(token => {
            const isEther = token === EtherKey;
            const alreadyExists = tokens.includes(token);
            return !isEther && !alreadyExists;
        });
        createPoolFormStore.addToken(newToken);
    };

    const handleCreateButtonClick = async () => {
        const dsProxyAddress = proxyStore.getInstanceAddress();
        const bActions = contractMetadataStore.getBActionsAddress();
        const factory = contractMetadataStore.getBFactoryAddress();
        const tokens = createPoolFormStore.tokens;
        const balances = tokens.map(token => {
            const amountInput = createPoolFormStore.amounts[token];
            const amount = bnum(amountInput.value);
            return tokenStore
                .denormalizeBalance(amount, token)
                .integerValue(BigNumber.ROUND_DOWN)
                .toString();
        });
        const denorms = tokens.map(token => {
            const weightInput = createPoolFormStore.weights[token];
            const weight = weightInput.value;
            return toWei(weight)
                .div(2)
                .toString();
        });
        const swapFee = toWei(createPoolFormStore.fee.value)
            .div(100)
            .toString();
        const finalize = true;
        const data = proxyStore.wrapTransaction(
            ContractTypes.BActions,
            'create',
            [factory, tokens, balances, denorms, swapFee, finalize]
        );
        await providerStore.sendTransaction(
            ContractTypes.DSProxy,
            dsProxyAddress,
            'execute',
            [bActions, data]
        );
    };

    const handleUnlockButtonClick = async () => {
        await tokenStore.approveMax(lockedToken, proxyAddress);
    };

    const handleInputChange = async event => {
        const { value } = event.target;
        createPoolFormStore.setFee(value);
    };

    const renderAddButton = () => {
        return (
            <Button
                buttonText={`Add Token`}
                active={account && createPoolFormStore.tokens.length !== 8}
                onClick={e => handleAddButtonClick()}
            />
        );
    };

    const renderCreateButton = () => {
        return (
            <Button
                buttonText={`Create`}
                active={account && createPoolFormStore.hasValidInput()}
                onClick={e => handleCreateButtonClick()}
            />
        );
    };

    const renderUnlockButton = () => {
        const token = contractMetadataStore.getTokenMetadata(lockedToken);
        return (
            <Button
                buttonText={`Unlock ${token.symbol}`}
                active={account && lockedToken}
                onClick={e => handleUnlockButtonClick()}
            />
        );
    };

    const renderError = () => {
        function getText(status: ValidationStatus) {
            if (status === ValidationStatus.EMPTY)
                return "Values can't be empty ";
            if (status === ValidationStatus.ZERO) return "Values can't be zero";
            if (status === ValidationStatus.NOT_FLOAT)
                return 'Values should be numbers';
            if (status === ValidationStatus.NEGATIVE)
                return 'Values should be positive numbers';
            if (status === ValidationStatus.INSUFFICIENT_BALANCE)
                return 'Insufficient balance';
            if (status === ValidationStatus.MINIMUM_BALANCE)
                return 'Values should have at least 6 decimals';
            if (status === ValidationStatus.BAD_WEIGHT)
                return 'Weights should be numbers from 2 to 98. Total weight should not exceed 100.';
            if (status === ValidationStatus.BAD_FEE)
                return 'Fee should be from 0.0001% to 10%';
            return '';
        }

        const errorText = getText(validationStatus);
        return <Error>{errorText}</Error>;
    };

    return (
        <Wrapper>
            <WarningMessage />
            <Header>Tokens</Header>
            <CreatePoolTable />
            <Section>
                <SingleElement>{renderAddButton()}</SingleElement>
            </Section>
            <Section>
                <Header>Swap fee</Header>
                <SingleElement>
                    <InputWrapper errorBorders={hasFeeError}>
                        <input
                            value={feeInput.value}
                            onChange={e => {
                                handleInputChange(e);
                            }}
                            placeholder=""
                        />
                        %
                    </InputWrapper>
                </SingleElement>
            </Section>
            {validationStatus !== ValidationStatus.VALID ? (
                <Section>{renderError()}</Section>
            ) : (
                <div />
            )}
            <Section>
                <SingleElement>
                    {lockedToken ? renderUnlockButton() : renderCreateButton()}
                </SingleElement>
            </Section>
            <SelectAssetModal />
        </Wrapper>
    );
});

export default NewPool;
