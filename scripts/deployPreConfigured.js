const bcore = require('../balancer-core')
const TestTokenSchema = require('../external-contracts/TestToken')
const Web3 = require('web3')
const networkConfig = require('../networks.js');

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
            balance: '10000000000000000000',
            weight: '10000000000000000000'
        },
        {
            balance: '10000000000000000000',
            weight: '10000000000000000000'
        },
        {
            balance: '10000000000000000000',
            weight: '10000000000000000000'
        },
    ]
}

async function deployPreConfigured() {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

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
            arguments:
                ['TokenName', 'Symbol', 18, '10000000000000000000000']
        }).send()
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
    console.log('Deployed Factory: ', factory.options.address)
    console.log('Deployed Pool: ', bpool.options.address)
    console.log('Deployed Coins: ')
    for (let i = 0; i < coins.length; i++) {
        console.log(`\t${coins[i].options.address}`)
    }
}

function main() {
    deployPreConfigured();
}

main();
