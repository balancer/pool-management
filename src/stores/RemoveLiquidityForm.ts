import {action, observable} from 'mobx';
import RootStore from 'stores/Root';
import {BigNumberMap, Pool, PoolToken} from '../types';
import {bnum, hasMaxApproval} from '../utils/helpers';
import {validateTokenValue, ValidationStatus} from './actions/validators';
import {BigNumber} from 'utils/bignumber';

export default class RemoveLiquidityFormStore {
    @observable activePool: string;
    @observable activeAccount: string | undefined = undefined;
    @observable modalOpen: boolean;
    rootStore: RootStore;

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @action openModal(poolAddress, account, tokenAddresses: string[]) {
        this.modalOpen = true;
        this.activePool = poolAddress;
        this.activeAccount = account;
        console.log("in open modal!," + this.modalOpen);
    }

    @action closeModal() {
        this.modalOpen = false;
    }

    isActivePool(poolAddress: string) {
        return this.activePool === poolAddress;
    }

    isActiveAccount(account: string) {
        return this.activeAccount === account;
    }
}