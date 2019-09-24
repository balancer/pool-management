import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as providerActionCreators from 'core/actions/actions-provider'
import * as poolParamActionCreators from 'core/actions/actions-pool-params'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import TokenParametersTable from 'components/TokenParametersTable'
import PoolParamsGrid from 'components/PoolParamsGrid'
import MoreParamsGrid from 'components/MoreParamsGrid'
import AsyncButton from 'components/AsyncButton'
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
      }
    }
  }

  componentWillMount() {
    const { address } = this.props.match.params
    this.setState({ address })
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

  setTokenParams = (evt) => {
    const { actions, pool } = this.props
    const { address, setTokenParamsInput } = this.state

    if (!pool) {
      // Invariant
    }

    // Don't allow action if pending
    if (!pool.pendingTx) {
      actions.pools.setTokenParams(
        address,
        setTokenParamsInput.address,
        numberLib.toWei(setTokenParamsInput.balance),
        numberLib.toWei(setTokenParamsInput.weight)
      )
    }
    evt.preventDefault()
  }

  bindToken = (evt) => {
    const { actions, pool } = this.props
    const { address, bindTokenInput } = this.state

    if (!pool) {
      // Invariant
    }

    // Don't allow action if pending
    if (!pool.pendingTx) {
      actions.pools.bindToken(
        address,
        bindTokenInput.address,
        bindTokenInput.balance,
        bindTokenInput.weight
      )
    }
    evt.preventDefault()
  }

  buildParamCards() {
    const { pool } = this.props

    return <PoolParamsGrid pool={pool} />
  }

  buildTokenParamsTable() {
    const { pool } = this.props

    return <TokenParametersTable tokenData={pool.tokenParams} />
  }

  buildBindTokenForm() {
    const { bindTokenInput } = this.state
    const { pool } = this.props

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
    const { provider, actions, pool } = this.props
    const { address, currentTab } = this.state

    console.log('render', provider, pool, currentTab)
    console.log(!pool.loadedParams)
    console.log(provider !== null)

    const allParamsLoaded = pool.loadedParams && pool.loadedTokenParams
    const poolParamsLoaded = pool.loadedParams
    const tokenParamsLoaded = pool.loadedTokenParams

    // If the address isn't this contract, invalidate and load the entire state
    // if (pool.address !== address && provider !== null) {

    // }

    if (pool.address !== address && provider !== null) {
      actions.pools.getTokenBalances(address)
      actions.pools.getParams(address)
    }

    // if (pool.loadedParams === false && provider !== null) {
    //   actions.pools.getTokenBalances(address)
    //   actions.pools.getParams(address)
    // }

    if (!pool.loadedParams || !pool.loadedTokenParams) {
      return <div />
    }

    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h3" component="h3">Balancer Pool</Typography>
            <br />
            {poolParamsLoaded ? (
              this.buildParamCards()
            ) : (
              <div />
              )}
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant="h5" component="h5" > Tokens</Typography >
            <br />
            {tokenParamsLoaded ? (
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
                {tokenParamsLoaded ? (
                  this.buildBindTokenForm()
                ) : (
                  <div />
                  )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">Edit Token</Typography>
                <br />
                {tokenParamsLoaded ? (
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

function mapStateToProps(state) {
  return {
    pool: state.pool.pool,
    provider: state.provider
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      provider: bindActionCreators(providerActionCreators, dispatch),
      pools: bindActionCreators(poolParamActionCreators, dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PoolSwapView)
