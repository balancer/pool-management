import { action, observable } from 'mobx';
import { Interface } from 'ethers/utils';
import RootStore from './Root';
import { ContractTypes, schema } from './Provider';
import { FetchCode } from './Transaction';

export default class Proxy {
    @observable instance: string;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action fetchInstance = async (account: string): Promise<FetchCode> => {
        const { contractMetadataStore, providerStore } = this.rootStore;

        const proxyRegistryAddress = contractMetadataStore.getDsProxyRegistryAddress();

        const proxyRegistry = providerStore.getContract(
            ContractTypes.DSProxyRegistry,
            proxyRegistryAddress
        );

        try {
            const instance = await proxyRegistry.proxies(account);
            this.instance = instance;
        } catch (e) {
            console.error('[Fetch Proxy Instance] Failure in fetch', {
                error: e,
            });
            return FetchCode.FAILURE;
        }

        return FetchCode.SUCCESS;
    };

    getInstanceAddress = (): string => {
        return this.instance;
    };

    hasInstance = (): boolean => {
        return this.instance !== '0x0000000000000000000000000000000000000000';
    };

    wrapTransaction(
        contractType: ContractTypes,
        action: string,
        params: any[]
    ): string {
        const abi = schema[contractType];
        const iface = new Interface(abi);
        const data = iface.functions[action].encode(params);
        return data;
    }
}
