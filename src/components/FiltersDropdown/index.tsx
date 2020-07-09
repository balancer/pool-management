import React, { useState } from 'react';
import styled from 'styled-components';
import SelectAssetModal from './SelectAssetModal';
const Plus = require('../../assets/images/plus-grey.svg') as string;

const ExternalIcon = styled.img`
    cursor: pointer;
    filter: invert(67%) sepia(15%) saturate(333%) hue-rotate(155deg)
        brightness(94%) contrast(88%);
`;

const PlusIcon = styled(ExternalIcon)`
    width: 12px;
    height: 12px;
    padding: 8px;
`;

const FiltersDropdown = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState([]);

    const handleAddTokenClick = () => {
        setModalOpen(true);
    };

    const handleSelectAsset = asset => {
        setSelectedAssets([...selectedAssets, asset]);
        setModalOpen(false);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <div>
            Filter token(s) {}
            {selectedAssets.map(asset => asset)}
            <PlusIcon src={Plus} alt="+" onClick={e => handleAddTokenClick()} />
            <SelectAssetModal
                open={modalOpen}
                onSelectAsset={handleSelectAsset}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default FiltersDropdown;
