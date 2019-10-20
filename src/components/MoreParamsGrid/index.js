import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import IconCard from 'components/IconCard'
import { Typography, CardContent } from '@material-ui/core'
import { observer, inject } from 'mobx-react'

@inject('root')
@observer
class MoreParamsGrid extends React.Component {
  constructor(props) {
    super(props)
  }


  render() {
    const { poolStore } = this.props.root
    const { poolAddress } = this.props
    const pool = poolStore.poolData[poolAddress]
    let activeText

    if (pool.params.isPaused) {
      activeText = 'No'
    } else {
      activeText = 'Yes'
    }


    return (
      <div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <Card>
              <CardContent>
                <Typography variant="h5">Pool Details</Typography>
                <Typography variant="body1">{`Manager    : ${pool.params.manager}\n`}</Typography>
                <Typography variant="body1">{`Swap Fee: ${pool.params.swapFee}\n`}</Typography>
                <Typography variant="body1">{`Exit Fee: ${pool.params.exitFee}\n`}</Typography>
                <Typography variant="body1">{`Token Count: ${pool.params.numTokens}\n`}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default MoreParamsGrid