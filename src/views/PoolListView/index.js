import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Container, Grid, Typography, Button } from '@material-ui/core'
import { PoolList, Loading } from 'components'

@inject('root')
@observer
class PoolListView extends Component {
  constructor(props) {
    super(props)
  }

  async componentDidMount() {
    const { providerStore, poolStore } = this.props.root
    if (!providerStore.defaultAccount) {
      await providerStore.setWeb3WebClient()
    }

    await poolStore.fetchKnownPools()
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
    const { poolStore } = this.props.root

    return (
      <Container>
        <br></br>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h3" component="h3">Balancer Pools</Typography>
            <br />
            {poolStore.knownPoolsLoaded ? (
              <PoolList linkPath="swap" poolData={poolStore.knownPools} />
            ) : (
                <Loading />
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
