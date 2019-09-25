require('dotenv').config();

require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      provider: () => {
        return new HDWalletProvider(
          process.env.GANACHE_MNENOMIC,
          'https://localhost/8545'
        );
      },
      network_id: '*',
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(
          process.env.TESTNET_MNENOMIC,
          'https://ropsten.infura.io/v3/' + process.env.INFURA_API_KEY
        );
      },
      network_id: '3',
      gas: 4465030,
      gasPrice: 10000000000
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(
          process.env.TESTNET_MNENOMIC,
          'https://kovan.infura.io/v3/' + process.env.INFURA_API_KEY
        );
      },
      network_id: '42',
      gas: 4465030,
      gasPrice: 10000000000
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          process.env.TESTNET_MNENOMIC,
          'https://rinkeby.infura.io/v3/' + process.env.INFURA_API_KEY
        ),
      network_id: 4,
      gas: 3000000,
      gasPrice: 10000000000
    },
    // main ethereum network(mainnet)
    main: {
      provider: () =>
        new HDWalletProvider(
          process.env.MAINNET_MNENOMIC,
          'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY
        ),
      network_id: 1,
      gas: 3000000,
      gasPrice: 10000000000
    }
  },
  compilers: {
    solc: {
      version: '0.5.11',
      optimizer: {}
    }
  }
};
