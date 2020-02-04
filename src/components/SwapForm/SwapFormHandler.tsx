import React from 'react';
import { Grid } from '@material-ui/core';
import { observer, inject } from 'mobx-react';
import { methodNames } from 'stores/SwapForm';
import SwapResults from './SwapResults';
import { withStyles } from '@material-ui/core/styles';
import ExactAmountInForm from './ExactAmountInForm';
import ExactAmountOutForm from './ExactAmountOutForm';

const styles = theme => ({
    formControl: {
        margin: theme.spacing(1),
    },
});

@inject('root')
@observer
class SwapFormHandler extends React.Component<any, any> {
    checkMethod() {
        const { poolAddress } = this.props;
        const { poolStore, swapFormStore } = this.props.root;
        const pool = poolStore.poolData[poolAddress];

        if (
            !pool ||
            !pool.loadedTokenParams ||
            !pool.loadedParams ||
            pool.tokenList.length < 2
        ) {
            return <div></div>;
        }

        if (swapFormStore.swapMethod === methodNames.EXACT_AMOUNT_IN) {
            return <ExactAmountInForm poolAddress={poolAddress} />;
        } else if (swapFormStore.swapMethod === methodNames.EXACT_AMOUNT_OUT) {
            return <ExactAmountOutForm poolAddress={poolAddress} />;
        }
    }

    render() {
        const { poolAddress } = this.props;

        return (
            <Grid container>
                <Grid item xs={6}>
                    {this.checkMethod()}
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={5}>
                    <SwapResults poolAddress={poolAddress} />
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(SwapFormHandler);
