import React from 'react';
import styled from 'styled-components';
import PoolOverview from '../Common/PoolOverview';
import Button from '../Common/Button';
import AddAssetTable from './AddAssetTable';

const Container = styled.div`
    display: block;
    position: fixed;
    z-index: 5;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
`;

const ModalContent = styled.div`
    position: relative;
    margin: 15% auto;
    display: flex;
    flex-direction: column;
    max-width: 862px;
    background-color: var(--panel-background);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    color: white;
`;

const AddLiquidityHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 68px;
    padding: 0px 20px;
    background-color: var(--panel-header-background);
    color: var(--header-text);
    border-bottom: 1px solid var(--panel-border);
    padding: 0px 20px 0px 20px;
`;

const AddLiquidityBody = styled.div`
    padding: 0px 20px 32px 20px;
`;

const HeaderContent = styled.div``;

const ExitComponent = styled.div`
    color: var(--exit-modal-color);
    transform: rotate(135deg);
    font-size: 22px;
    cursor: pointer;
`;

const AddLiquidityContent = styled.div`
    display: flex;
    flex-direction: row;
`;

const Notification = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 100%;
    border: 1px solid var(--panel-border);
    background: var(--panel-background);
    margin-top: 20px;
    margin-bottom: 30px;
`;

const AddLiquidityModal = ({ modelOpen, setModalOpen }) => {
    return (
        <Container style={{ display: modelOpen.state ? 'block' : 'none' }}>
            <ModalContent>
                <AddLiquidityHeader>
                    <HeaderContent>Add Liquidity</HeaderContent>
                    <ExitComponent
                        onClick={() => {
                            setModalOpen({ state: false });
                        }}
                    >
                        +
                    </ExitComponent>
                </AddLiquidityHeader>
                <AddLiquidityBody>
                    <AddLiquidityContent>
                        <PoolOverview />
                        <AddAssetTable />
                    </AddLiquidityContent>
                    <Notification>Please unlock Dai to continue</Notification>
                    <Button
                        buttonText={'Unlock Dai'}
                        active={true}
                        onClick={() => {
                            //
                        }}
                    />
                </AddLiquidityBody>
            </ModalContent>
        </Container>
    );
};

export default AddLiquidityModal;
