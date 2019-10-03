import React from 'react'
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, makeStyles } from '@material-ui/core'
import { numberLib } from 'core/libs'
import ToggleButton from '../ToggleButton'

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

export default function PoolSwapListTable(props) {
  const styles = useStyles()
  const columns = [
    { label: 'Symbol', id: 'symbol', minWidth: 60 },
    { label: 'Address', id: 'Address', minWidth: 60 },
    { label: 'My balance (ETH)', id: 'My balance', minWidth: 60 },
    { label: 'Pool balance', id: 'Pool balance', minWidth: 60 },
    { label: 'Weight', id: 'Weight', minWidth: 60 },
    { label: 'Lock/Unlock', id: 'lockable', minWidth: 60 }
  ]
  const [selected, setSelected] = React.useState(false)

  const { tokenParams } = props
  const rows = Object.keys(tokenParams).map((token) => {
    const {
 symbol, balance, weight, userBalance
} = tokenParams[token]
    return {
      symbol: symbol || 'ETH',
      address: token,
      balance,
      weight,
      userBalance
    }
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
                    {row.symbol}
                  </TableCell>
                  <TableCell key={`address${row.address}`}>
                    {row.address}
                  </TableCell>
                  <TableCell key={`mybalance${row.address}`}>
                    { row.userBalance ? numberLib.toEther(row.userBalance.toString()) : 0 }
                  </TableCell>
                  <TableCell key={`poolbalance${row.address}`}>
                    {numberLib.toEther(row.balance)}
                  </TableCell>
                  <TableCell key={`wright${row.address}`}>
                    {numberLib.toEther(row.weight)}
                  </TableCell>
                  <TableCell key={`toggl${row.address}`}>
                    <ToggleButton token={row.address} />
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
