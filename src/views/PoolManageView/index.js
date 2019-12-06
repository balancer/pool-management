import React, { Component } from 'react'
import { Container, Grid, Typography } from '@material-ui/core'
import { PoolParamsGrid, MoreParamsGrid, PoolListTokenTable } from 'components'
import { observer, inject } from 'mobx-react'
import { LoadingCard, ManagePoolForm } from '../../components'

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

    const paramsLoaded = poolStore.isParamsLoaded(address)
    const tokenParamsLoaded = poolStore.isTokenParamsLoaded(address)

    return (
      <Container>
        <br></br>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h3" component="h3">Manage Pool</Typography>
          </Grid>
          {paramsLoaded && tokenParamsLoaded ?
            <React.Fragment>
              <Grid item xs={12}>
                <PoolParamsGrid poolAddress={address} />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography variant="h5" component="h5" > Tokens</Typography >
                <PoolListTokenTable displayMode="pool" poolAddress={address} userAddress={userAddress} linkPath="logs" />
              </Grid>
              <Grid item xs={12} sm={12}>
                <ManagePoolForm poolAddress={address} />
              </Grid>
              <Grid item xs={12} sm={12}>
                <MoreParamsGrid poolAddress={address} />
              </Grid>
            </React.Fragment> :
            <Grid container spacing={3}>
              <Grid item xs={4}></Grid>
              <Grid item xs={4}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <LoadingCard title={''} />
                </div>
              </Grid>
              <Grid item xs={4}></Grid>
            </Grid>
          }
        </Grid>
      </Container >
    )
  }
}

export default PoolSwapView
