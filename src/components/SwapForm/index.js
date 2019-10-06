import React from 'react'
import { makeStyles, InputLabel, MenuItem, FormControl, Select, Grid } from '@material-ui/core'
import { SwapFormHandler } from './forms'

const useStyles = makeStyles(theme => ({
  button: {
    display: 'block',
    marginTop: theme.spacing(2)
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  }
}))


export default function SwapForm(props) {
  const {
 address, provider, tokenParams, updateTokenParams
} = props
  const classes = useStyles()
  const [method, setMethod] = React.useState('exactAmountIn')
  const [open, setOpen] = React.useState(false)

  const handleDropdownChange = (event) => {
    setMethod(event.target.value)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpen = () => {
    setOpen(true)
  }


  const methods = [
    { label: 'Exact Amount In', name: 'exactAmountIn' },
    { label: 'Exact Amount Out', name: 'exactAmountOut' },
    { label: 'Exact Marginal Price', name: 'exactMarginalPrice' }
  ]
  return (
    <Grid container style={{ marginBottom: '50px' }}>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="demo-controlled-open-select">Swap method</InputLabel>
        <Select
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          value={method}
          onChange={handleDropdownChange}
          inputProps={{
            name: 'method',
            id: 'demo-controlled-open-select'
          }}
        >
          {
            methods.map((type, index) => {
              const id = index * 1
              return (
                <MenuItem value={type.name} key={id}>
                  {type.label}
                </MenuItem>
              )
            })
          }
        </Select>
      </FormControl>
      <SwapFormHandler updateTokenParams={updateTokenParams} method={method} provider={provider} address={address} tokenParams={tokenParams} />
    </Grid>
  )
}
