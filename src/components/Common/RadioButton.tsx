import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    padding: 6px;
    display: inline-block;
    position: relative;
    flex: 0 0 auto;
    box-sizing: content-box;
    width: 18px;
    height: 18px;
    cursor: pointer;
`;

const Input = styled.input`
    position: absolute;
    margin: 0;
    padding: 0;
    opacity: 0;
    cursor: inherit;
    z-index: 1;
    top: 0px;
    right: 0px;
    left: 0px;
    width: 30px;
    height: 30px;

    &:enabled:checked + div div {
        background: #ffffff;
        border: 4px solid #8c9eff;
    }

    &:enabled:not(:checked) + div div {
        border: 1.5px solid #41476b;
    }
`;

const Background = styled.div`
    display: inline-block;
    position: relative;
    box-sizing: border-box;
    width: 18px;
    height: 18px;

    :before {
        position: absolute;
        transform: scale(0, 0);
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
        content: '';
    }
`;

const BackgroundCircle = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border-width: 2px;
    border-style: solid;
    border-radius: 50%;
`;

const RadioButton = ({ checked, onChange }) => {
    return (
        <Wrapper>
            <Input
                type="radio"
                name="radio-group"
                checked={checked}
                onChange={onChange}
            />
            <Background>
                <BackgroundCircle />
            </Background>
        </Wrapper>
    );
};

export default RadioButton;
