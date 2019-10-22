const Web3 = require('web3')
const fs = require('fs');
const schema = require('./constants').schema;

const web3 = new Web3("http://localhost:8545");
const toHex = web3.utils.toHex;
const toBN = web3.utils.toBN;
const toWei = web3.utils.toWei;
const fromWei = web3.utils.fromWei;

const MAX_GAS = require('./constants').MAX_GAS;
const MAX_UINT = require('./constants').MAX_UINT;

const params = {
    coinParams: [
        {
            name: 'WETH',
            symbol: 'WETH',
            balance: toWei('50'),
            weight: toWei('5'),
            userBalance: toWei('50'),
            initialSupply: toWei('300')
        },
        {
            name: 'MKR',
            symbol: 'MKR',
            balance: toWei('20'),
            weight: toWei('5'),
            userBalance: toWei('24'),
            initialSupply: toWei('120')
        },
        {
            name: 'DAI',
            symbol: 'DAI',
            balance: toWei('1000'),
            weight: toWei('5'),
            userBalance: toWei('4000'),
            initialSupply: toWei('17000')
        },
    ],
    extraCoinParams: [
        {
            name: 'CoinD',
            symbol: 'CoinD',
            userBalance: toWei('50'),
            initialSupply: toWei('200'),
        },
        {
            name: 'CoinE',
            symbol: 'CoinE',
            userBalance: toWei('24'),
            initialSupply: toWei('100'),
        },
        {
            name: 'CoinF',
            symbol: 'CoinF',
            userBalance: toWei('4000'),
            initialSupply: toWei('17000'),
        },
    ]
}

function writeConfigFile(deployed) {
    const filePath = process.cwd() + `/src/deployed.json`;

    // let config = {
    //     factoryAddress: factoryAddress,
    // };

    let data = JSON.stringify(deployed);
    fs.writeFileSync(filePath, data);
}


function printResults(deployed) {
    // That's it!
    console.log('-----------------')
    console.log('Deployed Factory  :', deployed.bFactory)
    console.log('Deployed Pool     :', deployed.bPool)
    console.log('Coins (pre-added) : ')
    for (let i = 0; i < deployed.coins.length; i++) {
        console.log(`\t\t  ${deployed.coins[i]}`)
    }
    console.log('Coins (not added) : ')
    for (let i = 0; i < deployed.extraCoins.length; i++) {
        console.log(`\t\t  ${deployed.extraCoins[i]}`)
    }
    console.log('-----------------')
    console.log('')
}

function toChecksum(address) {
    return web3.utils.toChecksumAddress(address)
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
        const initialSupply = coinParams[i].initialSupply
        const coin = await TestToken.deploy({
            data: schema.TestToken.bytecode,
            arguments:
                [coinParams[i].name, coinParams[i].symbol, 18, initialSupply]
        }).send({ gas: MAX_GAS })
        // const coin = new web3.eth.Contract(abi.TestToken, coinAddress)
        coins.push(coin);
    }

    for (let i = 0; i < coins.length; i++) {
        console.log(`Distributing coin ${i} to test accounts...`)
        const amount = coinParams[i].userBalance
        await coins[i].methods.transfer(newManager, amount).send()
        await coins[i].methods.transfer(investor, amount).send()
        await coins[i].methods.transfer(user, amount).send()
    }

    let extraCoins = [];

    for (let i = 0; i < extraCoinParams.length; i++) {
        console.log(`Deploying Extra Coin ${i}...`)
        const initialSupply = extraCoinParams[i].initialSupply
        const coin = await TestToken.deploy({
            data: schema.TestToken.bytecode,
            arguments:
                [extraCoinParams[i].name, extraCoinParams[i].symbol, 18, initialSupply]
        }).send({ gas: MAX_GAS })
        // const coin = new web3.eth.Contract(abi.TestToken, coinAddress)
        extraCoins.push(coin);
    }

    for (let i = 0; i < extraCoins.length; i++) {
        console.log(`Distributing extra coin ${i} to test accounts...`)
        const amount = extraCoinParams[i].userBalance
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

    // Set Token Approvals + Bind Tokens
    for (let i = 0; i < coins.length; i++) {
        console.log(`Approving Coin ${i} to Bind...`)
        await coins[i].methods.approve(bpool.options.address, MAX_UINT).send()
        console.log(`Binding Coin ${i} to BPool...`)
        await bpool.methods.bind(coins[i].options.address, coinParams[i].balance, coinParams[i].weight).send({ gas: MAX_GAS })
    }

    let deployed = {
        bFactory: toChecksum(factory.options.address),
        bPool: toChecksum(bpool.options.address),
        coins: [],
        extraCoins: [],
        allCoins: [],
    }

    for (let i = 0; i < coins.length; i++) {
        const checksumAddress = toChecksum(coins[i].options.address)
        deployed.coins.push(checksumAddress)
        deployed.allCoins.push(checksumAddress)
    }

    for (let i = 0; i < extraCoins.length; i++) {
        const checksumAddress = toChecksum(extraCoins[i].options.address)
        deployed.extraCoins.push(checksumAddress)
        deployed.allCoins.push(checksumAddress)
    }

    printResults(deployed)
    writeConfigFile(deployed);
    console.log('Deployed factory address written to config file')
}

function main() {
    deployPreConfigured();
}

main();
