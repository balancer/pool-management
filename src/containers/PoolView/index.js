import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as providerActionCreators from 'core/actions/actions-provider'
import * as poolParamActionCreators from 'core/actions/actions-pool-params'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import Grid from '@material-ui/core/Grid'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import TokenParametersTable from 'components/TokenParametersTable'
import PoolParamsGrid from 'components/PoolParamsGrid'
import AsyncButton from 'components/AsyncButton'
import * as numberLib from 'core/libs/lib-number-helpers'
import { styles } from './styles.scss'

class PoolView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: '',
      currentTab: 0,
      inputAmount: 0,
      outputAmount: 0,
      inputToken: 'EUR',
      outputToken: 'EUR',
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

  setInputAmount = (event) => {
    this.setState({
      inputAmount: event.target.value
    })
  }

  setCurrentTab = (newValue, event) => {
    const currentTab = event.target.value
    console.log(currentTab)
    this.setState({ currentTab })
  };

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

  buildInternalExchangeForm() {
    const {
      inputAmount, outputAmount, inputToken, outputToken
    } = this.state
    const { pool } = this.props

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
    const { bindTokenInput } = this.state
    const { pool } = this.props

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
            <input type="submit" value="Submit" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <AsyncButton buttonText="Bind" isLoading={pool.pendingTx} />
          </Grid>
        </Grid>
      </form>
    </Container>)
  }

  buildSetTokenParamsForm() {
    const { setTokenParamsInput } = this.state
    const { pool } = this.props

    return (<Container>
      <form onSubmit={this.setTokenParams}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={9}>
            <TextField
              id="token-address"
              label="Token Address"
              value={setTokenParamsInput.address}
              onChange={e => this.setTokenParamsProperty('address', e)}
            />
            <TextField
              id="token-address"
              label="Balance"
              type="number"
              placeholder="0"
              value={setTokenParamsInput.balance}
              onChange={e => this.setTokenParamsProperty('balance', e)}
            />
            <TextField
              id="token-address"
              label="Weight"
              type="number"
              placeholder="0"
              value={setTokenParamsInput.weight}
              onChange={e => this.setTokenParamsProperty('weight', e)}
            />
            <input type="submit" value="Submit" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <AsyncButton buttonText="Bind" isLoading />
          </Grid>
        </Grid>
      </form>
    </Container>)
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

    if (pool.loadedParams === false && provider !== null) {
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
        {poolParamsLoaded ? (
          this.buildParamCards()
        ) : (
          <div />
          )}
        <br />
        <Typography variant="h5" component="h5" > Tokens</Typography >
        <br />
        {tokenParamsLoaded ? (
          this.buildTokenParamsTable()
        ) : (
          <div />
          )}
        <br />
        <Tabs
          value={currentTab}
          onChange={e => this.setCurrentTab(e)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Item One" />
          <Tab label="Item Two" />
          <Tab label="Item Three" />
        </Tabs>

        <Typography variant="h5" component="h5">Exchange</Typography>
        <br />
        {/* {internalForm} */}
        <br />
        <Typography variant="h5" component="h5">Add Token</Typography>
        <br />
        {tokenParamsLoaded ? (
          this.buildBindTokenForm()
        ) : (
          <div />
          )}
        <br />
        <Typography variant="h5" component="h5">Edit Token</Typography>
        <br />
        {tokenParamsLoaded ? (
          this.buildSetTokenParamsForm()
        ) : (
          <div />
          )}
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

export default connect(mapStateToProps, mapDispatchToProps)(PoolView)
