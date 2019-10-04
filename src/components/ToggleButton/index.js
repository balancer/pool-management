import React, { useEffect, useState } from 'react'
import CheckIcon from '@material-ui/icons/Check'
import ToggleButton from '@material-ui/lab/ToggleButton'

import { tokenService } from 'core/services'

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

  const approveToken = async () => {
    console.log(provider)
    if (!selected) {
      // setSelected(true)
      await tokenService.approve(provider, address, token)
      await checkApprovement()
    } else {
      // setSelected(false)
      await tokenService.disapprove(provider, address, token)
      await checkApprovement()
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
