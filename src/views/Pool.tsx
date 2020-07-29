import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import PoolAssetChartPanel from '../components/Pool/PoolAssetChartPanel';
import AddRemovePanel from '../components/Pool/AddRemovePanel';
import InfoPanel from '../components/Pool/InfoPanel';
import AddLiquidityModal from '../components/AddLiquidity/AddLiquidityModal';
import RemoveLiquidityModal from '../components/RemoveLiquidity/RemoveLiquidityModal';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import {
    formatFee,
    formatPercentage,
    isAddress,
    toChecksum,
    formatCurrency,
} from '../utils/helpers';
import { BigNumber } from '../utils/bignumber';
import { Pool } from '../types';
import { RouteComponentProps, withRouter } from 'react-router';
import PoolTabs from '../components/Pool/PoolTabs';

const PoolViewWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 27px 25px 0px 25px;
`;

const ErrorMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 32px;
    color: var(--panel-row-text);
    width: 100%;
    height: calc(100vh - 108px);
`;

const ExitComponent = styled.div`
    color: var(--exit-modal-color);
    transform: rotate(135deg);
    font-size: 22px;
    cursor: pointer;
    width: 25px;
    position: absolute;
    right: 20px;
`;

const Icon = styled.img`
    width: 26px;
    height: 24px;
    margin-right: 20px;
`;

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
    margin: 120px auto 0;
    display: flex;
    flex-direction: column;
    max-width: 862px;
    padding: 25px;
    background-color: var(--panel-background);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    color: white;
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

const InfoPanelWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    justify-content: flex-start;
`;

const PoolView = observer((props: RouteComponentProps) => {
    const getUserShareText = (
        pool: Pool,
        account: string,
        totalPoolTokens: BigNumber | undefined,
        userPoolTokens: BigNumber | undefined
    ): string => {
        let shareText = '-';

        if (account && userPoolTokens && totalPoolTokens) {
            const userShare = userPoolTokens.div(totalPoolTokens);
            if (userShare) {
                shareText = formatPercentage(userShare, 2);
            } else {
                shareText = '0%';
            }
        }

        return shareText;
    };

    const poolAddress = toChecksum(props.match.params.poolAddress);
    const {
        root: {
            poolStore,
            providerStore,
            marketStore,
            appSettingsStore,
            blockchainFetchStore,
            addLiquidityFormStore,
            removeLiquidityFormStore,
            tokenStore,
            swapsTableStore,
            contractMetadataStore,
        },
    } = useStores();

    const pool = poolStore.getPool(poolAddress);
    const account = providerStore.providerStatus.account;

    const scamTokens = contractMetadataStore.getScamTokens();

    let isScamPool = false;
    if (pool) {
        for (const token of pool.tokensList) {
            if (scamTokens.includes(token)) {
                isScamPool = true;
            }
        }
    }

    const [warningModalOpen, setWarningModalOpen] = useState(true);

    const handleCloseModal = () => {
        setWarningModalOpen(false);
    };

    useEffect(() => {
        return function cleanup() {
            swapsTableStore.clearPoolSwaps();
        };
    }, [poolAddress, swapsTableStore]);

    useEffect(() => {
        poolStore.fetchActivePool(poolAddress);
        tokenStore.fetchTotalSupplies([poolAddress]);
        if (account) {
            tokenStore.fetchTokenBalances(account, [poolAddress]);
        }
    }, [account, poolAddress, poolStore, tokenStore]);

    if (!isAddress(poolAddress)) {
        return (
            <PoolViewWrapper>
                <ErrorMessage>Please input a valid Pool address</ErrorMessage>
            </PoolViewWrapper>
        );
    }

    if (!pool) {
        return (
            <PoolViewWrapper>
                <ErrorMessage>
                    Pool with specified address not found
                </ErrorMessage>
            </PoolViewWrapper>
        );
    }

    if (isScamPool) {
        return (
            <PoolViewWrapper>
                <ErrorMessage>Pool unavailable</ErrorMessage>
            </PoolViewWrapper>
        );
    }

    if (pool) {
        if (appSettingsStore.activePoolAddress !== poolAddress) {
            console.debug(['Set Active Pool Address']);
            appSettingsStore.setActivePoolAddress(poolAddress);
            blockchainFetchStore.onActivePoolChanged();
        }
    }

    let userPoolTokens = undefined;
    const totalPoolTokens = tokenStore.getTotalSupply(poolAddress);

    if (account) {
        userPoolTokens = tokenStore.getBalance(poolAddress, account);
    }

    const feeText = pool ? formatFee(pool.swapFee) : '-';
    const shareText = getUserShareText(
        pool,
        account,
        totalPoolTokens,
        userPoolTokens
    );

    const liquidityText =
        marketStore.assetPricesLoaded && pool
            ? formatCurrency(marketStore.getPortfolioValue(pool))
            : '-';

    let volumeText = '-';
    if (pool) {
        volumeText = formatCurrency(pool.lastSwapVolume);
    }

    return (
        <PoolViewWrapper>
            {addLiquidityFormStore.modalOpen ? (
                <AddLiquidityModal poolAddress={poolAddress} />
            ) : (
                <div />
            )}
            {removeLiquidityFormStore.modalOpen ? (
                <RemoveLiquidityModal poolAddress={poolAddress} />
            ) : (
                <div />
            )}
            {pool.tokensList.includes(
                '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'
            ) ? (
                <Container
                    style={{ display: warningModalOpen ? 'block' : 'none' }}
                >
                    <ModalContent>
                        <ExitComponent onClick={() => handleCloseModal()}>
                            +
                        </ExitComponent>
                        <Error>
                            <Icon src="ErrorSign.svg" />
                            This is an extremely risky pool. A liquidity pool is
                            only as good as its weakest token. If the YFI token
                            is infinitely minted, a huge percent of the entire
                            pool supply can be stolen. PLEASE SLOW DOWN AND
                            DYOR.
                        </Error>
                    </ModalContent>
                </Container>
            ) : (
                <div />
            )}
            <PoolAssetChartPanel poolAddress={poolAddress} />
            <AddRemovePanel poolAddress={poolAddress} />
            <InfoPanelWrapper>
                <InfoPanel text={`$ ${liquidityText}`} subText="Liquidity" />
                <InfoPanel
                    text={`$ ${volumeText}`}
                    subText="Trade Volume (24hr)"
                />
                <InfoPanel text={feeText} subText="Pool Swap Fee" />
                <InfoPanel text={shareText} subText="My Pool Share" />
            </InfoPanelWrapper>
            <PoolTabs poolAddress={poolAddress} />
        </PoolViewWrapper>
    );
});

export default withRouter(PoolView);
