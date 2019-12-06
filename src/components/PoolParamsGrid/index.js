import React from 'react'
import { withStyles } from '@material-ui/styles';
import { observer, inject } from 'mobx-react'
import Grid from '@material-ui/core/Grid'
import IconCard from 'components/IconCard'
import * as helpers from 'utils/helpers'

const styles = theme => ({
  root: {
    flexGrow: 1
  }
})

@inject('root')
@observer
class PoolParamsGrid extends React.Component {

  render() {
    const { poolAddress, classes } = this.props
    const { poolStore } = this.props.root

    const pool = poolStore.poolData[poolAddress]

    let sharedText
    if (pool.params.isShared) {
      sharedText = 'Yes'
    } else {
      sharedText = 'No'
    }

    const swapFee = helpers.fromFeeToPercentage(pool.params.swapFee)

    return (
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={6}>
            <IconCard title="Pool" text={poolAddress} addRows />
          </Grid>
          <Grid item xs={6} sm={3}>
            <IconCard title="Fees" text={`Swap Fee: ${swapFee}%`} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <IconCard title="Shared" text={sharedText} addRows />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(PoolParamsGrid)