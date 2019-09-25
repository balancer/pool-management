import React, { Component } from 'react'
import * as providerService from 'core/services/providerService'
import * as bFactoryService from 'core/services/bFactoryService'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import PoolList from 'components/PoolList'

class PoolListView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      factoryAddress: '0x3F4E941ef5071a1D09C2eB4a24DA1Fc43F76fcfF',
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

    const poolData = await bFactoryService.getKnownPools(provider, factoryAddress, {
      fromBlock: 0,
      toBlock: 'latest'
    })
    this.setState({
      knownPools: poolData.knownPools,
      poolsLoaded: true
    })
  }

  render() {
    const { poolsLoaded, knownPools } = this.state

    if (!poolsLoaded) {
      return <div />
    }

    return (
      <Container>
        <Typography variant="h3" component="h3">Balancer Pools</Typography>
        <br />
        {poolsLoaded ? (
          <PoolList linkPath="swap" poolData={knownPools} />
        ) : (
          <div />
          )}
        <br />
      </Container>
    )
  }
}

export default PoolListView
