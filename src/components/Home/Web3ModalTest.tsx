import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Web3Modal from "web3modal";
import { ethers } from 'ethers';
import { useStores } from 'contexts/storesContext';
import Button from '../Common/Button';


import WalletConnectProvider from "@walletconnect/web3-provider";

const Wrapper = styled.div``;

const Web3ModalTest = () => {
    const {
        root: { providerStore },
    } = useStores();

    const [web3Modal, setWeb3Modal] = useState(null);

    useEffect(() => {
      // Update the document title using the browser API
      if(!web3Modal){
        console.log(`!!!!!!! Effect`);
        let proOptions = getProviderOptions();
        console.log(proOptions)
        let web3Modal = new Web3Modal({
          network: "kovan",
          cacheProvider: false,
          providerOptions: proOptions
        });

        setWeb3Modal(web3Modal)
      }
    }, [web3Modal]);

    const getProviderOptions = () => {
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: process.env.REACT_APP_INFURA_ID
          }
        }
      }

      return providerOptions;
    };

    const initWeb3 = async (provider) => {
      const web3 = new ethers.providers.Web3Provider(provider);

      // const web3: any = new Web3(provider);
      /*
      web3.eth.extend({
        methods: [
          {
            name: "chainId",
            call: "eth_chainId",
            outputFormatter: web3.utils.hexToNumber
          }
        ]
      });
      */
      let network = await web3.getNetwork();
      console.log(`Network`)
      console.log(network) // name, chainId
      providerStore.loadWeb3();
      return web3;
    }

    const onConnect = async () => {
      let provider;
      if(!web3Modal)
        return;

      console.log(`!!!!!!! ok`)
      console.log(web3Modal)
      provider = await web3Modal.connect();

      const web3: any = await initWeb3(provider);

      // const accounts = await web3.eth.getAccounts();

      // const address = accounts[0];
      const signer = web3.getSigner();

      console.log(`!!!!!!! ${signer}`)
      console.log(signer)
      /*
      await this.subscribeProvider(provider);

      const web3: any = initWeb3(provider);

      const accounts = await web3.eth.getAccounts();

      const address = accounts[0];

      const networkId = await web3.eth.net.getId();

      const chainId = await web3.eth.chainId();

      await this.setState({
        web3,
        provider,
        connected: true,
        address,
        chainId,
        networkId
      });
      await this.getAccountAssets();
      */
    };

    return (
      <Wrapper>
        <Button
            onClick={onConnect}
            buttonText="Connect Wallet"
            active={true}
        />
      </Wrapper>
    );
};

export default Web3ModalTest;
