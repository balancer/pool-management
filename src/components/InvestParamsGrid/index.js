import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid'
import { observer, inject } from 'mobx-react'
import IconCard from 'components/IconCard'
import * as helpers from 'utils/helpers'


const styles = theme => ({
  root: {
    flexGrow: 1
  }
})

@inject('root')
@observer
class InvestParamsGrid extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { poolAddress, classes } = this.props
    const { poolStore, tokenStore, providerStore } = this.props.root
    const pool = poolStore.getPool(poolAddress)
    const params = pool.investParams

    const userAddress = providerStore.getDefaultAccount()
    const userBalance = helpers.roundValue(helpers.fromWei(tokenStore.getBalance(poolAddress, userAddress)), 7)
    const totalSupply = helpers.roundValue(helpers.fromWei(params.totalSupply), 7)

    let isSharedText

    if (params.isFinalized) {
      isSharedText = 'Shared'
    } else {
      isSharedText = 'Private'
    }

    return (
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={4}>
            <IconCard title="My Pool Tokens" text={userBalance} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <IconCard title="Total Pool Tokens" text={totalSupply} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <IconCard title="Shared Status" text={isSharedText} />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(InvestParamsGrid)