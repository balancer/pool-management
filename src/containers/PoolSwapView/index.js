import React, { Component } from 'react'
import { Container, Grid, TextField, Button } from '@material-ui/core'
import * as providerService from 'core/services/providerService'
import * as bPoolService from 'core/services/bPoolService'
import * as numberLib from 'core/libs/lib-number-helpers'
import { PoolParamsGrid, SwapForm, PoolSwapListTable } from 'components'

class PoolSwapView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: '',
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
    const { address, provider, pool } = this.state
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
    const { address, provider, pool } = this.state
    const tokenData = await bPoolService.getTokenParams(provider, address)
    this.setState({
      pool: {
        ...pool,
        loadedTokenParams: true,
        tokenParams: tokenData.data
      }
    })
  }

  // swapExactAmountIn = async (event) => {
  //   event.preventDefault()
  //   const {
  //     provider, address, inputAmount, outputLimit, inputToken, outputToken, limitPrice, pool
  //   } = this.state

  //   if (!pool) {
  //     // Invariant
  //   }


  //   await bPoolService.swapExactAmountIn(
  //     provider,
  //     address,
  //     inputToken,
  //     numberLib.toWei(inputAmount),
  //     outputToken,
  //     numberLib.toWei(outputLimit),
  //     numberLib.toWei(limitPrice)
  //   )

  //   await this.getTokenParams()
  // }

  render() {
    const { pool, address, provider } = this.state

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
            <PoolSwapListTable tokenParams={pool.tokenParams} />
          </Grid>
          <Grid item xs={12} sm={12}>
            <SwapForm updateTokenParams={this.getTokenParams} address={address} provider={provider} tokenParams={pool.tokenParams} />
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default PoolSwapView
