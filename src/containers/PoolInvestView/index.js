import React, { Component } from 'react'
import { Container, Typography, Grid, Card, CardContent } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { PoolInvestListTable } from 'components'
import { providerService, bFactoryService } from 'core/services'
import { appConfig } from 'configs'

class PoolInvestView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      factoryAddress: appConfig.factory,
      provider: null,
      knownPools: {},
      poolsLoaded: false,
      pendingRequest: false,
      requestError: null
    }
  }

  async componentWillMount() {
    const { factoryAddress } = this.state

    const provider = await providerService.getProvider()
    this.setState({ provider })

    const { defaultAccount } = provider.web3Provider.eth
    const poolData = await bFactoryService.getKnownPools(provider, factoryAddress, {
      caller: defaultAccount,
      fromBlock: 0,
      toBlock: 'latest'
    })
    this.setState({
      knownPools: poolData.knownPools,
      poolsLoaded: true
    })
  }

  render() {
    const { knownPools, poolsLoaded } = this.state

    if (!poolsLoaded) {
      return <div />
    }

    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                Pool Card Address
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                Active Card
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                My Pool Token Balance
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            {
              poolsLoaded ? (<PoolInvestListTable linkPath="logs" poolData={knownPools} />) : (<div />)
            }
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                Invest/Devest Method Dropdown
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                Form to invest/devest(fields based on method selected)
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default PoolInvestView
