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
import ExchangeForm from 'components/ExchangeForm'
import AsyncButton from 'components/AsyncButton'
import { styles } from './styles.scss'

class PoolView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: '',
      inputAmount: 0,
      outputAmount: 0,
      inputToken: 'EUR',
      outputToken: 'EUR',
      bindTokenInput: {
        address: '',
        balance: '',
        weight: ''
      }
    }
  }

  componentWillMount() {
    const { address } = this.props.match.params
    this.setState({ address })
  }

  onSubmit = (evt) => {
    const { actions } = this.props
    const { address } = this.state

    actions.pools.getTokenBalances(address)
    actions.pools.getParams(address)
    evt.preventDefault()
  }

  setInputAmount = (event) => {
    this.setState({
      inputAmount: event.target.value
    })
  }

  setInputToken = (event) => {
    const { inputToken, outputToken } = this.state
    const newToken = event.target.value

    // If the output token is the same, unset it
    if (outputToken === newToken) {
      this.setState({ inputToken: newToken, outputToken: 'None' })
    } else {
      this.setState({ inputToken: newToken })
    }
  }

  setOutputToken = (event) => {
    const outputToken = event.target.value
    // // If the input token is the same, unset it
    // if (inputToken === outputToken) {
    //   debugger
    //   setValues({ ...values, 'inputToken': 'None' })
    // }

    this.setState({ outputToken })
  }

  setBindInputProperty = (property, event) => {
    const { bindTokenInput } = this.state
    const newProperty = event.target.value

    bindTokenInput[property] = newProperty

    this.setState({ bindTokenInput })
  }

  bindToken = (evt) => {
    const { actions, pools } = this.props
    const { address, bindTokenInput } = this.state

    const pool = pools.pools[address]

    if (!pool) {
      // Invariant
    }

    if (!pool.pendingTx) {
      actions.pools.bindToken(
        address,
        bindTokenInput.address,
        bindTokenInput.balance,
        bindTokenInput.weight
      )
    } else {
      // Don't do anything because we're pending!
    }


    evt.preventDefault()
  }

  buildParamCards() {
    const { address } = this.state
    const { pools } = this.props
    const pool = pools.pools[address]

    if (!pool) {
      return <div />
    }

    if (!pool.hasParams) {
      return <div />
    }

    return <PoolParamsGrid pool={pool} />
  }

  buildTokenParamsTable() {
    const { address } = this.state
    const { pools } = this.props
    const pool = pools.pools[address]

    if (!pool) {
      return <div />
    }

    if (!pool.hasTokenParams) {
      return <div />
    }

    return <TokenParametersTable tokenData={pool.tokenParams} />
  }

  buildExchangeForm() {
    const { address } = this.state
    const { pools } = this.props
    const pool = pools.pools[address]

    if (!pool) {
      return <div />
    }

    if (!pool.hasParams || !pool.hasTokenParams) {
      return <div />
    }

    return <ExchangeForm />
  }

  buildInternalExchangeForm() {
    const {
      address, inputAmount, outputAmount, inputToken, outputToken
    } = this.state
    const { pools } = this.props
    const pool = pools.pools[address]

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

    if (!pool) {
      return <div />
    }

    if (!pool.hasParams || !pool.hasTokenParams) {
      return <div />
    }

    return (<form noValidate autoComplete="off">
      <div>
        <TextField
          id="amount-in"
          label="Input"
          placeholder="0"
          value={inputAmount}
          // onChange={handleChange('inputAmount')}
          type="number"
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
          value={inputToken}
          onChange={this.setInputToken}
          SelectProps={{
            native: true
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
      </div>
      <div>
        <TextField
          id="amount-out"
          label="Output (estimated)"
          placeholder="0"
          value={outputAmount}
          type="number"
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
          value={outputToken}
          onChange={this.setOutputToken}
          SelectProps={{
            native: true
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
      </div>
    </form>)
  }

  buildBindTokenForm() {
    const { address, bindTokenInput } = this.state
    const { pools, provider } = this.props
    const pool = pools.pools[address]

    if (!pool) {
      return <div />
    }

    if (!pool.hasParams || !pool.hasTokenParams) {
      return <div />
    }

    return (<Container>
      <form onSubmit={this.bindToken}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={9}>
            <TextField
              id="token-address"
              label="Token Address"
              value={bindTokenInput.address}
              onChange={e => this.setBindInputProperty('address', e)}
            />
            <TextField
              id="token-address"
              label="Balance"
              type="number"
              placeholder="0"
              value={bindTokenInput.balance}
              onChange={e => this.setBindInputProperty('balance', e)}
            />
            <TextField
              id="token-address"
              label="Weight"
              type="number"
              placeholder="0"
              value={bindTokenInput.weight}
              onChange={e => this.setBindInputProperty('weight', e)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <AsyncButton buttonText="Bind" isLoading={pool.pendingTx} />
          </Grid>
        </Grid>
      </form>
    </Container>)
  }

  render() {
    const { provider, actions, pools } = this.props
    const { address } = this.state
    const pool = pools.pools[address]

    const paramCards = this.buildParamCards()
    const tokenParamTable = this.buildTokenParamsTable()
    const exchangeForm = this.buildExchangeForm()
    const internalForm = this.buildInternalExchangeForm()
    const adminForm = this.buildBindTokenForm()

    if (provider) {
      actions.pools.getTokenBalances(address)
      actions.pools.getParams(address)
    }

    return (
      <Container>
        <form onSubmit={this.onSubmit}>
          <TextField
            id="standard-name"
            label="Enter Name"
            value={address}
            onChange={this.handleChange}
          />
          <br />
          <br />
          <Button variant="outlined" type="submit">Submit</Button>
        </form>
        <br />
        <Typography variant="h3" component="h3">Balancer Pool</Typography>
        <br />
        {paramCards}
        <br />
        <Typography variant="h5" component="h5" > Tokens</Typography >
        <br />
        {tokenParamTable}
        <br />
        <Typography variant="h5" component="h5">Exchange</Typography>
        <br />
        {/* {internalForm} */}
        <br />
        <Typography variant="h5" component="h5">Admin</Typography>
        <br />
        {adminForm}
      </Container>
    )
  }
}

function mapStateToProps(state) {
  return {
    pools: state.pools,
    provider: state.web3Provider
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

export default connect(mapStateToProps, mapDispatchToProps)(PoolView)
