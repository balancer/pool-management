import React, { Component } from 'react'
import * as providerService from 'core/services/providerService'
import * as bPoolService from 'core/services/bPoolService'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import TokenParametersTable from 'components/TokenParametersTable'
import PoolParamsGrid from 'components/PoolParamsGrid'
import MoreParamsGrid from 'components/MoreParamsGrid'
import * as numberLib from 'core/libs/lib-number-helpers'
import { styles } from './styles.scss'

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
        address: '0xc045c7b6b976d24728872d2117073c893d0b09c2',
        balance: '2000',
        weight: '50'
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

  setTokenParamsProperty = (property, event) => {
    const { setTokenParamsInput } = this.state
    const newProperty = event.target.value

    setTokenParamsInput[property] = newProperty

    this.setState({ setTokenParamsInput })
  }

  setTokenParams = async (evt) => {
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

  bindToken = async (evt) => {
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
    const { pool } = this.state

    return <PoolParamsGrid pool={pool} />
  }

  buildTokenParamsTable() {
    const { pool } = this.state

    return <TokenParametersTable tokenData={pool.tokenParams} />
  }

  buildBindTokenForm() {
    const { bindTokenInput } = this.state

    return (<Container>
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
            <input type="submit" value="Submit" />
          </Grid>
        </Grid>
      </form>
    </Container>)
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
              onChange={e => this.setTokenParamsProperty('address', e)}
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
              onChange={e => this.setTokenParamsProperty('balance', e)}
            />
          </Grid>
          <Grid item xs={12} sm={4}><TextField
            id="token-address"
            label="Weight"
            type="number"
            placeholder="0"
            value={setTokenParamsInput.weight}
            onChange={e => this.setTokenParamsProperty('weight', e)}
          /></Grid>
          <Grid item xs={12} sm={4}>
            <input type="submit" value="Submit" />
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
            <MoreParamsGrid pool={pool} />
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default PoolSwapView
