import React, { Component } from 'react';
import styled from 'styled-components';
import Identicon from '../Common/Identicon';
import Button from '../Common/Button';

const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	padding: 20px;
	background: var(--panel-background);
	border: 1px solid var(--panel-border);
	border-radius: 4px;
	width: calc(67% - 99px);
	margin-left: 25px;
`

const LeftColumn = styled.div`
	display: flex;
	flex-direction: column;
	width: 60%;
`

const RightColumn = styled.div`
	display: flex;
	flex-direction: column;
	width: 40%;
`

const Spacer = styled.div`
	height: 20px;
`

const AddressContainer = styled.div`
	display: flex;
	flex-direction: row;
	color: var(--address-color);
	width: 60%;
`

const IdenticonText = styled.div`
	margin-left: 10px;
	font-family: Roboto;
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 16px;
`

const InformationContainer = styled.div`
	margin-top: 16px;
	color: var(--body-text);
	font-family: Roboto;
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 16px;
`

const AddRemovePanel = () => {

    return (
        <Wrapper>
        	<LeftColumn>
	        	<AddressContainer>
					<Identicon address="0x0d8775f648430679a709e98d2b0cb6250d2887ef" />
					<IdenticonText>0x0d8775f648430679a709e98d2b0cb6250d2887ef</IdenticonText>
	        	</AddressContainer>
	        	<InformationContainer>
	        		Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
	        		sed do eiusmod tempor incididunt ut labore et dolore aliqua. 
	        		Check out the blog post for more info.
	        	</InformationContainer>
        	</LeftColumn>
        	<RightColumn>
        		<Button
                    buttonText={"Add Liquidity"}
                    active={true}
                    onClick={() => { }}
        		/>
        		<Spacer />
        		<Button
                    buttonText={"Remove Liquidity"}
                    active={false}
                    onClick={() => { }}
        		/>
        	</RightColumn>
        </Wrapper>
    );
};

export default AddRemovePanel;
