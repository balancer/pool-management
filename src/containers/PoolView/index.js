import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as poolParamActionCreators from 'core/actions/actions-pool-params'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'

import TokenParametersTable from 'components/TokenParametersTable'
import PoolParamsGrid from 'components/PoolParamsGrid'

class PoolView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: ''
    }
  }

  componentWillMount() {
    const { actions } = this.props
    const { address } = this.props.match.params

    actions.pools.getTokenBalances(address)

    this.setState({ address })
  }

  // componentDidMount() {
  //   const { actions } = this.props
  //   const { address } = this.state

  //   actions.pools.getFee(address)
  // }

  onSubmit = (evt) => {
    const { actions } = this.props
    const { address } = this.state

    actions.pools.getTokenBalances(address)
    actions.pools.getParams(address)
    evt.preventDefault()
  }

  buildParamCards() {
    const { address } = this.state
    const { pools } = this.props
    const pool = pools.pools[address]

    if (!pool) {
      return <div />
    }

    if (pool.hasParams) {
      return <PoolParamsGrid pool={pool} />
    }

    return <div />
  }

  buildTokenParamsTable() {
    const { address } = this.state
    const { pools } = this.props
    const pool = pools.pools[address]

    console.log('pool!', pools)
    console.log('pool!', pool)

    if (!pool) {
      return <div />
    }


    let tokenParamTable

    if (pool.hasTokenParams) {
      console.log(pool.tokenParams)
      tokenParamTable = (<div>
        <TokenParametersTable tokenData={pool.tokenParams} />
      </div>)
    } else {
      tokenParamTable = <div />
    }

    return tokenParamTable
  }

  render() {
    const { address } = this.state

    const paramCards = this.buildParamCards()
    const tokenParamTable = this.buildTokenParamsTable()

    return (
      <Container>
        <form onSubmit={this.onSubmit}>
          <TextField
            id="standard-name"
            label="Enter Name"
            value={address}
            onChange={this.handleChange}
          />
          <br />
          <br />
          <Button variant="outlined" type="submit">Submit</Button>
        </form>
        <br />
        <Typography variant="h3" component="h3">Balancer Pool</Typography>
        <br />
        {paramCards}
        <br />
        <Typography variant="h5" component="h5">Tokens</Typography>
        <br />
        {tokenParamTable}
      </Container>
    )
  }
}

function mapStateToProps(state) {
  return {
    pools: state.pools
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      pools: bindActionCreators(poolParamActionCreators, dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PoolView)
