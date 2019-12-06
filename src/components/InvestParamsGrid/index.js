import React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid'
import { observer, inject } from 'mobx-react'
import TokenCard from 'components/TokenCard';

const styles = theme => ({
  root: {
    flexGrow: 1
  }
})

@inject('root')
@observer
class InvestParamsGrid extends React.Component {
  render() {
    const { poolAddress, classes } = this.props
    const { poolStore, tokenStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()
    const pool = poolStore.getPool(poolAddress)
    const params = pool.investParams

    const userBalance = tokenStore.getBalance(poolAddress, userAddress)
    const totalSupply = params.totalSupply

    return (
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={6}>
            <TokenCard title="My Pool Tokens" weiValue={userBalance} />
          </Grid>
          <Grid item xs={6} sm={6}>
            <TokenCard title="Total Pool Tokens" weiValue={totalSupply} />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(InvestParamsGrid)