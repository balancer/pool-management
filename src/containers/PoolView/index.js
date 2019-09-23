import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as poolParamActionCreators from 'core/actions/actions-pool-params'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import TokenParametersTable from 'components/TokenParametersTable'

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
    evt.preventDefault()
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

    const tokenParamTable = this.buildTokenParamsTable()

    return (
      <div className="container" >
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
        <div>Name already exists?</div>
        {tokenParamTable}
      </div>
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
