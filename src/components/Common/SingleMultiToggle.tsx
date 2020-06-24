import React from 'react';
import styled from 'styled-components';
import { DepositType } from '../../stores/AddLiquidityForm';

const Wrapper = styled.div`
    margin-top: 20px;
    display: flex;
    justify-content: center;
    font-size: 14px;
`;

const OptionBase = styled.div`
    width: 140px;
    height: 36px;
    display: flex;
    justify-content: center;
    border: 1px solid #41476b;
    align-items: center;
    cursor: pointer;

    :first-child {
        border-bottom-left-radius: 6px;
        border-top-left-radius: 6px;
    }

    :last-child {
        border-bottom-right-radius: 6px;
        border-top-right-radius: 6px;
    }
`;

const OptionInactive = styled(OptionBase)`
    background: rgba(255, 255, 255, 0.06);
    color: #fafafa;
`;

const OptionActive = styled(OptionBase)`
    background: #41476b;
`;

const Option = ({ active, children, onClick }) => {
    if (active) {
        return <OptionActive onClick={onClick}>{children}</OptionActive>;
    } else {
        return <OptionInactive onClick={onClick}>{children}</OptionInactive>;
    }
};

const SingleMultiToggle = ({ depositType, onSelect }) => {
    return (
        <Wrapper>
            <Option
                active={depositType === DepositType.MULTI_ASSET}
                onClick={() => {
                    onSelect(DepositType.MULTI_ASSET);
                }}
            >
                All Pool Assets
            </Option>
            <Option
                active={depositType === DepositType.SINGLE_ASSET}
                onClick={() => {
                    onSelect(DepositType.SINGLE_ASSET);
                }}
            >
                Single Asset
            </Option>
        </Wrapper>
    );
};

export default SingleMultiToggle;
