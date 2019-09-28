import Web3 from 'web3'

export async function getProvider() {
    try {
        if (window.ethereum) {
            const { ethereum } = window
            const web3Provider = new Web3(ethereum)

            const account = await ethereum.enable()
            const defaultAccount = account[0]
            web3Provider.eth.defaultAccount = defaultAccount
            return {
                result: 'success',
                web3Provider
            }
        }

        // No provider found
        return {
            result: 'no-web-3'
        }
    } catch (e) {
        return {
            result: 'error',
            error: e
        }
    }
}
