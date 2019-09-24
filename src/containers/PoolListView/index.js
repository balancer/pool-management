import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as providerActionCreators from 'core/actions/actions-provider'
import * as factoryActionCreators from 'core/actions/actions-factory'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import Grid from '@material-ui/core/Grid'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import PoolList from 'components/PoolList'
import { styles } from './styles.scss'

class PoolManageView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      factoryAddress: '0x3F4E941ef5071a1D09C2eB4a24DA1Fc43F76fcfF'
    }
  }

  render() {
    const { provider, factory, actions } = this.props
    const { factoryAddress } = this.state

    const knownPoolsLoaded = factory.poolsLoaded

    if (knownPoolsLoaded === false && provider !== null) {
      actions.factory.getKnownPools(factoryAddress)
    }

    if (!knownPoolsLoaded) {
      return <div />
    }

    return (
      <Container>
        <Typography variant="h3" component="h3">Balancer Pools</Typography>
        <br />
        {knownPoolsLoaded ? (
          <PoolList linkPath="swap" poolData={factory.knownPools} />
        ) : (
          <div />
          )}
        <br />
      </Container>
    )
  }
}

function mapStateToProps(state) {
  return {
    provider: state.provider,
    factory: state.factory
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      provider: bindActionCreators(providerActionCreators, dispatch),
      factory: bindActionCreators(factoryActionCreators, dispatch)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PoolManageView)
