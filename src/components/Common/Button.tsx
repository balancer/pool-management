import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

const Button = styled.button`
    width: ${props => (props.small ? '80px' : '155px')};
    height: 38px;
    background: ${props =>
        props.primary
            ? 'var(--primary-button-background)'
            : 'var(--secondary-button-background)'};
    border: 1px solid;
    border-color: ${props =>
        props.primary
            ? 'var(--primary-button-border)'
            : 'var(--secondary-button-border)'};
    border-radius: 4px;
    color: ${props =>
        props.primary
            ? 'var(--primary-button-text)'
            : 'var(--secondary-button-text)'};
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    cursor: pointer;

    &:hover {
        background: ${props =>
            props.primary
                ? 'var(--primary-button-background-hover)'
                : 'var(--secondary-button-background-hover)'};
    }

    &:disabled {
        background: var(--disabled-button);
        border: 1px solid var(--disabled-button);
        color: var(--disabled-button-text);
        cursor: not-allowed;
    }
`;

const ButtonComponent = ({
    isActive = true,
    isPrimary = false,
    isSmall = false,
    onClick,
    text,
}) => {
    return (
        <Container>
            <Button
                onClick={onClick}
                disabled={!isActive}
                primary={isPrimary}
                small={isSmall}
            >
                {text}
            </Button>
        </Container>
    );
};

export default ButtonComponent;
