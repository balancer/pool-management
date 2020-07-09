import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import PoolOverview from '../Common/PoolOverview';
import Button from '../Common/Button';
import Checkbox from '../Common/Checkbox';
import SingleMultiToggle from '../Common/SingleMultiToggle';
import AddAssetTable from './AddAssetTable';
import { observer } from 'mobx-react';
import { useStores } from '../../contexts/storesContext';
import { Pool, PoolToken, UserShare } from '../../types';
import { DepositType } from '../../stores/AddLiquidityForm';
import { ValidationStatus } from '../../stores/actions/validators';
import { EtherKey } from '../../stores/Token';
import { bnum, formatPercentage, isTxReverted } from '../../utils/helpers';
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
    margin: 60px auto 0;
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

const Check = styled(Error)``;

const Icon = styled.img`
    width: 26px;
    height: 24px;
    margin-right: 20px;
`;

const Content = styled.div``;

const LowerAmountLink = styled.span`
    margin-left: 4px;
    font-weight: 500;
    text-decoration-line: underline;
    color: var(--link-text);
    cursor: pointer;
`;

const Link = styled.a`
    color: color: var(--warning);
    margin: 0 4px;
`;

const CheckboxWrapper = styled.div`
    margin-right: 16px;
`;

const ButtonWrapper = styled.div`
    margin-top: 16px;
`;

enum ButtonAction {
    UNLOCK,
    ADD_LIQUIDITY,
    REMOVE_LIQUIDITY,
}

interface Props {
    poolAddress: string;
}

const BALANCE_BUFFER = 0.01;

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
                return !tokenStore.hasApproval(
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
            if (tokenStore.hasApproval(tokenAddress, account, proxyAddress)) {
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
        if (!hasValidInput) {
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
            let addedTokens = bnum(0);
            if (hasValidInput) {
                if (
                    addLiquidityFormStore.depositType ===
                    DepositType.MULTI_ASSET
                ) {
                    addedTokens = poolStore.calcPoolTokensByRatio(
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

                    addedTokens = calcPoolOutGivenSingleIn(
                        tokenBalanceIn,
                        tokenWeightIn,
                        poolSupply,
                        totalWeight,
                        tokenAmountIn,
                        swapFee
                    );
                }
            }

            const futureTotal = currentTotal.plus(addedTokens);
            futureShare = addedTokens.plus(userBalance).div(futureTotal);
        }

        return {
            current: currentShare,
            future: futureShare,
        };
    };

    const hasSnx = (pool: Pool): boolean => {
        return hasToken(pool, 'SNX');
    };

    const hasSynth = (pool: Pool): boolean => {
        const synths = ['sUSD', 'sBTC', 'sETH', 'sXAU'];
        return synths.some(synth => hasToken(pool, synth));
    };

    const hasAToken = (pool: Pool): boolean => {
        const aTokens = [
            'aDAI',
            'aUSDT',
            'aUSDC',
            'aSUSD',
            'aTUSD',
            'aBUSD',
            'aBAT',
            'aETH',
            'aKNC',
            'aLEND',
            'aLINK',
            'aMANA',
            'aMKR',
            'aREP',
            'aSNX',
            'aWBTC',
            'aZRX',
        ];
        return aTokens.some(aToken => hasToken(pool, aToken));
    };

    const hasCToken = (pool: Pool): boolean => {
        const cTokens = [
            'cUSDC',
            'cDAI',
            'cETH',
            'cUSDT',
            'cREP',
            'cZRX',
            'cBAT',
            'cWBTC',
        ];
        return cTokens.some(cToken => hasToken(pool, cToken));
    };

    const hasToken = (pool: Pool, symbol: string): boolean => {
        const tokenAddress = contractMetadataStore.symbolToAddressMap[symbol];
        return pool.tokensList.includes(tokenAddress);
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
    const hasValidInput = addLiquidityFormStore.hasValidInput();

    const confirmationCheckbox = addLiquidityFormStore.confirmation;
    const hasConfirmed = confirmationCheckbox.checked;

    const hasTransactionError = addLiquidityFormStore.hasTransactionError;

    const tokenErrors = contractMetadataStore.getTokenErrors();
    const hasTokenError = pool.tokens.some(token => {
        return tokenErrors.transferFee.includes(token.address);
    });

    const userShare = calculateUserShare(pool, account, hasValidInput);

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
                        .div(1 - BALANCE_BUFFER)
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

                const response = await poolStore.joinPool(
                    pool.address,
                    poolTokens.toString(),
                    tokenAmountsIn
                );

                if (isTxReverted(response)) {
                    addLiquidityFormStore.setTransactionError();
                }
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

                const response = await poolStore.joinswapExternAmountIn(
                    pool.address,
                    tokenInAddress,
                    tokenAmountIn.toString(),
                    minPoolAmountOut
                );

                if (isTxReverted(response)) {
                    addLiquidityFormStore.setTransactionError();
                }
            }
        }
    };

    const handleLowerAmountButton = () => {
        const frontrunningThreshold = 1 - BALANCE_BUFFER;
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
        if (hasValidInput || hasTokenError) {
            return;
        }

        function getText(status: ValidationStatus) {
            if (status === ValidationStatus.EMPTY)
                return "Values can't be empty";
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

    const renderTransferError = () => {
        if (!hasTransactionError) {
            return;
        }

        let message =
            'Adding liquidity failed as one of the underlying tokens blocked the transfer. ';
        if (hasSnx(pool)) {
            message =
                'Adding liquidity failed as your SNX is locked in staking. ';
        }
        if (hasSynth(pool)) {
            message =
                'Adding liquidity failed as your Synthetix position might go underwater. ';
        }
        if (hasAToken(pool)) {
            message =
                'Adding liquidity failed as your Aave position might go underwater. ';
        }
        if (hasCToken(pool)) {
            message =
                'Adding liquidity failed as your Compound position might go underwater. ';
        }

        return (
            <Error>
                <Icon src="ErrorSign.svg" />
                <Content>
                    {message}
                    Reach out to our
                    <Link
                        href="https://discord.gg/ARJWaeF"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Discord
                    </Link>
                    for help.
                </Content>
            </Error>
        );
    };

    const renderTokenError = () => {
        if (!hasTokenError) {
            return;
        }

        return (
            <Error>
                <Icon src="ErrorSign.svg" />
                <Content>
                    This pool contains a deflationary token that is likely to
                    cause loss of funds. Do not deposit.
                    <Link
                        href="https://medium.com/balancer-protocol/incident-with-non-standard-erc20-deflationary-tokens-95a0f6d46dea"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more
                    </Link>
                </Content>
            </Error>
        );
    };

    const renderConfirmation = () => {
        if (!hasValidInput || hasTokenError) {
            return;
        }

        const safePool = pool.tokensList.every(tokenAddress => {
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
                addLiquidityFormStore.toggleConfirmation();
            }
            return;
        }

        return (
            <Check>
                <CheckboxWrapper>
                    <Checkbox
                        checked={hasConfirmed}
                        onChange={e => {
                            addLiquidityFormStore.toggleConfirmation();
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

    const renderTokenWarning = () => {
        if (!hasValidInput || hasTokenError) {
            return;
        }
        const tokenWarnings = contractMetadataStore.getTokenWarnings();

        const warning = pool.tokens.some(token => {
            return tokenWarnings.includes(token.address);
        });
        if (!warning) {
            return;
        }

        return (
            <Warning>
                <Icon src="WarningSign.svg" />
                <Content>
                    This pool contains a non-standard token that may cause
                    potential balance issues or unknown arbitrage opportunites.{' '}
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
    };

    const renderFrontrunningWarning = () => {
        if (!hasValidInput || hasTokenError) {
            return;
        }
        if (addLiquidityFormStore.depositType === DepositType.SINGLE_ASSET) {
            return;
        }

        const frontrunningThreshold = 1 - BALANCE_BUFFER;

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
                <Icon src="WarningSign.svg" />
                <Content>
                    Adding liquidity might fail due to using max balance and a
                    trade occuring before transaction is mined. Use high gas
                    price or
                    <LowerAmountLink onClick={e => handleLowerAmountButton()}>
                        lower amounts
                    </LowerAmountLink>
                    .
                </Content>
            </Warning>
        );
    };

    const renderLiquidityWarning = () => {
        if (!hasValidInput || hasTokenError) {
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
                <Icon src="WarningSign.svg" />
                <Content>
                    Adding liquidity will incur {formatPercentage(slippage, 2)}{' '}
                    of slippage
                </Content>
            </Warning>
        );
    };

    const renderNotification = () => {
        if (!account) {
            return <Notification>Connect wallet to add liquidity</Notification>;
        }
    };

    const renderActionButton = () => {
        if (lockedToken) {
            return (
                <ButtonWrapper>
                    <Button
                        text={`Unlock ${lockedToken.symbol}`}
                        isActive={!!account}
                        isPrimary={true}
                        onClick={e =>
                            actionButtonHandler(
                                ButtonAction.UNLOCK,
                                lockedToken
                            )
                        }
                    />
                </ButtonWrapper>
            );
        } else {
            return (
                <ButtonWrapper>
                    <Button
                        text={`Add Liquidity`}
                        isActive={
                            account &&
                            hasValidInput &&
                            !hasTransactionError &&
                            !hasTokenError &&
                            hasConfirmed
                        }
                        isPrimary={true}
                        onClick={e =>
                            actionButtonHandler(ButtonAction.ADD_LIQUIDITY)
                        }
                    />
                </ButtonWrapper>
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
                        <PoolOverview
                            poolAddress={poolAddress}
                            userShare={userShare}
                        />
                        <AddAssetTable poolAddress={poolAddress} />
                    </AddLiquidityContent>
                    {loading ? (
                        <div>Loading</div>
                    ) : (
                        <React.Fragment>
                            {renderError()}
                            {renderTransferError()}
                            {renderTokenError()}
                            {renderConfirmation()}

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
