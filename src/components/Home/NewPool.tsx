import React, { useEffect } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import { bnum, toWei } from 'utils/helpers';
import { ContractTypes } from '../../stores/Provider';
import { EtherKey } from '../../stores/Token';
import { useStores } from '../../contexts/storesContext';
import CreatePoolTable from '../CreatePool/CreatePoolTable';
import SelectAssetModal from '../CreatePool/SelectAssetModal';
import WarningMessage from '../CreatePool/WarningMessage';
import Button from '../Common/Button';

const Wrapper = styled.div`
    padding-top: 8px;
`;

const Header = styled.div`
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 19px;
    color: var(--header-text);
    padding: 24px 0px 24px 0px;
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
    font-family: Roboto;
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

const NewPool = observer(() => {
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

    useEffect(() => {
        if (!hasProxyInstance) {
            history.push('/setup');
        }
    }, [hasProxyInstance, history]);

    const feeInput = createPoolFormStore.fee;
    let hasError = false;

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
            const balanceInput = createPoolFormStore.balances[token];
            const balance = bnum(balanceInput.value);
            const denormalizedBalance = tokenStore.denormalizeBalance(
                balance,
                token
            );
            return denormalizedBalance.toString();
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
                active={
                    account &&
                    createPoolFormStore.hasValidInput() &&
                    !createPoolFormStore.hasInputExceedUserBalance
                }
                onClick={e => handleCreateButtonClick()}
            />
        );
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
                    <InputWrapper errorBorders={hasError}>
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
                <SingleElement>{renderCreateButton()}</SingleElement>
            </Section>
            <SelectAssetModal />
        </Wrapper>
    );
});

export default NewPool;
