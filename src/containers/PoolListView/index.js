import React, { Component } from 'react'
import * as providerService from 'core/services/providerService'
import * as bFactoryService from 'core/services/bFactoryService'
import { Container, Grid, Typography, Button } from '@material-ui/core'
import PoolList from 'components/PoolList'
import { appConfig } from 'configs/config-main'

class PoolListView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      factoryAddress: appConfig.bFactory,
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

  newPool = async (event) => {
    event.preventDefault()
    this.props.history.push('/new')
  }

  buildNewPoolButton() {
    return (<Container>
      <form onSubmit={this.newPool}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Button
              type="submit"
              variant="contained"
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container >)
  }

  render() {
    const { poolsLoaded, knownPools } = this.state

    if (!poolsLoaded) {
      return <div />
    }

    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h3" component="h3">Balancer Pools</Typography>
            <br />
            {poolsLoaded ? (
              <PoolList linkPath="swap" poolData={knownPools} />
            ) : (
              <div />
              )}
            <br />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" component="h5">Create New Pool</Typography>
            <br />
            {this.buildNewPoolButton()}
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default PoolListView
