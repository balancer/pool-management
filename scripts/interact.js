const bcore = require('../balancer-core')
const TestTokenSchema = require('../external-contracts/TestToken')
const BPoolSchema = require('../external-contracts/BPool')
const Web3 = require('web3')
const networkConfig = require('../networks.js');

const web3 = new Web3("http://localhost:8545");
const { BN } = web3.utils

const MAX_GAS = 0xffffffff;
const MAX_UINT = web3.utils.toTwosComplement('-1');

const abi = {
    BFactory: JSON.parse(bcore.types.BFactory.abi),
    BPool: BPoolSchema.abi,
    TestToken: TestTokenSchema.abi
}

const addresses = {
    BPool: '0x7131784aaB27D21786e0100C8a02d3e49ea30AdA',
    Ti: '0x69E66638C43B4B8491a06482805f660327219903',
    To: '0x88cC476310C2C0e2768666Fc4165dC5E10324fe3'
}

    const TEN18 = new BN('1000000000000000000');
    const TEN9 = new BN('1000000000');
    const TEN15 = new BN('1000000000000000');

async function deployPreConfigured() {
    const MAX_TRADE_IN = new BN(1).mul(TEN18).mul(TEN9)
    const accounts = await web3.eth.getAccounts();
    const defaultAccount = accounts[0];

    const Ti = new web3.eth.Contract(abi.TestToken, addresses.Ti, { from: defaultAccount })
    const To = new web3.eth.Contract(abi.TestToken, addresses.Ti, { from: defaultAccount })
    const bPool = new web3.eth.Contract(abi.BPool, addresses.BPool, { from: defaultAccount });

    // Set Initial Pool Params

    const Ai = new BN(10).mul(TEN18)
    const Lo = new BN(1).mul(TEN18)
    const LP = new BN(10000000000).mul(TEN18)


    let result

    // MATH
    const Bi = new BN(await Ti.methods.balanceOf(bPool.options.address).call())
    const Bo = new BN(await To.methods.balanceOf(bPool.options.address).call())
    const Wi = new BN(await bPool.methods.getNormalizedWeight(Ti.options.address).call())
    const Wo = new BN(await bPool.methods.getNormalizedWeight(To.options.address).call())
    const fee = new BN(await bPool.methods.getFee().call())

    console.log('The parameters:')
    console.log('Ai', Ai.toString())
    console.log('Lo', Lo.toString())
    console.log('Bi', Bi.toString())
    console.log('Bo', Bo.toString())
    console.log('LP', LP.toString())
    console.log('Wi', Wi.toString())
    console.log('Wo', Wo.toString())


    // console.log('The Checks:')
    // console.log('Max Check', Bi.mul(MAX_TRADE_IN))
    // console.log('Limit Price Check', Lo.toString())
    // console.log('Bi', Bi.toString())
    // console.log('Bo', Bo.toString())
    // console.log('LP', LP.toString())

    try {
        const result = await bPool.methods.swap_ExactAmountIn(addresses.To, Ai.toString(), addresses.To, Lo.toString(), LP.toString()).send({ from: defaultAccount, gas: MAX_GAS })
        console.log(result)
    } catch (e) {
        console.log(result)
        console.log(e)
    }
}

function main() {
    deployPreConfigured();
}

main();
