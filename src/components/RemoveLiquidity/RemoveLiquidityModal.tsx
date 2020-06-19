import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import PoolOverview from '../Common/PoolOverview';
import Button from '../Common/Button';
import SingleMultiToggle from '../Common/SingleMultiToggle';
import RemoveAssetTable from './RemoveAssetTable';
import { DepositType } from '../../stores/RemoveLiquidityForm';
import { ValidationStatus } from '../../stores/actions/validators';
import { EtherKey } from '../../stores/Token';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { calcSingleOutGivenPoolIn } from '../../utils/math';
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

const Error = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    background: var(--panel-background);
    color: var(--error-color);
    margin-bottom: 30px;
`;

const Warning = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    color: var(--warning);
    height: 67px;
    border: 1px solid var(--warning);
    border-radius: 4px;
    padding-left: 20px;
    margin-bottom: 30px;
`;

const Message = styled.div`
    display: inline;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.2px;
`;

const WarningIcon = styled.img`
    width: 22px;
    height: 26px;
    margin-right: 20px;
    color: var(--warning);
`;

const Link = styled.a`
    color: color: var(--warning);
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
            contractMetadataStore,
            removeLiquidityFormStore,
        },
    } = useStores();

    const account = providerStore.providerStatus.account;

    const pool = poolStore.getPool(poolAddress);

    const validationStatus = removeLiquidityFormStore.validationStatus;

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

    const renderError = () => {
        if (removeLiquidityFormStore.hasValidInput()) {
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
            if (status === ValidationStatus.INSUFFICIENT_LIQUIDITY)
                return 'Insufficient liquidity';
            return '';
        }

        const errorText = getText(validationStatus);
        return <Error>{errorText}</Error>;
    };

    const renderTokenWarning = () => {
        if (!removeLiquidityFormStore.hasValidInput()) {
            return;
        }
        let warning = false;
        const tokenWarnings = contractMetadataStore.getTokenWarnings();

        pool.tokens.forEach(token => {
            if (tokenWarnings.includes(token.address)) warning = true;
        });

        if (warning) {
            return (
                <Warning>
                    <WarningIcon src="WarningSign.svg" />
                    <Message>
                        This pool contains a non-standard token that may cause
                        potential balance issues or unknown arbitrage
                        opportunites.{' '}
                        <Link
                            href="https://docs.balancer.finance/protocol/limitations#erc20-tokens"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn more
                        </Link>
                    </Message>
                </Warning>
            );
        }
    };

    const renderLiquidityWarning = () => {
        if (!removeLiquidityFormStore.hasValidInput()) {
            return;
        }
        if (removeLiquidityFormStore.depositType === DepositType.MULTI_ASSET) {
            return;
        }
        const slippageThreshold = 0.01;
        const tokenOutAddress = removeLiquidityFormStore.activeToken;
        const tokenOut = pool.tokens.find(
            token => token.address === tokenOutAddress
        );
        const shareToWithdraw = removeLiquidityFormStore.getShareToWithdraw();
        const amount = poolStore.getUserTokenPercentage(
            pool.address,
            account,
            shareToWithdraw
        );

        const tokenBalanceOut = tokenStore.denormalizeBalance(
            tokenOut.balance,
            tokenOutAddress
        );
        const tokenWeightOut = tokenOut.denormWeight;
        const poolSupply = tokenStore.denormalizeBalance(
            pool.totalShares,
            EtherKey
        );
        const totalWeight = pool.totalWeight;
        const swapFee = pool.swapFee;

        const tokenAmountOut = calcSingleOutGivenPoolIn(
            tokenBalanceOut,
            tokenWeightOut,
            poolSupply,
            totalWeight,
            amount,
            swapFee
        );
        const expectedTokenAmountOut = amount
            .times(totalWeight)
            .times(tokenBalanceOut)
            .div(poolSupply)
            .div(tokenWeightOut);
        const one = bnum(1);
        const slippage = one.minus(tokenAmountOut.div(expectedTokenAmountOut));

        if (slippage.isNaN()) {
            return;
        }
        if (slippage.lt(slippageThreshold)) {
            return;
        }

        return (
            <Warning>
                <WarningIcon src="WarningSign.svg" />
                <Message>
                    Exit will incur {formatPercentage(slippage, 2)} of slippage
                </Message>
            </Warning>
        );
    };

    const renderNotification = () => {
        if (!removeLiquidityFormStore.hasValidInput()) {
            return;
        }
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
            const futureShare = futureTotal.isZero()
                ? bnum(0)
                : userBalance.minus(previewTokens).div(futureTotal);

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
        return (
            <Button
                buttonText={`Remove Liquidity`}
                active={
                    account &&
                    pool &&
                    removeLiquidityFormStore.hasValidInput() &&
                    tokenStore.getTotalSupply(pool.address)
                }
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
                            {renderError()}
                            {renderTokenWarning()}
                            {renderLiquidityWarning()}
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
