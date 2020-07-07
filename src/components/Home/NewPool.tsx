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
import Button from '../Common/Button';
import Checkbox from '../Common/Checkbox';
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

const Message = styled.div`
    width: 87%;
    padding: 16px;
    display: flex;
    align-items: center;
    border: 1px solid var(--error);
    border-radius: 4px;
    font-size: 14px;
`;

const Error = styled(Message)`
    border-color: var(--error);
    color: var(--error);
`;

const Warning = styled(Message)`
    border-color: var(--warning);
    color: var(--warning);
    margin-bottom: 16px;
`;

const Check = styled(Error)``;

const Icon = styled.img`
    width: 26px;
    height: 24px;
    margin-right: 20px;
`;

const CheckboxWrapper = styled.div`
    margin-right: 16px;
`;

const Content = styled.div``;

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
    const hasValidInput = createPoolFormStore.hasValidInput();
    const confirmationCheckbox = createPoolFormStore.confirmation;
    const hasConfirmed = confirmationCheckbox.checked;

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
                text={`Add Token`}
                isActive={account && createPoolFormStore.tokens.length !== 8}
                onClick={e => handleAddButtonClick()}
            />
        );
    };

    const renderCreateButton = () => {
        return (
            <Button
                text={`Create`}
                isActive={account && hasValidInput && hasConfirmed}
                isPrimary={true}
                onClick={e => handleCreateButtonClick()}
            />
        );
    };

    const renderUnlockButton = () => {
        const token = contractMetadataStore.getTokenMetadata(lockedToken);
        return (
            <Button
                text={`Unlock ${token.symbol}`}
                isActive={account && lockedToken}
                isPrimary={true}
                onClick={e => handleUnlockButtonClick()}
            />
        );
    };

    const renderError = () => {
        if (hasValidInput) {
            return;
        }

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
                return 'Token balance in wei form needs to be at least 10^6. For example WBTC has 8 decimals so the min is 0.01 WBTC';
            if (status === ValidationStatus.BAD_WEIGHT)
                return 'Weights should be numbers from 2 to 98. Total weight should not exceed 100.';
            if (status === ValidationStatus.BAD_FEE)
                return 'Fee should be from 0.0001% to 10%';
            return '';
        }

        const errorText = getText(validationStatus);
        return (
            <Error>
                <Icon src="ErrorSign.svg" />
                <Content>{errorText}</Content>
            </Error>
        );
    };

    const renderConfirmation = () => {
        if (!hasValidInput) {
            return;
        }

        const safePool = tokens.every(tokenAddress => {
            const hasMetadata = contractMetadataStore.hasTokenMetadata(
                tokenAddress
            );
            if (!hasMetadata) {
                return false;
            }
            const metadata = contractMetadataStore.getTokenMetadata(
                tokenAddress
            );
            return metadata.isSupported;
        });
        if (safePool) {
            if (!hasConfirmed) {
                createPoolFormStore.toggleConfirmation();
            }
            return;
        }

        return (
            <Check>
                <CheckboxWrapper>
                    <Checkbox
                        checked={hasConfirmed}
                        onChange={e => {
                            createPoolFormStore.toggleConfirmation();
                        }}
                    />
                </CheckboxWrapper>
                <div>
                    <div>
                        • Do not add <b>deflationary tokens</b> or tokens with
                        transfer fees.
                    </div>
                    <div>
                        • Do not add tokens with <b>no bool return values</b>.
                    </div>
                    <div>
                        • Any other <b>non-compliance from ERC20</b> may cause
                        issues. DYOR!
                    </div>
                </div>
            </Check>
        );
    };

    return (
        <Wrapper>
            <Warning>
                <Icon src="WarningSign.svg" />
                <Content>
                    This feature is in beta. Currently, only creating shared
                    pools is supported. Make sure tokens are ERC20-compliant
                    otherwise funds can get stuck. The default list in the asset
                    selector has been vetted.
                </Content>
            </Warning>

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

            <Section>
                {renderError()}
                {renderConfirmation()}
            </Section>

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
