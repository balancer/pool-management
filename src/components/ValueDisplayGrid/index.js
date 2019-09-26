import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import IconCard from 'components/IconCard'
import { Typography, CardContent } from '@material-ui/core'


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  }
}))

export default function ValueDisplayGrid(props) {
  const { title, inputName, inputValue } = props

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Card>
            <CardContent>
              <Typography variant="h5">{title}</Typography>
              <Typography variant="body1">{`${inputName}: ${inputValue}\n`}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
