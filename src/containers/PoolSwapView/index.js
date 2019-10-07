import React, { Component } from 'react'
import { Container, Grid, Card, CardContent } from '@material-ui/core'
import { providerService, bPoolService } from 'core/services'
import { SpotPriceCard, PoolParamsGrid, SwapForm, PoolListTokenTable, Loading } from 'components'

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
      },
      selectedSwap: 'exactAmountIn'
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

  render() {
    const { pool, address, provider } = this.state
    // this will be refactored.
    const setSwapSelection = (selectedSwap) => {
      this.setState({ selectedSwap })
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
      const resultsConfig = {
        exactAmountIn: [
          { label: 'Output Amount', value: 10 },
          { label: 'Effective Price', value: 5 }
        ],
        exactAmountOut: [
          { label: 'Input Amount', value: 20 },
          { label: 'Effective Price', value: 20 }
        ],
        exactMarginalPrice: [
          { label: 'Input Amount', value: 20 },
          { label: 'Output Amount', value: 10 },
          { label: 'Effective Price', value: 20 }
        ]
      }
      return (
        <Card>
          <CardContent>
            {
              resultsConfig[this.state.selectedSwap].map((result) => {
                // console.log(resultsConfig[this.state.selectedSwap]);
                return (
                  <React.Fragment>
                    { result.label } : { result.value }<br />
                  </React.Fragment>
                )
              })
            }
          </CardContent>
        </Card>
      )
    }
    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            {
              pool.loadedParams ? (<PoolParamsGrid address={address} pool={pool} />) :
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Loading />
              </div>
            }
          </Grid>
          <Grid item xs={12}>
            {
              pool.loadedTokenParams ? (<PoolListTokenTable tokenParams={pool.tokenParams} address={address} provider={provider} linkPath="logs" />) :
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Loading />
              </div>
            }
          </Grid>
          <Grid item xs={6}>
            <SwapForm updateTokenParams={this.getTokenParams} address={address} provider={provider} tokenParams={pool.tokenParams} setSwapSelection={setSwapSelection} />
          </Grid>
          <Grid item xs={6}>
            <SwapResults />
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default PoolSwapView
