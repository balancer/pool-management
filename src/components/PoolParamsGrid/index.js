import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import IconCard from 'components/IconCard'
import { web3Lib } from 'core/libs'


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  }
}))

export default function PoolParamsGrid(props) {
  const { pool, address } = props

  let activeText

  if (pool.poolParams.isPaused) {
    activeText = 'No'
  } else {
    activeText = 'Yes'
  }

  const swapFee = web3Lib.fromFeeToPercentage(pool.poolParams.swapFee)
  const exitFee = web3Lib.fromFeeToPercentage(pool.poolParams.exitFee)

  console.log(pool.poolParams.swapFee)
  console.log(swapFee)

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <IconCard title="Pool" text={address} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <IconCard title="Fees" text={`Swap Fee: ${swapFee}%`} text2={`Exit Fee: ${exitFee}%`} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <IconCard title="Active" text={activeText} />
        </Grid>
      </Grid>
    </div>
  )
}
