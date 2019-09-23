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
  const { pool } = props

  let activeText

  if (pool.isPaused) {
    activeText = 'No'
  } else {
    activeText = 'Yes'
  }

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={9}>
          <IconCard title="Manager" text={pool.manager} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <IconCard title="Active" text={activeText} />
        </Grid>
      </Grid>
    </div>
  )
}
