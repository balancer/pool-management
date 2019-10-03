import React, { Component } from 'react'
import { Container, Grid, Typography, TextField, Button } from '@material-ui/core'

import { providerService, bPoolService } from 'core/services'
import { numberLib } from 'core/libs'
import { TokenParametersTable, PoolParamsGrid, MoreParamsGrid } from 'components'

class PoolSwapView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: '',
      bindTokenInput: {
        address: '',
        balance: '',
        weight: ''
      },
      setTokenParamsInput: {
        address: '',
        balance: '',
        weight: ''
      },
      setFee: {
        amount: ''
      },
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

  setBindInputProperty = (property, event) => {
    const { bindTokenInput } = this.state
    const newProperty = event.target.value

    bindTokenInput[property] = newProperty

    this.setState({ bindTokenInput })
  }


  setFeeAmount = (property, event) => {
    const { setFee } = this.state
    const newProperty = event.target.value

    setFee[property] = newProperty
    this.setState({ setFee })
  }

  setTokenParamsProperty = (property, event) => {
    const { setTokenParamsInput } = this.state
    const newProperty = event.target.value

    setTokenParamsInput[property] = newProperty

    this.setState({ setTokenParamsInput })
  }

  setTokenParams = async (event) => {
    const {
      provider, address, setTokenParamsInput, pool
    } = this.state

    if (!pool) {
      // Invariant
    }


    await bPoolService.setTokenParams(
      provider,
      address,
      setTokenParamsInput.address,
      numberLib.toWei(setTokenParamsInput.balance),
      numberLib.toWei(setTokenParamsInput.weight)
    )


    await this.getTokenParams()
  }

  setFee = async (event) => {
    event.preventDefault()
    const {
      setFee, provider, address
    } = this.state

    bPoolService.setFee(provider, address, setFee.amount)
  }

  bindToken = async (event) => {
    event.preventDefault()
    const {
      provider, address, bindTokenInput, pool
    } = this.state

    if (!pool) {
      // Invariant
    }

    await bPoolService.bindToken(
      provider,
      address,
      bindTokenInput.address,
      numberLib.toWei(bindTokenInput.balance),
      numberLib.toWei(bindTokenInput.weight)
    )

    await this.getTokenParams()
  }

  buildParamCards() {
    const { pool, address } = this.state

    return <PoolParamsGrid address={address} pool={pool} />
  }

  buildTokenParamsTable() {
    const { pool } = this.state

    return <TokenParametersTable tokenData={pool.tokenParams} />
  }

  buildBindTokenForm() {
    const { bindTokenInput } = this.state

    return (
      <Container>
        <form onSubmit={this.bindToken}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <TextField
                id="token-address"
                label="Token Address"
                value={bindTokenInput.address}
                onChange={e => this.setBindInputProperty('address', e)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                id="token-address"
                label="Balance"
                type="number"
                placeholder="0"
                value={bindTokenInput.balance}
                onChange={e => this.setBindInputProperty('balance', e)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                id="token-address"
                label="Weight"
                type="number"
                placeholder="0"
                value={bindTokenInput.weight}
                onChange={e => this.setBindInputProperty('weight', e)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    )
  }

  buildSetTokenParamsForm() {
    const { setTokenParamsInput } = this.state

    return (<Container>
      <form onSubmit={this.setTokenParams}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <TextField
              id="token-address"
              label="Token Address"
              value={setTokenParamsInput.address}
              onChange={event => this.setTokenParamsProperty('address', event)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="token-address"
              label="Balance"
              type="number"
              placeholder="0"
              value={setTokenParamsInput.balance}
              onChange={event => this.setTokenParamsProperty('balance', event)}
            />
          </Grid>
          <Grid item xs={12} sm={4}><TextField
            id="token-address"
            label="Weight"
            type="number"
            placeholder="0"
            value={setTokenParamsInput.weight}
            onChange={event => this.setTokenParamsProperty('weight', event)}
          /></Grid>
          <Grid item xs={12} sm={4}>
            <Button
              type="submit"
              variant="contained"
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container >)
  }

  buildSetFeeForm() {
    const { setFee } = this.state
    return (<Container>
      <form onSubmit={this.setFee}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <TextField
              id="fee-amount"
              label="Fee Amount"
              type="number"
              value={setFee.amount}
              onChange={event => this.setFeeAmount('amount', event)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              type="submit"
              variant="contained"
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container >)
}

  render() {
    const { pool } = this.state

    if (!pool.loadedParams || !pool.loadedTokenParams) {
      return <div />
    }

    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h3" component="h3">Balancer Pool</Typography>
            <br />
            {pool.loadedParams ? (
              this.buildParamCards()
            ) : (
              <div />
              )}
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" component="h5" > Tokens</Typography >
            <br />
            {pool.loadedParams ? (
              this.buildTokenParamsTable()
            ) : (
              <div />
              )}
          </Grid>
          <Grid item xs={12} sm={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Add Token</Typography>
                <br />
                {pool.loadedTokenParams ? (
                  this.buildBindTokenForm()
                ) : (
                  <div />
                  )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Edit Token</Typography>
                <br />
                {pool.loadedTokenParams ? (
                  this.buildSetTokenParamsForm()
                ) : (
                  <div />
                  )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Set fee</Typography>
                <br />
                {pool.loadedTokenParams ? (
                  this.buildSetFeeForm()
                ) : (
                  <div />
                  )}
              </Grid>
            </Grid>
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
