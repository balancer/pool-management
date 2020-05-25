import React from 'react';
import styled from 'styled-components';
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
    font-family: Roboto;
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
    margin-top: 32px;
`;

const Setup = () => {
    const {
        root: { providerStore, contractMetadataStore },
    } = useStores();

    const handleButtonClick = async () => {
        await providerStore.sendTransaction(
            ContractTypes.DSProxyRegistry,
            contractMetadataStore.getDsProxyRegistryAddress(),
            'build',
            []
        );
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
                            buttonText={'Setup'}
                            active={true}
                            onClick={e => handleButtonClick()}
                        />
                    </ButtonWrapper>
                </Section>
            </SectionWrapper>
        </SetupWrapper>
    );
};

export default Setup;
