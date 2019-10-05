import React, { Component } from 'react'
import { Container, Grid, Typography, TextField, Button } from '@material-ui/core'

import { providerService, bPoolService } from 'core/services'
import { numberLib } from 'core/libs'
import { PoolParamsGrid, MoreParamsGrid, PoolListTokenTable, Loading } from 'components'
import { Error } from '../../provider'

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
        swapFee: '',
        exitFee: ''
      },
      makePublic: {
        publicAmount: ''
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

  setPublicAmount = (property, event) => {
    const { makePublic } = this.state
    const newProperty = event.target.value

    makePublic[property] = newProperty
    this.setState({ makePublic })
  }

  setTokenParamsProperty = (property, event) => {
    const { setTokenParamsInput } = this.state
    const newProperty = event.target.value

    setTokenParamsInput[property] = newProperty

    this.setState({ setTokenParamsInput })
  }

  setTokenParams = async (error) => {
    const {
      provider, address, setTokenParamsInput, pool
    } = this.state

    if (!pool) {
      // Invariant
    }


    const call = await bPoolService.setTokenParams(
      provider,
      address,
      setTokenParamsInput.address,
      numberLib.toWei(setTokenParamsInput.balance),
      numberLib.toWei(setTokenParamsInput.weight)
    )

    if (call.result === 'failure') {
      error(call.data.error.message)
    } else {
      await this.getTokenParams()
    }
  }

  setFee = async (error) => {
    const {
      setFee, provider, address
    } = this.state

    const call = await bPoolService.setFees(provider, address, setFee.swapFee, setFee.exitFee)

    if (call.result === 'failure') {
      error(call.data.error.message)
    } else {
      await this.getParams()
    }
  }

  makePublic = async (error) => {
    const {
      provider, address, makePublic
    } = this.state

    const call = await bPoolService.makePublic(provider, address, makePublic.publicAmount)

    if (call.result === 'failure') {
      error(call.data.error.message)
    } else {
      await this.getTokenParams()
    }
  }

  bindToken = async (error) => {
    const {
      provider, address, bindTokenInput, pool
    } = this.state

    if (!pool) {
      // Invariant
    }

    const call = await bPoolService.bindToken(
      provider,
      address,
      bindTokenInput.address,
    )
    if (call.result === 'failure') {
      error(call.error.message)
    } else {
      await this.getTokenParams()
    }
  }

  buildParamCards() {
    const { pool, address } = this.state

    return <PoolParamsGrid address={address} pool={pool} />
  }

  buildTokenParamsTable() {
    const { pool, provider, address } = this.state

    return (
      pool.loadedTokenParams ? (<PoolListTokenTable tokenParams={pool.tokenParams} address={address} provider={provider} linkPath="logs" />) :
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Loading />
      </div>
    )
  }

  buildBindTokenForm() {
    const { bindTokenInput } = this.state

    return (
      <Container>
        <div>
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
              <Button
                type="submit"
                variant="contained"
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </div>
      </Container>
    )
  }

  buildSetTokenParamsForm() {
    const { setTokenParamsInput } = this.state

    return (<Container>
      <div>
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
            <Error.Consumer>
              {error => (
                <Button
                  type="submit"
                  variant="contained"
                  onClick={() => this.setTokenParams(error.setError)}
                >
                  Submit
                </Button>
              )}
            </Error.Consumer>
          </Grid>
        </Grid>
      </div>
    </Container >)
  }

  buildSetFeeForm() {
    const { setFee } = this.state
    return (<Container>
      <div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              id="swap-fee-amount"
              label="Swap Fee"
              type="number"
              value={setFee.amount}
              onChange={event => this.setFeeAmount('swapFee', event)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="exit-fee-amount"
              label="Exit Fee"
              type="number"
              value={setFee.amount}
              onChange={event => this.setFeeAmount('exitFee', event)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Error.Consumer>
              {error => (
                <Button
                  type="submit"
                  variant="contained"
                  onClick={() => this.setFee(error.setError)}
                >
                  Submit
                </Button>
              )}
            </Error.Consumer>
          </Grid>
        </Grid>
      </div>
    </Container >)
  }

  buildMakePublicButton() {
    const { makePublic } = this.state
    return (<Container>
      <div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <TextField
              id="fee-amount"
              label="Fee Amount"
              type="number"
              value={makePublic.publicAmount}
              onChange={event => this.setPublicAmount('publicAmount', event)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Error.Consumer>
              {error => (
                <Button
                  type="submit"
                  variant="contained"
                  onClick={() => this.makePublic(error.setError)}
                >
                  Submit
                </Button>
              )}
            </Error.Consumer>
          </Grid>
        </Grid>
      </div>
    </Container >)
  }

  render() {
    const { pool } = this.state

    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h3" component="h3">Balancer Pool</Typography>
            <br />
            {pool.loadedParams ? (
              this.buildParamCards()
            ) : (
              <Loading />
              )}
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" component="h5" > Tokens</Typography >
            {this.buildTokenParamsTable()}
          </Grid>
          <Grid item xs={12} sm={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Add Token</Typography>
                <br />
                {this.buildBindTokenForm()}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Edit Token</Typography>
                <br />
                {this.buildSetTokenParamsForm()}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Set fee</Typography>
                <br />
                {this.buildSetFeeForm()}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Make public</Typography>
                <br />
                {this.buildMakePublicButton()}
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
