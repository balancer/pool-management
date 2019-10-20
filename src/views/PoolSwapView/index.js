import React, { Component } from 'react'
import { Typography, Container, Grid } from '@material-ui/core'
import { observer, inject } from 'mobx-react'
import { SpotPriceCard, PoolParamsGrid, SwapForm, PoolListTokenTable, Loading } from 'components'
import { LoadingCard } from '../../components'

@inject('root')
@observer
class PoolSwapView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: ''
    }
  }

  async componentDidMount() {
    const { address } = this.props.match.params
    const { providerStore, poolStore } = this.props.root
    poolStore.setCurrentPool(address)
    this.setState({ address })

    if (!providerStore.defaultAccount) {
      await providerStore.setWeb3WebClient()
    }

    // Get pool params
    await poolStore.fetchParams(address)
    await poolStore.fetchTokenParams(address)
  }

  render() {
    const { address } = this.state
    const { poolStore, providerStore } = this.props.root
    const userAddress = providerStore.getDefaultAccount()

    const pool = poolStore.getPool(address)
    const paramsLoaded = poolStore.isParamsLoaded(address)
    const tokenParamsLoaded = poolStore.isTokenParamsLoaded(address)

    return (
      <Container>
        <br></br>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h3" component="h3">Swap</Typography>
          </Grid>
          {paramsLoaded && tokenParamsLoaded ?
            <React.Fragment>
              < Grid item xs={12} sm={12}>
                <PoolParamsGrid poolAddress={address} />
              </Grid>
              <Grid item xs={12}>
                <PoolListTokenTable displayMode="pool" poolAddress={address} userAddress={userAddress} linkPath="logs" />

              </Grid>
              <Grid container>
                <SwapForm poolAddress={address} />
              </Grid>
            </React.Fragment> :
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <LoadingCard title="Loading Pool" />
            </div>
          }
        </Grid>
      </Container >
    )
  }
}

export default PoolSwapView
