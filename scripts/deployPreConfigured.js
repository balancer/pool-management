const CombinedSchema = require('../external-contracts/combined')
const TestTokenSchema = require('../external-contracts/TestToken')
const schema = {
    BPool: require('../balancer-core/build/contracts/BPool'),
    BFactory: require('../balancer-core/build/contracts/BFactory'),
    TestToken: require('../external-contracts/TestToken')
}
const Web3 = require('web3')
const networkConfig = require('../networks.js');
const fs = require('fs');

const web3 = new Web3("http://localhost:8545");

const MAX_GAS = 0xffffffff;
const MAX_UINT = web3.utils.toTwosComplement('-1');

const abi = {
    BFactory: JSON.parse(CombinedSchema.contracts['sol/BFactory.sol:BFactory'].abi),
    BPool: JSON.parse(CombinedSchema.contracts['sol/BPool.sol:BPool'].abi),
    TestToken: TestTokenSchema.abi
}

const bin = {
    BFactory: CombinedSchema.contracts['sol/BFactory.sol:BFactory'].bin,
    BPool: CombinedSchema.contracts['sol/BPool.sol:BPool'].bin
}

const params = {
    coinParams: [
        {
            name: 'CoinA',
            symbol: 'CoinA',
            balance: '10000000000000000000',
            weight: '1000000000000000000'
        },
        {
            name: 'CoinB',
            symbol: 'CoinB',
            balance: '20000000000000000000',
            weight: '2000000000000000000'
        },
        {
            name: 'CoinC',
            symbol: 'CoinC',
            balance: '50000000000000000000',
            weight: '5000000000000000000'
        },
    ],
    extraCoinParams: [
        {
            name: 'CoinD',
            symbol: 'CoinD',
            balance: '10000000000000000000',
            weight: '1000000000000000000'
        },
        {
            name: 'CoinE',
            symbol: 'CoinE',
            balance: '20000000000000000000',
            weight: '2000000000000000000'
        },
        {
            name: 'CoinF',
            symbol: 'CoinF',
            balance: '50000000000000000000',
            weight: '5000000000000000000'
        },
    ]
}

function writeConfigFile(factoryAddress) {
    const filePath = process.cwd() + `/src/configs//deployed.json`;

    let config = {
        factoryAddress: factoryAddress,
    };

    let data = JSON.stringify(config);
    fs.writeFileSync(filePath, data);
}

async function deployPreConfigured() {
    const accounts = await web3.eth.getAccounts();
    const defaultAccount = accounts[0];
    const newManager = accounts[1];
    const investor = accounts[2];
    const user = accounts[3];

    const { coinParams, extraCoinParams } = params;

    const TestToken = new web3.eth.Contract(schema.TestToken.abi, { data: schema.TestToken.bytecode, gas: MAX_GAS, from: defaultAccount })
    const BFactory = new web3.eth.Contract(schema.BFactory.abi, { data: schema.BFactory.abi, gas: MAX_GAS, from: defaultAccount });

    let tx
    // Deploy Tokens
    let coins = [];

    for (let i = 0; i < coinParams.length; i++) {
        console.log(`Deploying Coin ${i}...`)
        const coin = await TestToken.deploy({
            data: TestTokenSchema.bytecode,
            arguments:
                [coinParams[i].name, coinParams[i].symbol, 18, '40000000000000000000000000']
        }).send({ gas: MAX_GAS })
        // const coin = new web3.eth.Contract(abi.TestToken, coinAddress)
        coins.push(coin);
    }

    for (let i = 0; i < coins.length; i++) {
        console.log(`Distributing coin ${i} to test accounts...`)
        const amount = '10000000000000000000000000'
        await coins[i].methods.transfer(newManager, amount).send()
        await coins[i].methods.transfer(investor, amount).send()
        await coins[i].methods.transfer(user, amount).send()
    }

    let extraCoins = [];

    for (let i = 0; i < extraCoinParams.length; i++) {
        console.log(`Deploying Extra Coin ${i}...`)
        const coin = await TestToken.deploy({
            data: TestTokenSchema.bytecode,
            arguments:
                [extraCoinParams[i].name, extraCoinParams[i].symbol, 18, '40000000000000000000000000']
        }).send({ gas: MAX_GAS })
        // const coin = new web3.eth.Contract(abi.TestToken, coinAddress)
        extraCoins.push(coin);
    }

    for (let i = 0; i < extraCoins.length; i++) {
        console.log(`Distributing extra coin ${i} to test accounts...`)
        const amount = '10000000000000000000000000'
        await extraCoins[i].methods.transfer(newManager, amount).send()
        await extraCoins[i].methods.transfer(investor, amount).send()
        await extraCoins[i].methods.transfer(user, amount).send()
    }

    // Deploy Factory
    const factory = await BFactory.deploy({ data: schema.BFactory.bytecode, }).send({ gas: MAX_GAS });

    // // Deploy Pool
    console.log(`Deploying BPool...`)
    tx = await factory.methods.newBPool().send()

    const poolAddress = tx.events['LOG_NEW_POOL'].returnValues.pool
    const bpool = new web3.eth.Contract(schema.BPool.abi, poolAddress, { from: defaultAccount });

    // Set Initial Pool Params


    // TODO: Multiply all weights by 100

    // await bpool.methods.setParams(coins[0].options.address, coinParams[0].balance, coinParams[0].weight)
    // Set Token Approvals + Bind Tokens
    for (let i = 0; i < coins.length; i++) {
        console.log(`Approving Coin ${i} to Bind...`)
        await coins[i].methods.approve(bpool.options.address, MAX_UINT).send()
        console.log(`Binding Coin ${i} to BPool...`)
        await bpool.methods.bind(coins[i].options.address).send({ gas: MAX_GAS })
        console.log(`Setting BPool Parameters for Coin ${i}...`)
        await bpool.methods.setParams(coins[i].options.address, coinParams[i].balance, coinParams[i].weight).send({ gas: MAX_GAS })
    }

    //Start Pool
    console.log(`Starting BPool...`)
    await bpool.methods.start().send()

    // That's it!
    console.log('-----------------')
    console.log('Deployed Factory  :', factory.options.address)
    console.log('Deployed Pool     :', bpool.options.address)
    console.log('Coins (pre-added) : ')
    for (let i = 0; i < coins.length; i++) {
        console.log(`\t\t  ${coins[i].options.address}`)
        let result = await coins[i].methods.name().call()
        result = await coins[i].methods.totalSupply().call()
    }
    console.log('Coins (not added) : ')
    for (let i = 0; i < extraCoins.length; i++) {
        console.log(`\t\t  ${extraCoins[i].options.address}`)
        let result = await extraCoins[i].methods.name().call()
        result = await extraCoins[i].methods.totalSupply().call()
    }
    console.log('-----------------')

    console.log('')
    writeConfigFile(factory.options.address)
    console.log('Deployed factory address written to config file')
}

function main() {
    deployPreConfigured();
}

main();
