import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import IconCard from 'components/IconCard'


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

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <IconCard title="Pool" text={address} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <IconCard title="Fee" text={pool.poolParams.fee} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <IconCard title="Active" text={activeText} />
        </Grid>
      </Grid>
    </div>
  )
}
