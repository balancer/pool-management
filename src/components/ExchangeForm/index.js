import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Container from '@material-ui/core/Container'

const currencies = [
  {
    value: 'None',
    label: 'N'
  },
  {
    value: 'USD',
    label: '$'
  },
  {
    value: 'EUR',
    label: '€'
  },
  {
    value: 'BTC',
    label: '฿'
  },
  {
    value: 'JPY',
    label: '¥'
  }
]

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  dense: {
    marginTop: theme.spacing(2)
  },
  menu: {
    width: 200
  }
}))

export default function ExchangeForm(props) {
  // Pass in the list of tokens here - by name
  const classes = useStyles()
  const [values, setValues] = React.useState({
    inputAmount: 0,
    outputAmount: 0,
    inputToken: 'EUR',
    outputToken: 'EUR'
  })

  const handleChange = name => (event) => {
    setValues({ ...values, [name]: event.target.value })
  }

  const setInputToken = () => (event) => {
    const inputToken = event.target.value
    const outputToken = 'USD'
    // If the output token is the same, unset it
    // if (values.outputToken === inputToken) {
    //     const outputToken = 'None'
    //     setValues({ ...values, inputToken, outputToken })
    // }

    setValues({ ...values, inputToken })
  }

  const setOutputToken = () => (event) => {
    const { inputToken } = values
    const outputToken = event.target.value
    // If the input token is the same, unset it
    if (inputToken === outputToken) {
      setValues({ ...values, inputToken: 'None' })
    }

    setValues({ ...values, outputToken })
  }

  return (
    <form className={classes.container} noValidate autoComplete="off">
      <Container>
        <TextField
          id="amount-in"
          label="Input"
          placeholder="0"
          value={values.inputAmount}
          onChange={handleChange('inputAmount')}
          type="number"
          className={classes.textField}
          InputLabelProps={{
            shrink: true
          }}
          margin="normal"
          variant="outlined"
        />
        <TextField
          id="token-in"
          select
          label="Token"
          className={classes.textField}
          value={values.inputToken}
          onChange={setInputToken()}
          SelectProps={{
            native: true,
            MenuProps: {
              className: classes.menu
            }
          }}
          helperText="Please select your currency"
          margin="normal"
          variant="outlined"
        >
          {currencies.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>
      </Container>
      <Container>
        <TextField
          id="amount-out"
          label="Output (estimated)"
          placeholder="0"
          value={values.outputAmount}
          type="number"
          className={classes.textField}
          InputLabelProps={{
            shrink: true
          }}
          margin="normal"
          variant="outlined"
        />
        <TextField
          id="token-out"
          select
          label="Token"
          className={classes.textField}
          value={values.outputToken}
          onChange={setOutputToken()}
          SelectProps={{
            native: true,
            MenuProps: {
              className: classes.menu
            }
          }}
          helperText="Please select your currency"
          margin="normal"
          variant="outlined"
        >
          {currencies.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>
      </Container>
    </form>
  )
}
