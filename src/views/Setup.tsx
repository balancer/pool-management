import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import Button from '../components/Common/Button';
import { ContractTypes } from '../stores/Provider';

const SetupWrapper = styled.div`
    position: relative;
    padding: 32px 30px 0px 30px;
    height: 100%;
    box-sizing: border-box;
    color: var(--body-text);

    @media screen and (max-width: 1024px) {
        padding: 32px 10px 0px 10px;
    }
`;

const SectionWrapper = styled.div`
    height: 70%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Section = styled.div`
    width: 306px;
    padding: 8px 32px 32px 32px;
    background: var(--panel-background);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
`;

const Header = styled.div`
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 19px;
    color: var(--header-text);
    padding: 24px 0px;
`;

const Explainer = styled.div`
    font-size: 14px;
`;

const ButtonWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin: 32px 0 16px 0;
`;

const Setup = observer(() => {
    const {
        root: { providerStore, proxyStore, contractMetadataStore },
    } = useStores();

    const isDeploying = proxyStore.isDeploying();
    const hasInstance = proxyStore.hasInstance();
    const history = useHistory();

    const handleButtonClick = async () => {
        if (isInstanceReady()) {
            history.goBack();
        } else {
            const tx = await providerStore.sendTransaction(
                ContractTypes.DSProxyRegistry,
                contractMetadataStore.getDsProxyRegistryAddress(),
                'build',
                []
            );
            if (tx.error) {
                return;
            }
            proxyStore.setDeploying(true);
            await tx.txResponse.wait(10);
            proxyStore.setDeploying(false);
        }
    };

    const isInstanceReady = () => {
        return hasInstance && !isDeploying;
    };

    return (
        <SetupWrapper>
            <SectionWrapper>
                <Section>
                    <Header>Setup Proxy</Header>
                    <Explainer>
                        Create proxy contract to manage liquidity on Balancer.
                    </Explainer>
                    <ButtonWrapper>
                        <Button
                            isActive={!isDeploying}
                            isPrimary={true}
                            text={isInstanceReady() ? 'Next' : 'Setup'}
                            onClick={e => handleButtonClick()}
                        />
                    </ButtonWrapper>
                    {isDeploying ? (
                        <Explainer>
                            Waiting for 10 block confirmations…
                        </Explainer>
                    ) : (
                        <div />
                    )}
                </Section>
            </SectionWrapper>
        </SetupWrapper>
    );
});

export default Setup;
