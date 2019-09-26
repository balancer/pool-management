import React from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { styles } from './styles.scss'

const columns = [
  { id: 'log', label: 'Log', minWidth: 200 }
]

export default function TokenParametersTable(props) {
  const {
    logData
  } = props

  const rows = []

  // eslint-disable-next-line no-restricted-syntax
  for (const log of logData) {
    const { caller, decodedValues, decodedSig } = log
    rows.push({
      caller,
      decodedValues,
      decodedSig
    })
  }

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

  function handleChangePage(newPage) {
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
              {columns.map(column => (
                <TableCell
                  key={column.id}
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
                <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                  <Card className={styles.card}>
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        {`caller: ${row.caller}`}
                      </Typography>
                      <Typography variant="body2" component="p">
                        {`signature: ${row.decodedSig}`}
                      </Typography>
                      <Typography variant="body2" component="p">
                        {`values: ${row.decodedValues}`}
                      </Typography>
                    </CardContent>
                    {/* <CardActions>
                      <Button size="small">Learn More</Button>
                    </CardActions> */}
                  </Card>
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
