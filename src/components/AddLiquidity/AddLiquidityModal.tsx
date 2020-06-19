import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import PoolOverview from '../Common/PoolOverview';
import Button from '../Common/Button';
import SingleMultiToggle from '../Common/SingleMultiToggle';
import AddAssetTable from './AddAssetTable';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { Pool, PoolToken } from '../../types';
import { DepositType } from '../../stores/AddLiquidityForm';
import { ValidationStatus } from '../../stores/actions/validators';
import { EtherKey } from '../../stores/Token';
import { bnum, formatPercentage } from '../../utils/helpers';
import { calcPoolOutGivenSingleIn } from '../../utils/math';
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
    margin: 150px auto 0;
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

const LowerAmountLink = styled.span`
    margin-left: 4px;
    font-weight: 500;
    text-decoration-line: underline;
    color: var(--link-text);
    cursor: pointer;
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
        if (addLiquidityFormStore.depositType === DepositType.MULTI_ASSET) {
            return pool.tokens.find(token => {
                return !tokenStore.hasMaxApproval(
                    token.address,
                    account,
                    proxyAddress
                );
            });
        } else {
            const tokenAddress = addLiquidityFormStore.activeToken;
            const token = pool.tokens.find(
                token => token.address === tokenAddress
            );
            if (
                tokenStore.hasMaxApproval(tokenAddress, account, proxyAddress)
            ) {
                return;
            } else {
                return token;
            }
        }
    };

    const findFrontrunnableToken = (
        pool: Pool,
        account: string
    ): PoolToken | undefined => {
        if (!addLiquidityFormStore.hasValidInput()) {
            return;
        }
        let maxAmountToBalanceRatio = bnum(0);
        let maxRatioToken = undefined;
        const balances = tokenStore.getAccountBalances(
            pool.tokensList,
            account
        );
        for (const token of pool.tokens) {
            const address = token.address;
            const amount = bnum(addLiquidityFormStore.getInput(address).value);
            const denormAmount = tokenStore.denormalizeBalance(amount, address);
            const balance = balances[address];
            const amountToBalanceRatio = denormAmount.div(balance);
            if (amountToBalanceRatio.gt(maxAmountToBalanceRatio)) {
                maxAmountToBalanceRatio = amountToBalanceRatio;
                maxRatioToken = token;
            }
        }
        return maxRatioToken;
    };

    const { poolAddress } = props;
    const {
        root: {
            poolStore,
            tokenStore,
            providerStore,
            proxyStore,
            addLiquidityFormStore,
            contractMetadataStore,
        },
    } = useStores();

    const history = useHistory();
    const hasProxyInstance = proxyStore.hasInstance();

    useEffect(() => {
        if (!hasProxyInstance) {
            addLiquidityFormStore.closeModal();
            history.push('/setup');
        }
    }, [hasProxyInstance, addLiquidityFormStore, history]);

    const account = providerStore.providerStatus.account;

    const pool = poolStore.getPool(poolAddress);
    const proxyAddress = proxyStore.getInstanceAddress();

    const validationStatus = addLiquidityFormStore.validationStatus;

    let loading = true;
    let lockedToken: PoolToken | undefined = undefined;

    if (pool && !account) {
        loading = false;
    }

    if (pool && account) {
        const accountApprovalsLoaded = tokenStore.areAccountApprovalsLoaded(
            poolStore.getPoolTokens(pool.address),
            account,
            proxyAddress
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
            await tokenStore.approveMax(token.address, proxyAddress);
        } else if (action === ButtonAction.ADD_LIQUIDITY) {
            // Add Liquidity

            if (addLiquidityFormStore.depositType === DepositType.MULTI_ASSET) {
                const poolTokens = poolStore.calcPoolTokensByRatio(
                    pool,
                    addLiquidityFormStore.joinRatio
                );

                const poolTotal = tokenStore.getTotalSupply(pool.address);

                let tokenAmountsIn: string[] = [];
                pool.tokensList.forEach(tokenAddress => {
                    const token = pool.tokens.find(
                        token => token.address === tokenAddress
                    );

                    const inputAmountIn = tokenStore
                        .denormalizeBalance(
                            addLiquidityFormStore.joinRatio.times(
                                token.balance
                            ),
                            token.address
                        )
                        .div(0.99)
                        .integerValue(BigNumber.ROUND_UP);
                    const balanceAmountIn = tokenStore.getBalance(
                        token.address,
                        account
                    );
                    const tokenAmountIn = BigNumber.min(
                        inputAmountIn,
                        balanceAmountIn
                    );
                    tokenAmountsIn.push(tokenAmountIn.toString());
                });

                console.debug('joinPool', {
                    joinRatio: addLiquidityFormStore.joinRatio.toString(),
                    poolTokens: poolTokens.toString(),
                    inputs: addLiquidityFormStore.formatInputsForJoin(),
                    poolTotal: tokenStore
                        .getTotalSupply(pool.address)
                        .toString(),
                    ratioCalc: poolTokens.div(poolTotal).toString(),
                    tokenAmountsIn,
                });

                await poolStore.joinPool(
                    pool.address,
                    poolTokens.toString(),
                    tokenAmountsIn
                );
            } else {
                const tokenInAddress = addLiquidityFormStore.activeToken;
                const amount = new BigNumber(
                    addLiquidityFormStore.getInput(tokenInAddress).value
                );
                const tokenAmountIn = tokenStore
                    .denormalizeBalance(amount, tokenInAddress)
                    .integerValue(BigNumber.ROUND_UP);
                const minPoolAmountOut = '0';

                console.debug('joinswapExternAmountIn', {
                    tokenInAddress,
                    amount,
                    tokenAmountIn: tokenAmountIn.toString(),
                    minPoolAmountOut,
                });

                await poolStore.joinswapExternAmountIn(
                    pool.address,
                    tokenInAddress,
                    tokenAmountIn.toString(),
                    minPoolAmountOut
                );
            }
        }
    };

    const handleLowerAmountButton = () => {
        const frontrunningThreshold = 0.99;
        const token = findFrontrunnableToken(pool, account);
        const address = token.address;

        const balance = tokenStore.getBalance(address, account);
        const safeAmount = balance.times(frontrunningThreshold);
        const normalizedAmount = tokenStore.normalizeBalance(
            safeAmount,
            address
        );

        addLiquidityFormStore.setInputValue(
            address,
            normalizedAmount.toString()
        );
        addLiquidityFormStore.setActiveInputKey(address);

        const ratio = addLiquidityFormStore.calcRatio(
            pool,
            address,
            normalizedAmount.toString()
        );

        addLiquidityFormStore.setJoinRatio(ratio);
        addLiquidityFormStore.refreshInputAmounts(pool, account, ratio);
    };

    const renderError = () => {
        if (addLiquidityFormStore.hasValidInput()) {
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
        if (!addLiquidityFormStore.hasValidInput()) {
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

    const renderFrontrunningWarning = () => {
        if (!addLiquidityFormStore.hasValidInput()) {
            return;
        }
        if (addLiquidityFormStore.depositType === DepositType.SINGLE_ASSET) {
            return;
        }
        const frontrunningThreshold = 0.99;

        const token = findFrontrunnableToken(pool, account);
        if (!token) {
            return;
        }

        const address = token.address;
        const amount = bnum(addLiquidityFormStore.getInput(address).value);
        const denormAmount = tokenStore.denormalizeBalance(amount, address);
        const balance = tokenStore.getBalance(address, account);
        const amountToBalanceRatio = denormAmount.div(balance);
        if (
            amountToBalanceRatio.lte(frontrunningThreshold) ||
            amountToBalanceRatio.gt(1)
        ) {
            return;
        }

        return (
            <Warning>
                <WarningIcon src="WarningSign.svg" />
                <Message>
                    Join might fail due to frontrunning. Use high gas price or
                    <LowerAmountLink onClick={e => handleLowerAmountButton()}>
                        lower amounts
                    </LowerAmountLink>
                    .
                </Message>
            </Warning>
        );
    };

    const renderLiquidityWarning = () => {
        if (!addLiquidityFormStore.hasValidInput()) {
            return;
        }
        if (addLiquidityFormStore.depositType === DepositType.MULTI_ASSET) {
            return;
        }
        const slippageThreshold = 0.01;
        const tokenInAddress = addLiquidityFormStore.activeToken;
        const tokenIn = pool.tokens.find(
            token => token.address === tokenInAddress
        );
        const amount = new BigNumber(
            addLiquidityFormStore.getInput(tokenInAddress).value
        );

        const tokenBalanceIn = tokenStore.denormalizeBalance(
            tokenIn.balance,
            tokenInAddress
        );
        const tokenWeightIn = tokenIn.denormWeight;
        const poolSupply = tokenStore.denormalizeBalance(
            pool.totalShares,
            EtherKey
        );
        const totalWeight = pool.totalWeight;
        const tokenAmountIn = tokenStore
            .denormalizeBalance(amount, tokenInAddress)
            .integerValue(BigNumber.ROUND_UP);
        const swapFee = pool.swapFee;

        const poolAmountOut = calcPoolOutGivenSingleIn(
            tokenBalanceIn,
            tokenWeightIn,
            poolSupply,
            totalWeight,
            tokenAmountIn,
            swapFee
        );
        const expectedPoolAmountOut = tokenAmountIn
            .times(tokenWeightIn)
            .times(poolSupply)
            .div(tokenBalanceIn)
            .div(totalWeight);
        const one = new BigNumber(1);
        const slippage = one.minus(poolAmountOut.div(expectedPoolAmountOut));

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
                    Join will incur {formatPercentage(slippage, 2)} of slippage
                </Message>
            </Warning>
        );
    };

    const renderNotification = () => {
        if (!addLiquidityFormStore.hasValidInput()) {
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
        currentPoolShare = formatPercentage(existingShare, 2);

        if (pool && currentTotal) {
            let previewTokens = bnum(0);
            if (addLiquidityFormStore.hasValidInput()) {
                if (
                    addLiquidityFormStore.depositType ===
                    DepositType.MULTI_ASSET
                ) {
                    previewTokens = poolStore.calcPoolTokensByRatio(
                        pool,
                        addLiquidityFormStore.joinRatio
                    );
                } else {
                    const tokenInAddress = addLiquidityFormStore.activeToken;
                    const tokenIn = pool.tokens.find(
                        token => token.address === tokenInAddress
                    );
                    const amount = new BigNumber(
                        addLiquidityFormStore.getInput(tokenInAddress).value
                    );

                    const tokenBalanceIn = tokenStore.denormalizeBalance(
                        tokenIn.balance,
                        tokenInAddress
                    );
                    const tokenWeightIn = tokenIn.denormWeight;
                    const poolSupply = tokenStore.denormalizeBalance(
                        pool.totalShares,
                        EtherKey
                    );
                    const totalWeight = pool.totalWeight;
                    const tokenAmountIn = tokenStore
                        .denormalizeBalance(amount, tokenInAddress)
                        .integerValue(BigNumber.ROUND_UP);
                    const swapFee = pool.swapFee;

                    previewTokens = calcPoolOutGivenSingleIn(
                        tokenBalanceIn,
                        tokenWeightIn,
                        poolSupply,
                        totalWeight,
                        tokenAmountIn,
                        swapFee
                    );
                }
            }

            const futureTotal = currentTotal.plus(previewTokens);
            const futureShare = previewTokens
                .plus(userBalance)
                .div(futureTotal);

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
        if (lockedToken) {
            return (
                <Button
                    buttonText={`Unlock ${lockedToken.symbol}`}
                    active={!!account}
                    onClick={e =>
                        actionButtonHandler(ButtonAction.UNLOCK, lockedToken)
                    }
                />
            );
        } else {
            return (
                <Button
                    buttonText={`Add Liquidity`}
                    active={account && addLiquidityFormStore.hasValidInput()}
                    onClick={e =>
                        actionButtonHandler(ButtonAction.ADD_LIQUIDITY)
                    }
                />
            );
        }
    };

    const modalOpen = addLiquidityFormStore.modalOpen;

    const ref = useRef();

    useOnClickOutside(ref, () => addLiquidityFormStore.closeModal());

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
                    <SingleMultiToggle
                        depositType={addLiquidityFormStore.depositType}
                        onSelect={depositType => {
                            addLiquidityFormStore.setActiveInputKey(undefined);
                            addLiquidityFormStore.initializeInputs(
                                pool.tokensList
                            );
                            addLiquidityFormStore.setDepositType(depositType);
                        }}
                    />
                    <AddLiquidityContent>
                        <PoolOverview poolAddress={poolAddress} />
                        <AddAssetTable poolAddress={poolAddress} />
                    </AddLiquidityContent>
                    {loading ? (
                        <div>Loading</div>
                    ) : (
                        <React.Fragment>
                            {renderError()}
                            {renderTokenWarning()}
                            {renderFrontrunningWarning()}
                            {renderLiquidityWarning()}
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
