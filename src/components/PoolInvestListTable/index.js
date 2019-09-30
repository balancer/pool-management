import React from 'react'
import { Link } from 'react-router-dom'
import {
  Paper,
  Table, TableBody,
  TableCell, TableHead,
  TablePagination, TableRow
} from '@material-ui/core'

import { Button } from 'components'
import { numberLib } from 'core/libs'
import { styles } from './styles.scss'

const columns = [
  { id: 'symbol', label: 'Symbol', minWidth: 10 },
  { id: 'address', label: 'Address', minWidth: 200 },
  { id: 'myBalance', label: 'My Balance', minWidth: 10 },
  { id: 'poolBalance', label: 'Pool Balance', minWidth: 10 },
  { id: 'weight', label: 'Weight', minWidth: 10 },
  { id: 'lockUnlock', label: 'Lock/Unlock', minWidth: 10 }
]

export default function PoolInvestListTable(props) {
  const {
    poolData,
    linkPath
  } = props

  const rows = []

  Object.keys(poolData).forEach((key) => {
    const address = key
    const { manager } = poolData[key]

    rows.push({
      address,
      manager
    })
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
      <div className={styles.tableWrapper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {
                columns.map(column => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {
              rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    <TableCell key={0}>
                      <Link href={`/${linkPath}/${row.address}`} to={`/${linkPath}/${row.address}`}>{row.address}</Link>
                    </TableCell>
                    <TableCell key={1}>
                      {row.manager}
                    </TableCell>
                  </TableRow>
                )
              })
            }
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
