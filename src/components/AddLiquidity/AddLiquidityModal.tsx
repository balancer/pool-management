import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import PoolOverview from '../Common/PoolOverview';
import Button from '../Common/Button';
import AddAssetTable from './AddAssetTable';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { Pool, PoolToken } from '../../types';
import { ModalMode } from '../../stores/AddLiquidityForm';
import { bnum, formatPercentage } from '../../utils/helpers';
import { BigNumber } from '../../utils/bignumber';

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
    margin-bottom: 20px;
`;

const Notification = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 100%;
    border: 1px solid var(--panel-border);
    background: var(--panel-background);
    margin-bottom: 30px;
`;

enum ButtonAction {
    UNLOCK,
    ADD_LIQUIDITY,
    REMOVE_LIQUIDITY,
}

interface Props {
    poolAddress: string;
}

function useOnClickOutside(ref, handler) {
    useEffect(() => {
        const handleClick = event => {
            // Do nothing if clicking ref's element or descendent elements
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }

            handler(event);
        };

        const handleKeyUp = event => {
            if (event.key !== 'Escape') {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', handleClick);
        window.addEventListener('keydown', handleKeyUp, false);
        document.addEventListener('touchstart', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
            window.removeEventListener('keydown', handleKeyUp, false);
            document.removeEventListener('touchstart', handleClick);
        };
    }, [ref, handler]);
}

const AddLiquidityModal = observer((props: Props) => {
    const findLockedToken = (
        pool: Pool,
        account: string
    ): PoolToken | undefined => {
        return pool.tokens.find(token => {
            return !tokenStore.hasMaxApproval(
                token.address,
                account,
                pool.address
            );
        });
    };

    const { poolAddress } = props;
    const {
        root: { poolStore, tokenStore, providerStore, addLiquidityFormStore },
    } = useStores();

    const web3React = providerStore.getActiveWeb3React();
    const { account } = web3React;

    const pool = poolStore.getPool(poolAddress);

    let loading = true;
    let lockedToken: PoolToken | undefined = undefined;

    if (pool && !account) {
        loading = false;
    }

    if (pool && account) {
        const accountApprovalsLoaded = tokenStore.areAccountApprovalsLoaded(
            poolStore.getPoolTokens(pool.address),
            account,
            pool.address
        );

        if (accountApprovalsLoaded) {
            loading = false;
            lockedToken = findLockedToken(pool, account);
        }
    }

    const actionButtonHandler = async (
        action: ButtonAction,
        token?: PoolToken
    ) => {
        if (action === ButtonAction.UNLOCK) {
            await tokenStore.approveMax(web3React, token.address, pool.address);
        } else if (action === ButtonAction.ADD_LIQUIDITY) {
            // Add Liquidity

            const poolTokens = poolStore.calcPoolTokensByRatio(
                pool,
                addLiquidityFormStore.joinRatio
            );

            const poolTotal = tokenStore.getTotalSupply(pool.address);

            let tokenAmountsIn: string[] = [];
            pool.tokens.forEach(token => {
                const tokenAmountIn = tokenStore
                    .denormalizeBalance(
                        addLiquidityFormStore.joinRatio.times(token.balance),
                        token.address
                    )
                    .integerValue(BigNumber.ROUND_DOWN);
                tokenAmountsIn.push(tokenAmountIn.toString());
            });

            console.debug('joinPool', {
                joinRatio: addLiquidityFormStore.joinRatio.toString(),
                poolTokens: poolTokens.toString(),
                inputs: addLiquidityFormStore.formatInputsForJoin(),
                poolTotal: tokenStore.getTotalSupply(pool.address).toString(),
                ratioCalc: poolTokens.div(poolTotal).toString(),
                tokenAmountsIn,
            });

            await poolStore.joinPool(
                web3React,
                pool.address,
                poolTokens.toString(),
                addLiquidityFormStore.maxUintInputAmounts()
            );
        }
    };

    const renderNotification = () => {
        let currentPoolShare = '-';
        let futurePoolShare = '-';

        const currentTotal = tokenStore.getTotalSupply(pool.address);
        let existingShare = account
            ? poolStore.getUserShareProportion(pool.address, account)
            : bnum(0);

        if (!existingShare) {
            existingShare = bnum(0);
        }

        if (pool && currentTotal) {
            const previewTokens = addLiquidityFormStore.hasValidInput()
                ? poolStore.calcPoolTokensByRatio(
                      pool,
                      addLiquidityFormStore.joinRatio
                  )
                : bnum(0);

            const futureTotal = currentTotal.plus(previewTokens);
            const futureShare = previewTokens
                .div(futureTotal)
                .plus(existingShare);

            currentPoolShare = formatPercentage(existingShare, 2);
            futurePoolShare = formatPercentage(futureShare, 2);
        }

        if (!account && !addLiquidityFormStore.activeInputKey) {
            return <Notification>Connect wallet to add liquidity</Notification>;
        }

        if (lockedToken) {
            return (
                <Notification>
                    Please unlock {lockedToken.symbol} to continue
                </Notification>
            );
        }
        if (addLiquidityFormStore.activeInputKey) {
            const text = account ? (
                <React.Fragment>
                    Your pool share will go from {currentPoolShare} to{' '}
                    {futurePoolShare}
                </React.Fragment>
            ) : (
                <React.Fragment>
                    Your pool share would increase by {futurePoolShare}
                </React.Fragment>
            );
            return <Notification>{text}</Notification>;
        } else {
            return (
                <Notification>
                    Please enter desired liquidity to continue
                </Notification>
            );
        }
    };

    const renderActionButton = () => {
        if (
            lockedToken &&
            addLiquidityFormStore.modalMode === ModalMode.ADD_LIQUIDITY
        ) {
            return (
                <Button
                    buttonText={`Unlock ${lockedToken.symbol}`}
                    active={!!account}
                    onClick={e =>
                        actionButtonHandler(ButtonAction.UNLOCK, lockedToken)
                    }
                />
            );
        } else if (
            addLiquidityFormStore.modalMode === ModalMode.ADD_LIQUIDITY
        ) {
            return (
                <Button
                    buttonText={`Add Liquidity`}
                    active={
                        account &&
                        addLiquidityFormStore.hasValidInput() && !addLiquidityFormStore.hasInputExceedUserBalance
                    }
                    onClick={e =>
                        actionButtonHandler(ButtonAction.ADD_LIQUIDITY)
                    }
                />
            );
        }
    };

    const modalOpen = addLiquidityFormStore.modalOpen;

    const ref = useRef();

    useOnClickOutside(ref, () =>
        addLiquidityFormStore.closeModal()
    );

    return (
        <Container style={{ display: modalOpen ? 'block' : 'none' }}>
            <ModalContent ref={ref}>
                <AddLiquidityHeader>
                    <HeaderContent>Add Liquidity</HeaderContent>
                    <ExitComponent
                        onClick={() => addLiquidityFormStore.closeModal()}
                    >
                        +
                    </ExitComponent>
                </AddLiquidityHeader>
                <AddLiquidityBody>
                    <AddLiquidityContent>
                        <PoolOverview poolAddress={poolAddress} />
                        <AddAssetTable poolAddress={poolAddress} />
                    </AddLiquidityContent>
                    {loading ? (
                        <div>Loading</div>
                    ) : (
                        <React.Fragment>
                            {renderNotification()}
                            {renderActionButton()}
                        </React.Fragment>
                    )}
                </AddLiquidityBody>
            </ModalContent>
        </Container>
    );
});

export default AddLiquidityModal;
