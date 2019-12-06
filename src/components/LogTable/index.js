import React from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    width: '100%',
  },
  tableWrapper: {
    overflow: 'auto',
  },
  card: {
    minWidth: 275
  }
})

const columns = [
  { id: 'log', label: 'Log', minWidth: 200 }
]

class LogTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 0,
      rowsPerPage: 0
    }
  }

  generateTableRows(logData) {
    const rows = []

    for (const log of logData) {
      const { caller, decodedValues, decodedSig } = log
      rows.push({
        caller,
        decodedValues,
        decodedSig
      })
    }

    return rows.reverse()
  }

  setPage(value) {
    this.setState({ page: value })
  }

  setRowsPerPage(value) {
    this.setState({ rowsPerPage: value })
  }

  handleChangePage(newPage) {
    this.setPage(newPage)
  }

  handleChangeRowsPerPage(event) {
    this.setRowsPerPage(+event.target.value)
    this.setPage(0)
  }

  render() {
    const { logData, classes } = this.props

    const rows = this.generateTableRows(logData)

    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
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
              {rows.map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    <Card className={classes.card}>
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
        {/*         
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
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        /> */}
      </Paper>
    )
  }
}

export default withStyles(styles)(LogTable)