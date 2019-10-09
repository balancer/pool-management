import React from 'react'
import { Tooltip, Typography } from '@material-ui/core'
import { web3Lib } from 'core/libs'

export default function TokenText(props) {
    const {
        weiValue
    } = props

    const etherValue = web3Lib.toEther(weiValue)
    const roundedValue = web3Lib.roundValue(web3Lib.toEther(weiValue))

    return (
      <Tooltip title={etherValue} interactive>
        <Typography>{roundedValue}</Typography>
      </Tooltip>
    )
}
