import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(2)
  },
  button: {
    margin: theme.spacing(1)
  },
  input: {
    display: 'none'
  }
}))

const buildButton = (buttonText, isLoading) => {
  const classes = useStyles()

  let buttonInternals

  if (isLoading) {
    buttonInternals = <CircularProgress className={classes.progress} />
  } else {
    buttonInternals = <Typography variant="body1">{buttonText}</Typography>
  }

  return (<Button variant="contained" color="primary" className={classes.button}>
    {buttonInternals}
  </Button>)
}

export default function AsyncButton(props) {
  const { buttonText, isLoading } = props
  const button = buildButton(buttonText, isLoading)

  return (
    <div>
      {button}
    </div>
  )
}
