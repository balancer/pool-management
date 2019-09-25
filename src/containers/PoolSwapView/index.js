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
import Web3 from 'web3'
import { styles } from './styles.scss'
import BPool from '../../../balancer-core/out/BPool_meta.json'
import TestToken from '../../../external-contracts/TestToken.json'


class PoolSwapView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: '',
      inputBalance: 0,
      outputBalance: 0,
      inputAmount: 0,
      outputAmount: 0,
      inputToken: 'EUR',
      outputToken: 'EUR'
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

  setOutputAmount = (event) => {
    this.setState({
      outputAmount: event.target.value
    })
  }

  setInputToken = (event) => {
    const { actions } = this.props
    const { outputToken } = this.state
    const newToken = event.target.value

    // If the output token is the same, unset it
    if (outputToken === newToken) {
      this.setState({ inputToken: newToken, outputToken: 'None' })
    } else {
      this.setState({ inputToken: newToken })
    }

    if (newToken === 'None') {
      this.setState({ outputBalance: 0 })
    } else {
      actions.token.getUserBalance(newToken)
    }
  }

  setOutputToken = (event) => {
    const { actions } = this.props
    const { inputToken } = this.state
    const newToken = event.target.value

    // If the output token is the same, unset it
    if (inputToken === newToken) {
      this.setState({ outputToken: newToken, inputToken: 'None' })
    } else {
      this.setState({ outputToken: newToken })
    }

    if (newToken === 'None') {
      this.setState({ outputBalance: 0 })
    } else {
      actions.token.getUserBalance(newToken)
    }
  }

  swapExactAmountIn = (evt) => {
    // Send action
    const { provider } = this.props
    console.log(provider)
    const { web3Provider } = provider
    const {
      address, inputToken, inputAmount, outputToken, outputAmount
    } = this.state

    const web3 = new Web3(web3Provider)
    const { defaultAccount } = web3Provider.eth

    const bPool = new web3.eth.Contract(BPool.output.abi, address, { from: defaultAccount })
    const result = bPool.methods.swap_ExactAmountIn(inputToken, inputAmount, outputToken, outputAmount, outputAmount).send()
  }

  buildInternalExchangeForm() {
    const {
      inputBalance, outputBalance, inputAmount, outputAmount, inputToken, outputToken
    } = this.state
    const { pool } = this.props

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

    console.log(pool.tokenParams)
    console.log(tokens)

    return (<form onSubmit={this.swapExactAmountIn} noValidate autoComplete="off">
      <Grid container spacing={1}>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={3}>
            <TextField
              id="balance-in"
              label="Balance"
              placeholder=""
              disabled
              value={inputBalance}
              type="number"
              InputLabelProps={{
                shrink: true
              }}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              id="amount-in"
              label="Input"
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
              {tokens.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid item xs={6} sm={3}>
            <TextField
              id="balance-out"
              label="Balance"
              placeholder=""
              disabled
              value={outputBalance}
              type="number"
              InputLabelProps={{
                shrink: true
              }}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              id="amount-out"
              label="Output (estimated)"
              placeholder="0"
              value={outputAmount}
              onChange={this.setOutputAmount}
              type="number"
              InputLabelProps={{
                shrink: true
              }}
              margin="normal"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
              {tokens.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <input type="submit" value="Submit" />
          </Grid>
        </Grid>
      </Grid>
    </form>)
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
          <Grid item xs={12} sm={12}>
            <PoolParamsGrid pool={pool} />
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
