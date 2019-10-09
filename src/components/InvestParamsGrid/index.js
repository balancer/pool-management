import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import IconCard from 'components/IconCard'
import { web3Lib } from 'core/libs'


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  }
}))

export default function InvestParamsGrid(props) {
  const { pool } = props
  const params = pool.investParams

  console.log('here!')

  let isSharedText

  if (params.isFinalized) {
    isSharedText = 'Shared'
  } else {
    isSharedText = 'Private'
  }

  const userBalance = web3Lib.toEther(params.userBalance)
  const totalSupply = web3Lib.toEther(params.totalSupply)

  const classes = useStyles()

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
