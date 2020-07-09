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
import { Pool, UserShare } from '../../types';

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
    margin: 60px auto 0;
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

const Message = styled.div`
    margin-top: 16px;
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
`;

const Notification = styled(Message)`
    border-color: var(--panel-border);
`;

const Icon = styled.img`
    width: 26px;
    height: 24px;
    margin-right: 20px;
`;

const Content = styled.div``;

const Link = styled.a`
    color: color: var(--warning);
`;

const ButtonWrapper = styled.div`
    margin-top: 16px;
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
    const calculateUserShare = (
        pool: Pool,
        account: string,
        hasValidInput: boolean
    ): UserShare => {
        const currentTotal = tokenStore.getTotalSupply(pool.address);
        const userBalance = tokenStore.getBalance(pool.address, account);

        let currentShare;
        let futureShare;

        if (account) {
            currentShare = poolStore.getUserShareProportion(
                pool.address,
                account
            );
        }

        if (pool && currentTotal) {
            const removedTokens = hasValidInput
                ? poolStore.getUserTokenPercentage(
                      pool.address,
                      account,
                      removeLiquidityFormStore.getShareToWithdraw()
                  )
                : bnum(0);

            const futureTotal = currentTotal.minus(removedTokens);
            futureShare = futureTotal.isZero()
                ? bnum(0)
                : userBalance.minus(removedTokens).div(futureTotal);
        }

        return {
            current: currentShare,
            future: futureShare,
        };
    };

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
    const hasValidInput = removeLiquidityFormStore.hasValidInput();

    const userShare = calculateUserShare(pool, account, hasValidInput);

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
            if (status === ValidationStatus.INSUFFICIENT_LIQUIDITY)
                return 'Insufficient liquidity';
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

    const renderTokenWarning = () => {
        if (!hasValidInput) {
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
                    <Icon src="WarningSign.svg" />
                    <Content>
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
                    </Content>
                </Warning>
            );
        }
    };

    const renderLiquidityWarning = () => {
        if (!hasValidInput) {
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
                <Icon src="WarningSign.svg" />
                <Content>
                    Removing liquidity will incur{' '}
                    {formatPercentage(slippage, 2)} of slippage
                </Content>
            </Warning>
        );
    };

    const renderNotification = () => {
        if (!account) {
            return (
                <Notification>Connect wallet to remove liquidity</Notification>
            );
        }
    };

    const renderActionButton = () => {
        const hasSupply = !!tokenStore.getTotalSupply(pool.address);
        return (
            <ButtonWrapper>
                <Button
                    text={`Remove Liquidity`}
                    isActive={account && pool && hasValidInput && hasSupply}
                    isPrimary={true}
                    onClick={e => handleRemoveLiquidity()}
                />
            </ButtonWrapper>
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
                        <PoolOverview
                            poolAddress={poolAddress}
                            userShare={userShare}
                        />
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
