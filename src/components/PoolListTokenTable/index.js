import React from 'react'
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, makeStyles, Tooltip, Typography } from '@material-ui/core'
import { TokenText } from 'components'
import { web3Lib } from 'core/libs'
import ToggleButton from '../ToggleButton'
import PoolInvestView from '../../containers/PoolInvestView'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%'
  },
  table: {
    minWidth: 650
  },
  address: {
    width: '70%'
  }
}))

export default function PooListTokenTable(props) {
  const styles = useStyles()
  const columns = [
    { label: 'Symbol', id: 'symbol', minWidth: 20 },
    { label: 'Address', id: 'Address', minWidth: 20 },
    { label: 'My balance', id: 'My balance', minWidth: 20 },
    { label: 'Pool balance', id: 'Pool balance', minWidth: 20 },
    { label: 'Weight', id: 'Weight', minWidth: 20 },
    { label: 'Lock/Unlock', id: 'lockable', minWidth: 20 }
  ]
  const [selected, setSelected] = React.useState(false)

  const { tokenParams, address, provider } = props
  const rows = Object.keys(tokenParams).map((token) => {
    const {
      symbol, balance, weight, userBalance
    } = tokenParams[token]
    return {
      symbol: symbol || '???',
      address: token,
      addressStub: web3Lib.toAddressStub(token),
      balance,
      weight,
      userBalance
    }
  })

  window.ethereum.on('accountsChanged', async (accounts) => {
    window.location.reload()
  })

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

  function handleChangePage(event, newPage) {
    setPage(newPage)
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleSelect = (event) => {
    setSelected(!selected)
  }

  return (
    <Paper className={styles.root}>
      <div className={styles.table}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.address}>
                  <TableCell key={`symbol${row.address}`}>
                    <Typography>{row.symbol}</Typography>
                  </TableCell>
                  <TableCell key={`address${row.address}`}>
                    <Tooltip title={row.address} interactive>
                      <Typography>{row.addressStub}</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell key={`mybalance${row.address}`}>
                    <TokenText weiValue={row.userBalance} />
                  </TableCell>
                  <TableCell key={`poolbalance${row.address}`}>
                    <TokenText weiValue={row.balance} />
                  </TableCell>
                  <TableCell key={`weight${row.address}`}>
                    <TokenText weiValue={row.weight} />
                  </TableCell>
                  <TableCell key={`toggl${row.address}`}>
                    <ToggleButton token={row.address} provider={provider} address={address} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{
          'aria-label': 'previous page'
        }}
        nextIconButtonProps={{
          'aria-label': 'next page'
        }}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  )
}
