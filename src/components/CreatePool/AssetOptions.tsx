import React from 'react';
import styled from 'styled-components';
import { useStores } from '../../contexts/storesContext';
import { TokenIconAddress } from '../Common/WalletBalances';
import { bnum, formatBalanceTruncated } from 'utils/helpers';
import { isChainIdSupported } from '../../provider/connectors';
import { EtherKey } from '../../stores/Token';
import { observer } from 'mobx-react';

const AssetPanelContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    max-height: 329px;
    overflow: auto; /* Enable scroll if needed */
    ::-webkit-scrollbar {
        display: none;
    }
`;

const AssetPanel = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 184px;
    height: 98px;
    cursor: pointer;
    border-right: 1px solid var(--panel-border);
    border-bottom: 1px solid var(--panel-border);
    :nth-child(3n + 3) {
        border-right: none;
    }
    :nth-child(10) {
        border-bottom: none;
    }
`;

const AssetWrapper = styled.div`
    display: flex;
    flex-direction: row;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
`;

const TokenIcon = styled.img`
    width: 28px;
    height: 28px;
    margin-right: 12px;
`;

const TokenName = styled.div`
    font-size: 16px;
    line-height: 19px;
    display: flex;
    align-items: center;
`;

const TokenBalance = styled.div`
    font-size: 14px;
    line-height: 16px;
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--body-text);
    margin-top: 12px;
`;

interface Asset {
    address: string;
    iconAddress: string;
    symbol: string;
    isSupported: boolean;
    userBalance: string;
}

const AssetOptions = observer(() => {
    const {
        root: {
            providerStore,
            contractMetadataStore,
            createPoolFormStore,
            tokenStore,
        },
    } = useStores();

    const account = providerStore.providerStatus.account;
    const chainId = providerStore.providerStatus.activeChainId;

    const assetModal = createPoolFormStore.assetModal;
    const tokens = createPoolFormStore.tokens;

    const getAssetOptions = (filter, account): Asset[] => {
        const filteredWhitelistedTokenMetadata = contractMetadataStore
            .getFilteredTokenMetadata(filter)
            .filter(token => {
                const isEther = token.address === EtherKey;
                const isSupported = token.isSupported;
                const alreadyExists = tokens.includes(token.address);
                return !isEther && isSupported && !alreadyExists;
            });

        const filteredWhitelistedTokens = filteredWhitelistedTokenMetadata.map(
            tokenMetadata => tokenMetadata.address
        );

        let assetSelectorData: Asset[] = [];
        let userBalances = {};

        if (account && isChainIdSupported(chainId)) {
            userBalances = tokenStore.getAccountBalances(
                filteredWhitelistedTokens,
                account
            );
        }

        assetSelectorData = filteredWhitelistedTokenMetadata.map(value => {
            const userBalance = formatBalanceTruncated(
                userBalances[value.address]
                    ? bnum(userBalances[value.address])
                    : bnum(0),
                value.decimals,
                value.precision,
                20
            );

            return {
                address: value.address,
                iconAddress: value.iconAddress,
                symbol: value.symbol,
                isSupported: value.isSupported,
                userBalance: userBalance,
            };
        });

        return assetSelectorData;
    };

    const sortAssetOptions = (assets: Asset[], account) => {
        const buckets = {
            withBalance: [] as Asset[],
            withoutBalance: [] as Asset[],
        };
        assets.forEach(asset => {
            const hasBalance = account && bnum(asset.userBalance).gt(0);

            if (hasBalance) {
                buckets.withBalance.push(asset);
            } else {
                buckets.withoutBalance.push(asset);
            }
        });

        // We don't introduce a possibility of duplicates and therefore don't need to use Set
        return [...buckets.withBalance, ...buckets.withoutBalance];
    };

    const assets = sortAssetOptions(
        getAssetOptions(assetModal.inputValue, account),
        account
    );

    const selectAsset = token => {
        createPoolFormStore.setToken(token.address);
        createPoolFormStore.closeModal();
    };

    return (
        <AssetPanelContainer>
            {assets.map(token => (
                <AssetPanel
                    onClick={() => {
                        selectAsset(token);
                    }}
                    key={token.address}
                >
                    <AssetWrapper>
                        <TokenIcon
                            src={TokenIconAddress(
                                token.iconAddress,
                                token.isSupported
                            )}
                        />
                        <TokenName>{token.symbol}</TokenName>
                    </AssetWrapper>
                    <TokenBalance>
                        {token.userBalance} {token.symbol}
                    </TokenBalance>
                </AssetPanel>
            ))}
        </AssetPanelContainer>
    );
});

export default AssetOptions;
