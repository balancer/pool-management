import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import PoolOverview from '../Common/PoolOverview';
import Button from '../Common/Button';
import SingleMultiToggle from '../Common/SingleMultiToggle';
import RemoveAssetTable from './RemoveAssetTable';
import { DepositType } from '../../stores/RemoveLiquidityForm';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';

import { bnum, formatPercentage } from '../../utils/helpers';

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
    margin: 150px auto 0;
    display: flex;
    flex-direction: column;
    max-width: 862px;
    background-color: var(--panel-background);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    color: white;
`;

const RemoveLiquidityHeader = styled.div`
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

const RemoveLiquidityBody = styled.div`
    padding: 0px 20px 32px 20px;
`;

const HeaderContent = styled.div``;

const ExitComponent = styled.div`
    color: var(--exit-modal-color);
    transform: rotate(135deg);
    font-size: 22px;
    cursor: pointer;
`;

const RemoveLiquidityContent = styled.div`
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

const RemoveLiquidityModal = observer((props: Props) => {
    const { poolAddress } = props;
    const {
        root: {
            poolStore,
            tokenStore,
            providerStore,
            removeLiquidityFormStore,
        },
    } = useStores();

    const account = providerStore.providerStatus.account;

    const pool = poolStore.getPool(poolAddress);

    let loading = true;

    if (pool && !account) {
        loading = false;
    }

    const currentTotal = tokenStore.getTotalSupply(pool.address);
    const requiredDataPresent = pool && currentTotal;

    if (requiredDataPresent) {
        loading = false;
    }

    const handleRemoveLiquidity = async () => {
        const shareToWithdraw = removeLiquidityFormStore.getShareToWithdraw();
        const poolTokens = poolStore.getUserTokenPercentage(
            pool.address,
            account,
            shareToWithdraw
        );
        if (removeLiquidityFormStore.depositType === DepositType.MULTI_ASSET) {
            await poolStore.exitPool(
                pool.address,
                poolTokens.integerValue().toString(),
                poolStore.formatZeroMinAmountsOut(pool.address)
            );
        } else {
            const tokenOutAddress = removeLiquidityFormStore.activeToken;
            const minTokenAmountOut = '0';
            await poolStore.exitswapPoolAmountIn(
                pool.address,
                tokenOutAddress,
                poolTokens.integerValue().toString(),
                minTokenAmountOut
            );
        }
    };

    const renderNotification = () => {
        let currentPoolShare = '-';
        let futurePoolShare = '-';

        const currentTotal = tokenStore.getTotalSupply(pool.address);
        const userBalance = tokenStore.getBalance(pool.address, account);

        let existingShare = account
            ? poolStore.getUserShareProportion(pool.address, account)
            : bnum(0);

        if (!existingShare) {
            existingShare = bnum(0);
        }

        if (pool && currentTotal) {
            const previewTokens = removeLiquidityFormStore.hasValidInput()
                ? poolStore.getUserTokenPercentage(
                      pool.address,
                      account,
                      removeLiquidityFormStore.getShareToWithdraw()
                  )
                : bnum(0);

            const futureTotal = currentTotal.minus(previewTokens);
            const futureShare = userBalance
                .minus(previewTokens)
                .div(futureTotal);

            currentPoolShare = formatPercentage(existingShare, 2);
            futurePoolShare = formatPercentage(futureShare, 2);
        }

        if (!account) {
            return (
                <Notification>Connect wallet to remove liquidity</Notification>
            );
        }

        if (removeLiquidityFormStore.hasValidInput()) {
            const text = account ? (
                <React.Fragment>
                    Withdrawing {removeLiquidityFormStore.getShareToWithdraw()}%
                    of your liquidity. Your pool share will go from{' '}
                    {currentPoolShare} to {futurePoolShare}
                </React.Fragment>
            ) : (
                <React.Fragment></React.Fragment>
            );
            return <Notification>{text}</Notification>;
        } else {
            return (
                <Notification>
                    Please enter desired withdraw amount to continue
                </Notification>
            );
        }
    };

    const renderActionButton = () => {
        const active = account && removeLiquidityFormStore.hasValidInput();
        const dataLoaded = pool && tokenStore.getTotalSupply(pool.address);

        return (
            <Button
                buttonText={`Remove Liquidity`}
                active={active && dataLoaded}
                onClick={e => handleRemoveLiquidity()}
            />
        );
    };

    const modalOpen = removeLiquidityFormStore.modalOpen;

    const ref = useRef();

    useOnClickOutside(ref, () => removeLiquidityFormStore.closeModal());

    return (
        <Container style={{ display: modalOpen ? 'block' : 'none' }}>
            <ModalContent ref={ref}>
                <RemoveLiquidityHeader>
                    <HeaderContent>Remove Liquidity</HeaderContent>
                    <ExitComponent
                        onClick={() => removeLiquidityFormStore.closeModal()}
                    >
                        +
                    </ExitComponent>
                </RemoveLiquidityHeader>
                <RemoveLiquidityBody>
                    <SingleMultiToggle
                        depositType={removeLiquidityFormStore.depositType}
                        onSelect={depositType => {
                            removeLiquidityFormStore.setDepositType(
                                depositType
                            );
                        }}
                    />
                    <RemoveLiquidityContent>
                        <PoolOverview poolAddress={poolAddress} />
                        <RemoveAssetTable poolAddress={poolAddress} />
                    </RemoveLiquidityContent>
                    {loading ? (
                        <div>Loading</div>
                    ) : (
                        <React.Fragment>
                            {renderNotification()}
                            {renderActionButton()}
                        </React.Fragment>
                    )}
                </RemoveLiquidityBody>
            </ModalContent>
        </Container>
    );
});

export default RemoveLiquidityModal;
