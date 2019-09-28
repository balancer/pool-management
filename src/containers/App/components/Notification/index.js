import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Web3 from 'web3'

const useStyles = makeStyles(theme => ({
  close: {
    padding: theme.spacing(0.5)
  }
}))

export default function Notification() {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const openNotification = (newMessage) => {
    setOpen(true)
    setMessage(newMessage)
  }

  useEffect(() => {
    if (window.ethereum) {
      const { ethereum } = window
      const web3Provider = new Web3(ethereum)
      web3Provider.eth.getAccounts((err, accounts) => {
        if (accounts.length === 0) {
          openNotification('Please unlock your metamask account')
        }
      })
    } else {
      openNotification('Please install metamask')
    }
  })

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }


  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={open}
        autoHideDuration={10000}
        onClose={handleClose}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id="message-id">{message}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            className={classes.close}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    </div>
  )
}
