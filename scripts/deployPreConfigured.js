const bcore = require('../balancer-core')
const TestTokenSchema = require('../external-contracts/TestToken')
const Web3 = require('web3')
const networkConfig = require('../networks.js');
const fs = require('fs');

const web3 = new Web3("http://localhost:8545");

const MAX_GAS = 0xffffffff;
const MAX_UINT = web3.utils.toTwosComplement('-1');

const abi = {
    BFactory: JSON.parse(bcore.types.BFactory.abi),
    BPool: JSON.parse(bcore.types.BPool.abi),
    TestToken: TestTokenSchema.abi
}

const bin = {
    BFactory: bcore.types.BFactory.bin,
    BPool: bcore.types.BPool.bin
}

const params = {
    coinParams: [
        {
            name: 'CoinA',
            symbol: 'AAA',
            balance: '10000000000000000000',
            weight: '10000000000000000000'
        },
        {
            name: 'CoinB',
            symbol: 'BBB',
            balance: '20000000000000000000',
            weight: '20000000000000000000'
        },
        {
            name: 'CoinC',
            symbol: 'CCC',
            balance: '50000000000000000000',
            weight: '50000000000000000000'
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

    const { coinParams } = params;

    const TestToken = new web3.eth.Contract(abi.TestToken, { data: TestTokenSchema.bytecode, gas: MAX_GAS, from: defaultAccount })
    const BFactory = new web3.eth.Contract(abi.BFactory, { data: bin.BFactory, gas: MAX_GAS, from: defaultAccount });

    let tx
    // Deploy Tokens
    let coins = [];

    for (let i = 0; i < coinParams.length; i++) {
        console.log(`Deploying Coin ${i}...`)
        const coin = await TestToken.deploy({
            data: TestTokenSchema.bytecode,
            arguments:
                [coinParams[i].name, coinParams[i].symbol, 18, '10000000000000000000000']
        }).send({ gas: MAX_GAS })
        // const coin = new web3.eth.Contract(abi.TestToken, coinAddress)
        coins.push(coin);
    }



    // Deploy Factory
    const factory = await BFactory.deploy().send({ gas: MAX_GAS });

    // // Deploy Pool
    console.log(`Deploying BPool...`)
    tx = await factory.methods.newBPool().send()

    const poolAddress = tx.events['LOG_NEW_POOL'].returnValues.pool
    const bpool = new web3.eth.Contract(abi.BPool, poolAddress, { from: defaultAccount });

    // Set Initial Pool Params


    // TODO: Multiply all weights by 100

    // await bpool.methods.setParams(coins[0].options.address, coinParams[0].balance, coinParams[0].weight)
    // Set Token Approvals + Bind Tokens
    for (let i = 0; i < coins.length; i++) {
        console.log(`Approving Coin ${i} to Bind...`)
        await coins[i].methods.approve(bpool.options.address, MAX_UINT).send()
        console.log(`Binding Coin ${i} to BPool...`)
        await bpool.methods.bind(coins[i].options.address, coinParams[i].balance, coinParams[i].weight).send({ gas: MAX_GAS })
    }

    //Start Pool
    console.log(`Starting BPool...`)
    await bpool.methods.start().send()

    // That's it!
    console.log('-----------------')
    console.log('Deployed Factory:', factory.options.address)
    console.log('Deployed Pool   :', bpool.options.address)
    console.log('Deployed Coins  : ')
    for (let i = 0; i < coins.length; i++) {
        console.log(`\t\t  ${coins[i].options.address}`)
        let result = await coins[i].methods.name().call()
        result = await coins[i].methods.totalSupply().call()
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
