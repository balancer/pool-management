import React, { Component } from 'react'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import LogTable from 'components/LogTable'
import PoolTitleCard from 'components/PoolTitleCard'
import { observer, inject } from 'mobx-react'

@inject('root')
@observer
class LogView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: ''
    }
  }

  async componentDidMount() {
    const { address } = this.props.match.params
    const { poolStore } = this.props.root
    poolStore.setCurrentPool(address)
    this.setState({ address })
    await poolStore.fetchCallLogs(address)
  }

  render() {
    const { address } = this.state
    const { poolStore } = this.props.root

    const logsLoaded = poolStore.areLogsLoaded(address)

    let logData
    if (logsLoaded) {
      logData = poolStore.getLogs(address)
    }



    return (
      <Container>
        <br></br>
        <Typography variant="h3" component="h3">Pool Logs</Typography>
        <br />
        <PoolTitleCard address={address} pool={{}} />
        <br />
        {logsLoaded ?
          <LogTable logData={logData} />
          :
          <React.Fragment></React.Fragment>
        }
        <br />
      </Container>
    )
  }
}

export default LogView
