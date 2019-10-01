import React from 'react'
import { Link } from 'react-router-dom'
import { TablePagination, ButtonGroup, makeStyles, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'
import Button from '../Button'


const columns = [
  { id: 'address', label: 'Address', minWidth: 40 },
  { id: 'manager', label: 'Manager', minWidth: 40 },
  { id: 'buttons', label: '', minWidth: 50 }
]

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%'
  },
  table: {
    minWidth: 650,
    overflowX: 'auto'
  },
  address: {
    width: '70%'
  }
}))

export default function TokenParametersTable(props) {
  const {
    poolData,
    linkPath
  } = props
  const classes = useStyles()

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
    <Paper className={classes.root}>
      <div className={classes.table}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={`header${column.id}`}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <TableRow hover tabIndex={-1} key={row.address}>
                  <TableCell key={`cel${row.address}`}>
                    <Link href={`/${linkPath}/${row.address}`} to={`/${linkPath}/${row.address}`}>{row.address}</Link>
                  </TableCell>
                  <TableCell key={`manager${row.address}`}>
                    {row.manager}
                  </TableCell>
                  <TableCell key={`buttons${row.address}`}>
                    <ButtonGroup size="small" aria-label="small outlined button group">
                      <Button key={`swap${row.address}`} component={Link} to={`/swap/${row.address}`}>
                      Swap
                      </Button>
                      <Button key={`invest${row.address}`} component={Link} to={`/invest/${row.address}`}>
                      Invest
                      </Button>
                      <Button key={`manage${row.address}`} component={Link} to={`/manage/${row.address}`}>
                      Manage
                      </Button>
                    </ButtonGroup>
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
