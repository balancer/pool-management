import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Typography, Container, Grid } from '@material-ui/core';
import {
    PoolListTokenTable,
    PoolInvestForm,
    PoolParamsGrid,
    InvestParamsGrid,
    LoadingCard,
} from 'components';

@inject('root')
@observer
class PoolInvestView extends Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            address: '',
        };
    }

    async componentDidMount() {
        const { address } = this.props.match.params;
        const { providerStore, poolStore } = this.props.root;
        poolStore.setCurrentPool(address);
        this.setState({ address });

        const userAddress = providerStore.getDefaultAccount();

        // Get pool params
        await poolStore.fetchParams(address);
        await poolStore.fetchInvestParams(address, userAddress);
        await poolStore.fetchTokenParams(address);
    }

    render() {
        const { address } = this.state;
        const { poolStore, providerStore } = this.props.root;
        const userAddress = providerStore.getDefaultAccount();

        const paramsLoaded = poolStore.isParamsLoaded(address);
        const tokenParamsLoaded = poolStore.isTokenParamsLoaded(address);
        const investParamsLoaded = poolStore.isInvestParamsLoaded(
            address,
            userAddress
        );

        return (
            <Container>
                <br></br>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h3" component="h3">
                            Invest
                        </Typography>
                    </Grid>
                    {paramsLoaded && tokenParamsLoaded && investParamsLoaded ? (
                        <React.Fragment>
                            <Grid item xs={12} sm={12}>
                                <PoolParamsGrid poolAddress={address} />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <InvestParamsGrid poolAddress={address} />
                            </Grid>
                            <Grid item xs={12}>
                                <PoolListTokenTable
                                    displayMode="pool"
                                    poolAddress={address}
                                    userAddress={userAddress}
                                    linkPath="logs"
                                />
                            </Grid>
                            <Grid container>
                                <PoolInvestForm poolAddress={address} />
                            </Grid>
                        </React.Fragment>
                    ) : (
                        <Grid container spacing={3}>
                            <Grid item xs={4}></Grid>
                            <Grid item xs={4}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <LoadingCard title={''} />
                                </div>
                            </Grid>
                            <Grid item xs={4}></Grid>
                        </Grid>
                    )}
                </Grid>
            </Container>
        );
    }
}

export default PoolInvestView;
