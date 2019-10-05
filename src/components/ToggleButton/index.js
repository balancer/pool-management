import React, { useEffect, useState } from 'react'
import CheckIcon from '@material-ui/icons/Check'
import ToggleButton from '@material-ui/lab/ToggleButton'

import { tokenService } from 'core/services'
import { Error } from '../../provider'

export default function StandaloneToggleButton(props) {
  const [selected, setSelected] = useState(false)
  const { provider, token, address } = props
  console.log('props provider?', provider)

  const checkApprovement = async () => {
    console.log(provider)
    const approvement = await tokenService.allowance(provider, address, token)
    if (approvement.result === 'success') {
      setSelected(approvement.isApproved)
    }
  }

  useEffect(() => {
    checkApprovement()
  })

  const approveToken = async (error) => {
    if (!selected) {
      setSelected(true)
      const call = await tokenService.approve(provider, address, token)
      if (call.result === 'failure') {
        error(call.data.error.message)
      } else {
        await checkApprovement()
      }
    } else {
      setSelected(false)
      const call = await tokenService.disapprove(provider, address, token)
      if (call.result === 'failure') {
        error(call.data.error.message)
      } else {
        await checkApprovement()
      }
    }
  }

  return (
    <Error.Consumer>
      {error => (
        <ToggleButton
          value="check"
          selected={selected}
          onChange={() => approveToken(error.setError)}
        >
          <CheckIcon />
        </ToggleButton>
      )}
    </Error.Consumer>
  )
}
