import React, { Component } from 'react'
import * as providerService from 'core/services/providerService'
import * as bPoolService from 'core/services/bPoolService'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import PoolParamsGrid from 'components/PoolParamsGrid'
import MoreParamsGrid from 'components/MoreParamsGrid'
import * as numberLib from 'core/libs/lib-number-helpers'
import ValueDisplayGrid from '../../components/ValueDisplayGrid'

class PoolSwapView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: '',
      inputAmount: 0,
      outputLimit: 0,
      limitPrice: 0,
      inputToken: 'EUR',
      outputToken: 'EUR',
      expectedOutput: '...',
      pool: {
        poolParams: {},
        tokenParams: {},
        pendingTx: false,
        txError: null,
        loadedParams: false,
        loadedTokenParams: false
      }
    }
  }

  async componentWillMount() {
    const { address } = this.props.match.params
    this.setState({ address })

    const provider = await providerService.getProvider()
    this.setState({ provider })

    await this.getParams()
    await this.getTokenParams()
  }

  async getParams() {
    const { address } = this.state
    const { provider } = this.state

    const { pool } = this.state

    const poolData = await bPoolService.getParams(provider, address)
    this.setState({
      pool: {
        ...pool,
        loadedParams: true,
        poolParams: poolData.data
      }
    })
  }

  async getTokenParams() {
    const { address, provider } = this.state
    const { pool } = this.state

    const tokenData = await bPoolService.getTokenParams(provider, address)
    this.setState({
      pool: {
        ...pool,
        loadedTokenParams: true,
        tokenParams: tokenData.data
      }
    })
  }

  setInputAmount = (event) => {
    const {
 provider, address, inputToken, outputToken
} = this.state
    this.setState({
      inputAmount: event.target.value
    })

    bPoolService.getSpotPrice(provider, address, inputToken, outputToken)
  }

  setOutputLimit = (event) => {
    this.setState({
      outputLimit: event.target.value
    })
  }

  setOutputLimit = (event) => {
    this.setState({
      outputLimit: event.target.value
    })
  }

  setLimitPrice = (event) => {
    this.setState({
      limitPrice: event.target.value
    })
  }

  setInputToken = (event) => {
    const { outputToken } = this.state
    const newToken = event.target.value

    // If the output token is the same, unset it
    if (outputToken === newToken) {
      this.setState({ inputToken: newToken, outputToken: 'None' })
    } else {
      this.setState({ inputToken: newToken })
    }
  }

  setOutputToken = (event) => {
    const { inputToken } = this.state
    const newToken = event.target.value

    // If the output token is the same, unset it
    if (inputToken === newToken) {
      this.setState({ outputToken: newToken, inputToken: 'None' })
    } else {
      this.setState({ outputToken: newToken })
    }
  }

  swapExactAmountIn = async (evt) => {
    const {
      provider, address, inputAmount, outputLimit, inputToken, outputToken, limitPrice, pool
    } = this.state

    if (!pool) {
      // Invariant
    }


    await bPoolService.swapExactAmountIn(
      provider,
      address,
      inputToken,
      numberLib.toWei(inputAmount),
      outputToken,
      numberLib.toWei(outputLimit),
      numberLib.toWei(limitPrice)
    )

    await this.getTokenParams()
  }

  buildInternalExchangeForm() {
    const {
      inputAmount, outputLimit, inputToken, outputToken, limitPrice, expectedOutput, pool
    } = this.state

    const tokens = [{
      value: 'None',
      label: 'None'
    }]

    Object.keys(pool.tokenParams).forEach((key, index) => {
      // key: the name of the object key
      // index: the ordinal position of the key within the object
      tokens.push({
        value: key,
        label: key
      })
    })

    return (<form onSubmit={this.swapExactAmountIn} noValidate autoComplete="off">
      <Grid container spacing={1}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={9}>
            <TextField
              id="token-in"
              select
              label="Input Token"
              value={inputToken}
              onChange={this.setInputToken}
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
              label="Input Amount"
              placeholder="0"
              value={inputAmount}
              onChange={this.setInputAmount}
              // onChange={handleChange('inputAmount')}
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
              select
              fullWidth
              label="Output Token"
              value={outputToken}
              onChange={this.setOutputToken}
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
              label="Limit Output"
              placeholder="0"
              value={outputLimit}
              onChange={this.setOutputLimit}
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
              label="Limit Price"
              value={limitPrice}
              onChange={this.setLimitPrice}
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
            <input type="submit" value="Submit" />
          </Grid>
        </Grid>
      </Grid>
    </form >)
  }

  render() {
    const { pool, address } = this.state

    if (!pool.loadedParams || !pool.loadedTokenParams) {
      return <div />
    }

    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <PoolParamsGrid address={address} pool={pool} />
          </Grid>
          <Grid item xs={12} sm={12}>
            {this.buildInternalExchangeForm()}
          </Grid>
          <Grid item xs={12} sm={12}>
            <MoreParamsGrid pool={pool} />
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default PoolSwapView
