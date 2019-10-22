import { observable, action, computed } from 'mobx'
import * as deployed from "../deployed";
import * as blockchain from "utils/blockchain"
import * as helpers from "utils/helpers"
import abiDecoder from 'abi-decoder'
import Big from 'big.js/big.mjs';
import * as log from 'loglevel'

const bindSig = '0xe4e1e53800000000000000000000000000000000000000000000000000000000'
const setParamsSig = '0x3fdddaa200000000000000000000000000000000000000000000000000000000'

const LOG_NEW_POOL_EVENT = 'LOG_NEW_POOL'
export const statusCodes = {
    NOT_LOADED: 0,
    PENDING: 1,
    ERROR: 2,
    SUCCESS: 3
}

export default class PoolStore {
    @observable knownPools = {}
    @observable knownPoolsLoaded = false
    @observable currentPool = undefined
    @observable poolData = {}
    @observable previewPending = false

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    isPreviewPending() {
        return this.previewPending
    }

    setPreviewPending(value) {
        this.previewPending = value
    }

    //Reset the auto-loader if the current pool has changed
    setCurrentPool(poolAddress) {
        if (this.currentPool != poolAddress) {
            this.currentPool = poolAddress
            const defaultAccount = this.rootStore.providerStore.getDefaultAccount()
            this.rootStore.setDataUpdateInterval(poolAddress, defaultAccount)
        }
    }

    hasCurrentPool() {
        return (this.currentPool || false)
    }

    getCurrentPool() {
        return this.currentPool || ''
    }

    getPool(poolAddress) {
        return this.poolData[poolAddress]
    }

    areLogsLoaded(poolAddress) {
        if (!this.hasPoolDataObject(poolAddress)) {
            return false
        }
        return (this.poolData[poolAddress].logsLoaded || false)
    }

    getLogs(poolAddress) {
        return this.poolData[poolAddress].logs
    }

    setPoolDataProperty(poolAddress, property, value) {
        if (!this.hasPoolDataObject(poolAddress)) {
            this.poolData[poolAddress] = {}
        }

        this.poolData[poolAddress][property] = value

        console.log('Pool Data Changed', poolAddress, property, value)
    }

    hasPoolDataObject(poolAddress) {
        if (!this.poolData[poolAddress]) {
            return false
        }
        return true
    }

    isTokenBound(poolAddress, tokenAddress) {
        if (!this.hasPoolDataObject(poolAddress)) {
            return false
        }
        return (this.poolData[poolAddress].isTokenBound[tokenAddress] || false)
    }

    isTokenParamsLoaded(poolAddress) {
        if (!this.hasPoolDataObject(poolAddress)) {
            return false
        }
        return (this.poolData[poolAddress].loadedTokenParams || false)
    }

    isWhitelistTokenParamsLoaded(poolAddress) {
        if (!this.hasPoolDataObject(poolAddress)) {
            return false
        }
        return (this.poolData[poolAddress].loadedWhitelistTokenParams || false)
    }

    isParamsLoaded(poolAddress) {
        if (!this.hasPoolDataObject(poolAddress)) {
            return false
        }
        return (this.poolData[poolAddress].loadedParams || false)
    }

    isInvestParamsLoaded(poolAddress, account) {
        if (!this.hasPoolDataObject(poolAddress)) {
            return false
        }

        if (this.rootStore.tokenStore.hasBalance(poolAddress, account) === false) {
            return false
        }

        return (this.poolData[poolAddress].loadedInvestParams || false)
    }

    @action fetchKnownPools = async () => {
        console.log(`Getting pool for factory address ${deployed.bFactory}`)
        const factory = blockchain.loadObject('BFactory', deployed.bFactory, 'BFactory')

        const events = await factory.getPastEvents(LOG_NEW_POOL_EVENT, { fromBlock: 0, toBlock: 'latest' })

        const poolData = {}

        // Decode the data field of all LOG_CALL
        for (const event of events) {
            poolData[event.returnValues.pool] = { manager: event.returnValues.caller }
        }

        this.knownPools = poolData
        this.knownPoolsLoaded = true

        console.log('Found Pools', poolData)
    }

    @action deployPool = async () => {
        const factory = blockchain.loadObject('BFactory', deployed.bFactory, 'BFactory')
        const defaultAccount = blockchain.getDefaultAccount()

        await factory.methods.newBPool().send({ from: defaultAccount })
        await this.fetchKnownPools()
    }

    @action bind = async (poolAddress, tokenAddress, balance, weight) => {
        const pool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        console.log('[Action] Bind', poolAddress, tokenAddress)
        try {
            await pool.methods.bind(tokenAddress, balance, weight).send()
            await this.fetchTokenParams(poolAddress)
            await this.fetchAllWhitelistedTokenParams(poolAddress)
        } catch (e) {
            log.error(e)
        }
    }

    @action fetchParams = async (poolAddress) => {
        const pool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        this.setPoolDataProperty(poolAddress, 'paramsStatus', statusCodes.PENDING)
        try {
            const manager = await pool.methods.getController().call()
            const fees = await pool.methods.getFees().call()
            const numTokens = await pool.methods.getNumTokens().call()
            const isShared = await pool.methods.isFinalized().call()

            this.setPoolDataProperty(poolAddress, 'params', {
                swapFee: fees['0'],
                exitFee: fees['1'],
                manager,
                numTokens,
                isShared
            })

            this.setPoolDataProperty(poolAddress, 'paramsStatus', statusCodes.SUCCESS)
            this.setPoolDataProperty(poolAddress, 'loadedParams', true)

        } catch (e) {
            console.log(e)
            this.setPoolDataProperty(poolAddress, 'paramsStatus', statusCodes.ERROR)
        }
    }

    @action setFees = async (poolAddress, swapFee, exitFee) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        try {
            await bPool.methods.setFees(swapFee, exitFee).send()
            await this.fetchParams(poolAddress)
        } catch (e) {

        }
    }

    @action finalize = async (poolAddress, initialSupply) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')

        try {
            await bPool.methods.finalize(initialSupply).send()
            await this.fetchParams(poolAddress)
        } catch (e) {
        }
    }


    @action fetchInvestParams = async (poolAddress, account) => {
        const pool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        this.setPoolDataProperty(poolAddress, 'investParamsStatus', statusCodes.PENDING)

        try {
            const userBalance = await pool.methods.balanceOf(account).call()
            this.rootStore.tokenStore.setBalanceProperty(poolAddress, account, userBalance)
            const totalSupply = await pool.methods.totalSupply().call()
            const isFinalized = await pool.methods.isFinalized().call()

            this.setPoolDataProperty(poolAddress, 'investParams', {
                isFinalized,
                totalSupply
            })

            this.setPoolDataProperty(poolAddress, 'investParamsStatus', statusCodes.SUCCESS)
            this.setPoolDataProperty(poolAddress, 'loadedInvestParams', true)

        } catch (e) {
            console.log(e)
            this.setPoolDataProperty(poolAddress, 'investParamsStatus', statusCodes.ERROR)
        }
    }

    @action fetchCallLogs = async (poolAddress) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        console.log('[Action] Get Call Logs', poolAddress)
        try {
            abiDecoder.addABI(blockchain.schema.BPool.abi)

            const eventName = 'LOG_CALL'
            const events = await bPool.getPastEvents(eventName, {
                fromBlock: 0,
                toBlock: 'latest'
            })

            const logData = []

            // Decode Events
            for (const event of events) {
                const decodedData = abiDecoder.decodeMethod(event.returnValues.data)

                console.log(event)
                console.log(decodedData)
                const { caller } = event.returnValues
                const rawSig = event.returnValues.sig
                const rawData = event.returnValues.data
                const decodedSig = decodedData.name
                const decodedValues = []

                for (const param of decodedData.params) {
                    decodedValues.push(param.value)
                }

                logData.push({
                    caller,
                    rawSig,
                    rawData,
                    decodedValues,
                    decodedSig
                })
            }

            console.log(logData)

            this.setPoolDataProperty(poolAddress, 'logs', logData)
            this.setPoolDataProperty(poolAddress, 'logsLoaded', true)
        } catch (e) {
            log.error(e)
        }
    }


    @action fetchTokenParams = async (poolAddress) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        const defaultAccount = blockchain.getDefaultAccount()
        const { tokenStore } = this.rootStore

        this.setPoolDataProperty(poolAddress, 'tokenParamsStatus', statusCodes.PENDING)

        try {
            abiDecoder.addABI(blockchain.schema.BPool.abi)

            // Get a list of successful token binds by checking the calls. We'll assume the code is correct
            // TODO: Sanity check - Make sure that failed tx don't create a log
            const eventName = 'LOG_CALL'
            const bindEvents = await bPool.getPastEvents(eventName, {
                filter: { sig: bindSig },
                fromBlock: 0,
                toBlock: 'latest'
            })

            const setParamsEvents = await bPool.getPastEvents(eventName, {
                filter: { sig: setParamsSig },
                fromBlock: 0,
                toBlock: 'latest'
            })

            const tokenWeights = {}
            const isTokenBound = {}

            // Add all tokens from Binds
            for (const event of bindEvents) {
                const decodedData = abiDecoder.decodeMethod(event.returnValues.data)

                const token = helpers.toChecksum(decodedData.params[0].value)
                const weight = decodedData.params[2].value.toString()

                // console.log(decodedData)

                tokenWeights[token] = weight
            }

            // Update from setParams
            for (const event of setParamsEvents) {
                const decodedData = abiDecoder.decodeMethod(event.returnValues.data)

                const token = helpers.toChecksum(decodedData.params[0].value)
                const weight = decodedData.params[2].value.toString()

                tokenWeights[token] = weight
                isTokenBound[token] = true
            }

            let tokenList = []
            this.setPoolDataProperty(poolAddress, 'tokenWeights', tokenWeights)

            for (const key of Object.keys(tokenWeights)) {
                await tokenStore.fetchBalanceOf(key, poolAddress)
                await tokenStore.fetchBalanceOf(key, defaultAccount)
                await tokenStore.fetchSymbol(key)
                tokenList.push(key)
            }

            this.setPoolDataProperty(poolAddress, 'tokenList', tokenList)
            this.setPoolDataProperty(poolAddress, 'isTokenBound', isTokenBound)

            this.setPoolDataProperty(poolAddress, 'tokenParamsStatus', statusCodes.SUCCESS)
            this.setPoolDataProperty(poolAddress, 'loadedTokenParams', true)
        } catch (e) {
            console.log(e)
            this.setPoolDataProperty(poolAddress, 'tokenParamsStatus', statusCodes.ERROR)
        }
    }

    @action fetchAllWhitelistedTokenParams = async (poolAddress) => {
        const defaultAccount = blockchain.getDefaultAccount()
        const { tokenStore } = this.rootStore

        this.setPoolDataProperty(poolAddress, 'whitelistTokenParamsStatus', statusCodes.PENDING)

        try {
            const tokenWhitelist = deployed.allCoins
            console.log('whitelist', tokenWhitelist)

            await this.fetchTokenParams(poolAddress)

            let tokenWeights = {
                ...this.poolData[poolAddress].tokenWeights
            }

            console.log('pool token weights', tokenWeights)

            // Add whitelisted tokens which aren't in pool to our data set
            for (const token of tokenWhitelist) {
                if (!tokenWeights[token]) {
                    console.log('token not already in pool', token)
                    await tokenStore.fetchBalanceOf(token, poolAddress)
                    await tokenStore.fetchBalanceOf(token, defaultAccount)
                    await tokenStore.fetchSymbol(token)
                    tokenWeights[token] = '0'
                } else {
                    console.log('token already in pool', token)
                }
            }

            this.setPoolDataProperty(poolAddress, 'whitelistTokenWeights', tokenWeights)
            this.setPoolDataProperty(poolAddress, 'whitelistTokens', tokenWhitelist)
            this.setPoolDataProperty(poolAddress, 'whitelistTokenParamsStatus', statusCodes.SUCCESS)
            this.setPoolDataProperty(poolAddress, 'loadedWhitelistTokenParams', true)
        } catch (e) {
            console.log(e)
            this.setPoolDataProperty(poolAddress, 'whitelistTokenParamsStatus', statusCodes.ERROR)
        }
    }

    @action rebind = async (poolAddress, tokenAddress, tokenBalance, tokenWeight) => {
        const pool = blockchain.loadObject('BPool', poolAddress, 'BPool')

        try {
            await pool.methods.rebind(tokenAddress, tokenBalance, tokenWeight).send()
            await this.fetchTokenParams(poolAddress)
            await this.fetchAllWhitelistedTokenParams(poolAddress)
        } catch (e) {
            console.log(e)
        }

    }

    /* 
        Swap Methods - Action
    */
    @action swapExactAmountIn = async (poolAddress, Ti, Ai, To, Lo, LP) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        const defaultAccount = blockchain.getDefaultAccount()
        await bPool.methods.swap_ExactAmountIn(Ti, Ai, To, Lo, LP).send()
        await this.fetchTokenParams(poolAddress)
        await this.fetchInvestParams(poolAddress, defaultAccount)
    }
    @action swapExactAmountOut = async (poolAddress, Ti, Li, To, Ao, PL) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        const defaultAccount = blockchain.getDefaultAccount()
        await bPool.methods.swap_ExactAmountOut(Ti, Li, To, Ao, PL).send()
        await this.fetchTokenParams(poolAddress)
        await this.fetchInvestParams(poolAddress, defaultAccount)
    }
    @action swapExactMarginalPrice = async (poolAddress, Ti, Li, To, Lo, MP) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        const defaultAccount = blockchain.getDefaultAccount()
        await bPool.methods.swap_ExactMarginalPrice(Ti, Li, To, Lo, MP).send()
        await this.fetchTokenParams(poolAddress)
        await this.fetchInvestParams(poolAddress, defaultAccount)
    }

    calcEffectivePrice(Ai, Ao) {
        const amountIn = new Big(Ai)
        const amountOut = new Big(Ao)
        const effectivePrice = amountIn.div(amountOut).toString()

        return effectivePrice
    }

    /* 
        Swap Methods - Preview
    */
    previewSwapExactAmountIn = async (poolAddress, Ti, Ai, To, Lo, LP) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        console.log('[Action] previewSwapExactAmountIn', poolAddress, Ti, Ai, To, Lo, LP)

        try {
            this.setPreviewPending(true)
            const preview = await bPool.methods.swap_ExactAmountIn(Ti, Ai, To, Lo, LP).call()
            const effectivePrice = this.calcEffectivePrice(Ai, preview['Ao'])

            const data = {
                outputAmount: preview['Ao'],
                marginalPrice: preview['MP'],
                effectivePrice,
                validSwap: true
            }
            this.setPreviewPending(false)
            return data
        } catch (e) {
            log.error('[Error] previewSwapExactMarginalPrice', e)
            this.setPreviewPending(false)
            return {
                validSwap: false
            }
        }

    }
    previewSwapExactAmountOut = async (poolAddress, Ti, Li, To, Ao, PL) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        console.log('[Action] previewSwapExactAmountOut', poolAddress, Ti, Li, To, Ao, PL)

        try {
            this.setPreviewPending(true)
            const preview = await bPool.methods.swap_ExactAmountOut(Ti, Li, To, Ao, PL).call()
            const effectivePrice = this.calcEffectivePrice(preview['Ai'], Ao)

            const data = {
                inputAmount: preview['Ai'],
                marginalPrice: preview['MP'],
                effectivePrice,
                validSwap: true
            }
            this.setPreviewPending(false)
            return data
        } catch (e) {
            log.error('[Error] previewSwapExactMarginalPrice', e)
            this.setPreviewPending(false)
            return {
                validSwap: false
            }
        }

    }
    previewSwapExactMarginalPrice = async (poolAddress, Ti, Li, To, Lo, MP) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        console.log('[Action] previewSwapExactMarginalPrice', poolAddress, Ti, Li, To, Lo, MP)

        try {
            this.setPreviewPending(true)
            const preview = await bPool.methods.swap_ExactMarginalPrice(Ti, Li, To, Lo, MP).call()
            const effectivePrice = this.calcEffectivePrice(preview['Ai'], preview['Ao'])

            const data = {
                inputAmount: preview['Ai'],
                outputAmount: preview['Ao'],
                effectivePrice,
                validSwap: true
            }

            this.setPreviewPending(false)
            return data
        } catch (e) {
            log.error('[Error] previewSwapExactMarginalPrice', e)
            this.setPreviewPending(false)
            return {
                validSwap: false
            }

        }
    }

    /* 
        Invest Methods - Join
    */
    @action joinPool = async (poolAddress, poolAo) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        const defaultAccount = blockchain.getDefaultAccount()
        await bPool.methods.joinPool(poolAo).send()
        await this.fetchTokenParams(poolAddress)
        await this.fetchInvestParams(poolAddress, defaultAccount)
    }
    @action joinswapExternAmountIn = async (poolAddress, Ti, Ai) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        const defaultAccount = blockchain.getDefaultAccount()
        await bPool.methods.joinswap_ExternAmountIn(Ti, Ai).send()
        await this.fetchTokenParams(poolAddress)
        await this.fetchInvestParams(poolAddress, defaultAccount)
    }
    @action joinswapPoolAmountOut = async (poolAddress, Ti, poolAo) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        const defaultAccount = blockchain.getDefaultAccount()
        await bPool.methods.joinswap_PoolAmountOut(poolAo, Ti).send()
        await this.fetchTokenParams(poolAddress)
        await this.fetchInvestParams(poolAddress, defaultAccount)
    }

    /* 
        Invest Methods - Exit
    */
    @action exitPool = async (poolAddress, poolAi) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        const defaultAccount = blockchain.getDefaultAccount()
        await bPool.methods.exitPool(poolAi).send()
        await this.fetchTokenParams(poolAddress)
        await this.fetchInvestParams(poolAddress, defaultAccount)
    }
    @action exitswapPoolAmountIn = async (poolAddress, To, poolAi) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        const defaultAccount = blockchain.getDefaultAccount()
        await bPool.methods.exitswap_PoolAmountIn(poolAi, To).send()
        await this.fetchTokenParams(poolAddress)
        await this.fetchInvestParams(poolAddress, defaultAccount)
    }
    @action exitswapExternAmountOut = async (poolAddress, To, Ao) => {
        const bPool = blockchain.loadObject('BPool', poolAddress, 'BPool')
        const defaultAccount = blockchain.getDefaultAccount()
        await bPool.methods.exitswap_ExternAmountOut(To, Ao).send()
        await this.fetchTokenParams(poolAddress)
        await this.fetchInvestParams(poolAddress, defaultAccount)
    }

}