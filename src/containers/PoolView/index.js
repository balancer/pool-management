import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as poolParamActionCreators from 'core/actions/actions-pool-params'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

class PoolView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: ''
    }
  }

  componentWillMount() {
    const { address } = this.props.match.params

    this.setState({ address })
  }

  // componentDidMount() {
  //   const { actions } = this.props
  //   const { address } = this.state

  //   actions.poolParams.getFee(address)
  // }

  onSubmit = (evt) => {
    const { actions } = this.props
    const { address } = this.state

    actions.poolParams.getFee(address)
    evt.preventDefault()
  }

  render() {
    const { address } = this.state
    const { poolParams } = this.props
    console.log(poolParams)

    return (
      <div className="container">
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
        <div>Name already exists? {poolParams.fee}</div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    poolParams: state.poolParams
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      poolParams: bindActionCreators(poolParamActionCreators, dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PoolView)
