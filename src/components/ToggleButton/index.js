import React from 'react'
import CheckIcon from '@material-ui/icons/Check'
import ToggleButton from '@material-ui/lab/ToggleButton'

export default function StandaloneToggleButton(props) {
  const [selected, setSelected] = React.useState(false)

  const approveToken = () => {
    setSelected(!selected)
    // console.log(props.token)
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
