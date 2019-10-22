import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import { Typography, CardContent } from '@material-ui/core'
import { observer, inject } from 'mobx-react'
import * as helpers from 'utils/helpers'

@inject('root')
@observer
class MoreParamsGrid extends React.Component {
  render() {
    const { poolStore } = this.props.root
    const { poolAddress } = this.props
    const pool = poolStore.poolData[poolAddress]

    const swapFee = helpers.fromWei(pool.params.swapFee)
    const exitFee = helpers.fromWei(pool.params.exitFee)

    return (
      <div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <Card>
              <CardContent>
                <Typography variant="h5">Pool Details</Typography>
                <Typography variant="body1">{`Manager    : ${pool.params.manager}\n`}</Typography>
                <Typography variant="body1">{`Swap Fee: ${swapFee}\n`}</Typography>
                <Typography variant="body1">{`Exit Fee: ${exitFee}\n`}</Typography>
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