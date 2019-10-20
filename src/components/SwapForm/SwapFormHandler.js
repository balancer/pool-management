import React from 'react'
import { Grid, TextField, Button } from '@material-ui/core'
import { observer, inject } from 'mobx-react'
import { methodNames } from 'stores/SwapForm'
import SwapResults from './SwapResults'
import { withStyles } from '@material-ui/core/styles';
import ExactAmountInForm from './ExactAmountInForm'
import ExactAmountOutForm from './ExactAmountOutForm'
import ExactMargincalPriceForm from './ExactMargincalPriceForm'

const styles = theme => ({
    formControl: {
        margin: theme.spacing(1)
    }
})

@inject('root')
@observer
class SwapFormHandler extends React.Component {
    checkMethod() {
        const { poolAddress } = this.props
        const { poolStore, swapFormStore } = this.props.root
        const pool = poolStore.poolData[poolAddress]

        if (!pool || !pool.loadedTokenParams || !pool.loadedParams) {
            return <div></div>
        }

        if (swapFormStore.swapMethod === methodNames.EXACT_AMOUNT_IN) {
            return <ExactAmountInForm poolAddress={poolAddress} />
        } else if (swapFormStore.swapMethod === methodNames.EXACT_AMOUNT_OUT) {
            return <ExactAmountOutForm poolAddress={poolAddress} />
        } else if (swapFormStore.swapMethod === methodNames.EXACT_MARGINAL_PRICE) {
            return <ExactMargincalPriceForm poolAddress={poolAddress} />
        }
    }

    render() {
        const { poolAddress } = this.props

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
        )
    }
}

export default withStyles(styles)(SwapFormHandler)
