import React, { Component } from 'react'
import * as providerService from 'core/services/providerService'
import * as bFactoryService from 'core/services/bFactoryService'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import PoolList from 'components/PoolList'
import { appConfig } from 'configs/config-main'

class MyPoolsView extends Component {
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
        <Typography variant="h3" component="h3">Balancer Pools</Typography>
        <br />
        {poolsLoaded ? (
          <PoolList linkPath="manage" poolData={knownPools} />
        ) : (
          <div />
          )}
        <br />
      </Container>
    )
  }
}

export default MyPoolsView
