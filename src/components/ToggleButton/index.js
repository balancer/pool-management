import React, { useEffect, useState } from 'react'
import CheckIcon from '@material-ui/icons/Check'
import ToggleButton from '@material-ui/lab/ToggleButton'

import { tokenService } from 'core/services'

export default function StandaloneToggleButton(props) {
  const [selected, setSelected] = useState(false)
  const { provider, token, address } = props

  const checkApprovement = async () => {
    const approvement = await tokenService.allowance(provider, address, token)
    if (approvement.result === 'success') {
      setSelected(approvement.isApproved)
    }
  }

  useEffect(() => {
    checkApprovement()
  })

  const approveToken = async () => {
    if (!selected) {
      setSelected(true)
      await tokenService.approve(provider, address, token)
    } else {
      console.log('Disapproval method needs to be added')
    }
  }

  return (
    <ToggleButton
      value="check"
      selected={selected}
      onChange={approveToken}
    >
      <CheckIcon />
    </ToggleButton>
  )
}
