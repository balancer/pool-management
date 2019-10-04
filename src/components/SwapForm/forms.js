import React, { useState } from 'react'
import { Grid, TextField, Button } from '@material-ui/core'

import { swapExactAmountIn, swapExactAmountOut, swapExactMarginalPrice, swapThreeLimitMaximize } from './calls'
import { Error } from '../../provider'

const useSwapForm = (callback) => {
  const [inputs, setInputs] = useState({})
  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault()
    }
    callback()
  }
  const handleInputChange = (event) => {
    event.persist()
    setInputs(data => ({ ...data, [event.target.name]: event.target.value }))
  }
  return {
    handleSubmit,
    handleInputChange,
    inputs
  }
}


export function SwapFormHandler(props) {
  const tokens = [{
    value: 'None',
    label: 'None'
  }]

  Object.keys(props.tokenParams).forEach((key, index) => {
    // key: the name of the object key
    // index: the ordinal position of the key within the object
    tokens.push({
      value: key,
      label: key
    })
  })

  const ExactAmountIn = () => {
    const { provider, address, updateTokenParams } = props
    const { inputs, handleInputChange, handleSubmit } = useSwapForm((error) => {
      const {
        inputToken, outputToken, inputAmount, outputLimit, limitPrice
      } = inputs
      const data = {
        provider, address, inputToken, outputToken, inputAmount, outputLimit, limitPrice, updateTokenParams
      }
      swapExactAmountIn(data, error)
    })

    return (

      <div>
        <Grid container spacing={1}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={9}>
              <TextField
                id="token-in"
                name="inputToken"
                select
                label="Input Token"
                value={inputs.inputToken}
                onChange={handleInputChange}
                SelectProps={{
                              native: true
                            }}
                margin="normal"
                variant="outlined"
                fullWidth
              >
                {tokens.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                            ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                id="amount-in"
                name="inputAmount"
                label="Input Amount"
                placeholder="0"
                value={inputs.inputAmount}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                              shrink: true
                            }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField
                id="token-out"
                name="outputToken"
                select
                fullWidth
                label="Output Token"
                value={inputs.outputToken}
                onChange={handleInputChange}
                SelectProps={{
                              native: true
                            }}
                margin="normal"
                variant="outlined"
              >
                {tokens.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                            ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                id="limit-out"
                name="outputLimit"
                label="Limit Output"
                placeholder="0"
                value={inputs.outputLimit}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                              shrink: true
                            }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="limit-price"
                name="limitPrice"
                label="Limit Price"
                value={inputs.limitPrice}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                              shrink: true
                            }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>

              <Error.Consumer>
                {error => (
                  <Button
                    type="submit"
                    variant="contained"
                    style={{ marginTop: 25 }}
                    onClick={() => { handleSubmit(error.setError) }}
                  >
                            Submit
                  </Button>
       )}
              </Error.Consumer>
            </Grid>
          </Grid>
        </Grid>
      </div>

    )
  }

  const ExactAmountOut = () => {
    const { provider, address, updateTokenParams } = props
    const { inputs, handleInputChange, handleSubmit } = useSwapForm(() => {
      const {
        inputToken, outputToken, outputAmount, inLimit, limitPrice
      } = inputs
      const data = {
        provider, address, inputToken, outputToken, outputAmount, inLimit, limitPrice, updateTokenParams
      }
      swapExactAmountOut(data)
    })

    return (
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <Grid container spacing={1}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={9}>
              <TextField
                id="token-in"
                name="inputToken"
                select
                label="Input Token"
                value={inputs.inputToken}
                onChange={handleInputChange}
                SelectProps={{
                  native: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              >
                {tokens.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                id="amount-out"
                name="outputAmount"
                label="Output Amount"
                placeholder="0"
                value={inputs.outputAmount}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                  shrink: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField
                id="token-out"
                name="outputToken"
                select
                fullWidth
                label="Output Token"
                value={inputs.outputToken}
                onChange={handleInputChange}
                SelectProps={{
                  native: true
                }}
                margin="normal"
                variant="outlined"
              >
                {tokens.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                id="limit-in"
                name="inLimit"
                label="Limit In"
                placeholder="0"
                value={inputs.inLimit}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                  shrink: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="limit-price"
                name="limitPrice"
                label="Limit Price"
                value={inputs.limitPrice}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                  shrink: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                variant="contained"
                style={{ marginTop: 25 }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    )
  }

  const ExactMaginalPrice = () => {
    const { provider, address, updateTokenParams } = props
    const { inputs, handleInputChange, handleSubmit } = useSwapForm(() => {
      const {
        inputToken, outputToken, inLimit, outLimit, marginalPrice
      } = inputs
      const data = {
        provider, address, inputToken, outputToken, inLimit, outLimit, marginalPrice, updateTokenParams
      }
      swapExactMarginalPrice(data)
    })

    return (
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <Grid container spacing={1}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={9}>
              <TextField
                id="token-in"
                name="inputToken"
                select
                label="Input Token"
                value={inputs.inputToken}
                onChange={handleInputChange}
                SelectProps={{
                  native: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              >
                {tokens.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                id="limit-in"
                name="inLimit"
                label="Limit in"
                placeholder="0"
                value={inputs.inLimit}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                  shrink: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField
                id="token-out"
                name="outputToken"
                select
                fullWidth
                label="Output Token"
                value={inputs.outputToken}
                onChange={handleInputChange}
                SelectProps={{
                  native: true
                }}
                margin="normal"
                variant="outlined"
              >
                {tokens.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                id="limit-out"
                name="outLimit"
                label="Limit Out"
                placeholder="0"
                value={inputs.outLimit}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                  shrink: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="marginal-price"
                name="marginalPrice"
                label="Marginal Price"
                value={inputs.marginalPrice}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                  shrink: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                variant="contained"
                style={{ marginTop: 25 }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    )
  }

  const ThreeLimitMaximize = () => {
    const { provider, address, updateTokenParams } = props
    const { inputs, handleInputChange, handleSubmit } = useSwapForm(() => {
      const {
        inputToken, outputToken, inLimit, outLimit, limitPrice
      } = inputs
      const data = {
        provider, address, inputToken, outputToken, inLimit, outLimit, limitPrice, updateTokenParams
      }
      swapThreeLimitMaximize(data)
    })

    return (
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <Grid container spacing={1}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={9}>
              <TextField
                id="token-in"
                name="inputToken"
                select
                label="Input Token"
                value={inputs.inputToken}
                onChange={handleInputChange}
                SelectProps={{
                  native: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              >
                {tokens.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                id="limit-in"
                name="inLimit"
                label="Limit in"
                placeholder="0"
                value={inputs.inLimit}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                  shrink: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField
                id="token-out"
                name="outputToken"
                select
                fullWidth
                label="Output Token"
                value={inputs.outputToken}
                onChange={handleInputChange}
                SelectProps={{
                  native: true
                }}
                margin="normal"
                variant="outlined"
              >
                {tokens.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                id="limit-out"
                name="outLimit"
                label="Limit Out"
                placeholder="0"
                value={inputs.outLimit}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                  shrink: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="limit-price"
                name="limitPrice"
                label="Limit Price"
                value={inputs.limitPrice}
                onChange={handleInputChange}
                type="number"
                InputLabelProps={{
                  shrink: true
                }}
                margin="normal"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                variant="contained"
                style={{ marginTop: 25 }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    )
  }

  function checkMethod() {
    const { method } = props
    if (method === 'exactAmountIn') {
      return ExactAmountIn()
    } else if (method === 'exactAmountOut') {
      return ExactAmountOut()
    } else if (method === 'exactMarginalPrice') {
      return ExactMaginalPrice()
    }
      return ThreeLimitMaximize()
  }

  return (
    <Grid>
      { checkMethod() }
    </Grid>
  )
}
