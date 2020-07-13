import React, { useState } from 'react';
import styled from 'styled-components';
import SelectAssetModal from './SelectAssetModal';
import { useStores } from '../../contexts/storesContext';
import { toAddressStub } from '../../utils/helpers';
import { observer } from 'mobx-react';

const Topic = styled.a`
    background-color: var(--panel-border);
    cursor: pointer;
    font-size: 13px;
    color: #fff;
    border: 0;
    display: inline-block;
    border-radius: 14px;
    padding: 0 10px;
    line-height: 28px;
    margin-left: 8px;
`;

const TopicAction = styled.span`
    position: relative;
    background-color: var(--panel-border);
    padding-right: 30px !important;
    font-size: 13px;
    color: #fff;
    border: 0;
    display: inline-block;
    border-radius: 14px;
    padding: 0 10px;
    line-height: 28px;
    margin-left: 8px;
`;

const TopicDelete = styled.a`
    cursor: pointer;
    display: inline-block;
    border-radius: 14px;
    padding: 0 10px;
    line-height: 28px;
    padding: 0 6px;
    line-height: 28px;
    position: absolute
    right: 0
    width: 16px;
    text-align: center;
    :hover {
        background-color: var(--highlighted-selector-border);
    }
`;

const Filters = observer(() => {
    const {
        root: { contractMetadataStore, poolStore },
    } = useStores();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState(
        poolStore.selectedAssets || []
    );

    const handleAddTokenClick = () => {
        setModalOpen(true);
    };

    const handleSelectAsset = asset => {
        if (!selectedAssets.includes(asset)) {
            const assets = [...selectedAssets, asset];
            setSelectedAssets(assets);
            poolStore.setSelectedAssets(assets);
        }
        setModalOpen(false);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const removeAsset = i => {
        let assets = selectedAssets;
        delete assets[i];
        assets = assets.filter(String);
        setSelectedAssets(assets);
        poolStore.setSelectedAssets(assets);
    };

    const getAssetName = asset => {
        return (
            contractMetadataStore.addressToSymbolMap[asset] ||
            toAddressStub(asset)
        );
    };

    return (
        <div>
            Filter token(s)
            {selectedAssets.map((asset, i) => (
                <TopicAction key={asset}>
                    {getAssetName(asset)}
                    <TopicDelete onClick={() => removeAsset(i)}>x</TopicDelete>
                </TopicAction>
            ))}
            <Topic onClick={e => handleAddTokenClick()}>+</Topic>
            <SelectAssetModal
                open={modalOpen}
                onSelectAsset={handleSelectAsset}
                onClose={handleCloseModal}
                selectedAssets={selectedAssets}
            />
        </div>
    );
});

export default Filters;
