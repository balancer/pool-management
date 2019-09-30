import React, { useEffect, useState } from 'react'
import { Snackbar, IconButton } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import Web3 from 'web3'

const useStyles = makeStyles(theme => ({
  close: {
    padding: theme.spacing(0.5)
  }
}))

export default function Notification() {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

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
            <CloseIcon
              onClick={handleClose}
            />
          </IconButton>
        ]}
      />
    </div>
  )
}
