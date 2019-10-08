import React, { useState } from 'react'
import { Grid, TextField, Button, Card, CardContent } from '@material-ui/core'

import { swapExactAmountIn, swapExactAmountOut, swapExactMarginalPrice, previewSwapExactAmountIn, previewSwapExactAmountOut, previewSwapExactMarginalPrice } from './calls'
import { Error } from '../../provider'

export function SwapFormHandler(props) {
  const tokens = [{
    value: 'None',
    label: 'None'
  }]

  const [resultConfig, setResultConfig] = useState({
    exactAmountIn: [
      { label: 'Output Amount', value: '--' },
      { label: 'Effective Price', value: '--' }
    ],
    exactAmountOut: [
      { label: 'Input Amount', value: '--' },
      { label: 'Effective Price', value: '--' }
    ],
    exactMarginalPrice: [
      { label: 'Input Amount', value: '--' },
      { label: 'Output Amount', value: '--' },
      { label: 'Effective Price', value: '--' }
    ]
  })

  const useSwapForm = (callback) => {
    const [inputs, setInputs] = useState({})
    const { provider, address } = props
    const handleSubmit = (errorHandler) => {
      callback(errorHandler)
    }
    const handleInputChange = (event) => {
      event.persist()

      setInputs(data => ({ ...data, [event.target.name]: event.target.value }))
      if (props.method === 'exactAmountIn') {
        const values = inputs
        values[event.target.name] = event.target.value
        const checkInputToken = values.inputToken !== 'None' && values.inputToken !== undefined
        const checkOutToken = values.outputToken !== 'None' && values.outputToken !== undefined
        const checkAmountIn = !Number.isNaN(values.inputAmount) && values.inputAmount > 0
        // const checkLimitOut = values.outputLimit !== undefined && values.outputLimit > 0
        // const checkLimitPrice = values.limitPrice !== undefined && values.limitPrice > 0
        if (checkAmountIn && checkOutToken && checkInputToken) {
          const newResult = resultConfig
          const data = {
            provider,
            address,
            ...values
          }
          previewSwapExactAmountIn(data).then((result) => {
            console.log(data)
            console.log(result.preview)
            newResult.exactAmountIn[0].value = result.preview.Ao
            newResult.exactAmountIn[1].value = result.preview.Ao
            setResultConfig(newResult)
          }).catch((error) => {
            newResult.exactAmountIn[0].value = 'error'
            newResult.exactAmountIn[1].value = 'error'
            setResultConfig(newResult)
          })
        }
      } else if (props.method === 'exactAmountOut') {
        const values = inputs
        values[event.target.name] = event.target.value
        const checkInputToken = values.inputToken !== 'None' && values.inputToken !== undefined
        const checkOutToken = values.outputToken !== 'None' && values.outputToken !== undefined
        const checkAmountOut = !Number.isNaN(values.outputAmount) && values.outputAmount > 0
        // const checkLimitIn = values.inLimit !== undefined && values.inLimit > 0
        // const checkLimitPrice = values.limitPrice !== undefined && values.limitPrice > 0
        if (checkAmountOut && checkOutToken && checkInputToken) {
          const newResult = resultConfig
          const data = {
            provider,
            address,
            ...values
          }
          previewSwapExactAmountOut(data).then((result) => {
            console.log(result.preview)
            newResult.exactAmountOut[0].value = result.preview.Ao
            newResult.exactAmountOut[1].value = result.preview.MP
            setResultConfig(newResult)
          }).catch((error) => {
            newResult.exactAmountOut[0].value = 'error'
            newResult.exactAmountOut[1].value = 'error'
            setResultConfig(newResult)
          })
        }
      } else if (props.method === 'exactMarginalPrice') {
        const values = inputs
        values[event.target.name] = event.target.value
        // const checkLimitIn = values.inLimit !== undefined && values.inLimit > 0
        // const checkLimitOut = values.outLimit !== undefined && values.outLimit > 0
        const checkInputToken = values.inputToken !== 'None' && values.inputToken !== undefined
        const checkOutToken = values.outputToken !== 'None' && values.outputToken !== undefined
        const checkMarginalPrice = values.marginalPrice !== undefined && values.marginalPrice > 0
        if (checkInputToken && checkOutToken && checkMarginalPrice) {
          const newResult = resultConfig
          const data = {
            provider,
            address,
            ...values
          }
          previewSwapExactMarginalPrice(data).then((result) => {
            console.log(result.preview)
            // newResult.exactMarginalPrice[0].value = Math.floor((Math.random() * 100) + 1)
            // newResult.exactMarginalPrice[1].value = Math.floor((Math.random() * 100) + 1)
            // newResult.exactMarginalPrice[2].value = Math.floor((Math.random() * 100) + 1)
            setResultConfig(result.preview)
          }).catch((error) => {
            console.log(error)
            newResult.exactMarginalPrice[0].value = Math.floor((Math.random() * 100) + 1)
            newResult.exactMarginalPrice[1].value = Math.floor((Math.random() * 100) + 1)
            newResult.exactMarginalPrice[2].value = Math.floor((Math.random() * 100) + 1)
            setResultConfig(newResult)
          })
        }
      }
    }
    return {
      handleSubmit,
      handleInputChange,
      inputs
    }
  }

  const SwapResults = () => {
    // For exactAmountIn, there will be two fields shown:
    // * ‘Output Amount’ and ‘Effective Price’
    // * The ‘Input Amount’ input must be filled in for it to start the async call
    //
    // For exactAmountOut, there will be two fields:
    // * ‘Input Amount’ and ‘Effective Price’
    // * The ‘Output Amount’ input must be filled in for it to start the async call
    //
    // For exactMarginalPrice, there will be three fields:
    // * ‘Input Amount’, ‘Output Amount’ and ‘Effective Price’
    return (
      <Card>
        <CardContent>
          {
            resultConfig[props.method].map((result) => {
              return (
                <React.Fragment>
                  {result.label} : {result.value}<br />
                </React.Fragment>
              )
            })
          }
        </CardContent>
      </Card>
    )
  }

  Object.keys(props.tokenParams).forEach((key, index) => {
    // key: the name of the object key
    // index: the ordinal position of the key within the object
    tokens.push({
      value: key,
      label: props.tokenParams[key].symbol
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
          <Grid item xs={6} sm={6}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
        </Grid>
      </div>

    )
  }

  const ExactAmountOut = () => {
    const { provider, address, updateTokenParams } = props
    const { inputs, handleInputChange, handleSubmit } = useSwapForm((error) => {
      const {
        inputToken, outputToken, outputAmount, inLimit, limitPrice
      } = inputs
      const data = {
        provider, address, inputToken, outputToken, outputAmount, inLimit, limitPrice, updateTokenParams
      }
      swapExactAmountOut(data, error)
    })

    return (
      <div>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={6}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
        </Grid>
      </div>
    )
  }

  const ExactMarginalPrice = () => {
    const { provider, address, updateTokenParams } = props
    const { inputs, handleInputChange, handleSubmit } = useSwapForm((error) => {
      const {
        inputToken, outputToken, inLimit, outLimit, marginalPrice
      } = inputs
      const data = {
        provider, address, inputToken, outputToken, inLimit, outLimit, marginalPrice, updateTokenParams
      }
      swapExactMarginalPrice(data, error)
    })

    return (
      <div>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={6}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
        </Grid>
      </div>
    )
  }

  function checkMethod() {
    const { method } = props
    if (method === 'exactAmountIn') {
      return ExactAmountIn()
    } else if (method === 'exactAmountOut') {
      return ExactAmountOut()
    }

    return ExactMarginalPrice()
  }

  return (
    <Grid container>
      <Grid item xs={8}>
        {checkMethod()}
      </Grid>
      <Grid item xs={4}>
        <SwapResults />
      </Grid>
    </Grid>

  )
}
