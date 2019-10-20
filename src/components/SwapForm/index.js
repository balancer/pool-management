import React from 'react'
import { InputLabel, MenuItem, FormControl, Select, Grid } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import SwapFormHandler from './SwapFormHandler'
import { methodNames, labels } from 'stores/SwapForm'

const styles = theme => ({
    button: {
        display: 'block',
        marginTop: theme.spacing(2)
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    }
})

@inject('root')
@observer
class SwapForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            method: 'exactAmountIn',
            open: false
        }
    }

    handleClose = () => {
        this.setState({ open: false })
    }

    handleOpen = () => {
        this.setState({ open: true })
    }

    handleDropdownChange = (event) => {
        console.log(event.target.value)
        const { swapFormStore } = this.props.root
        swapFormStore.setSwapMethod(event.target.value)
        this.setState({ method: event.target.value })
    }

    render() {
        const { poolAddress, classes } = this.props
        const { poolStore, tokenStore, swapFormStore } = this.props.root
        const { open, method } = this.state

        const pool = poolStore.getPool(poolAddress)

        if (!pool || !pool.loadedTokenParams || !pool.loadedParams) {
            return
        }

        const methods = [
            { label: labels.methods.EXACT_AMOUNT_IN, name: methodNames.EXACT_AMOUNT_IN },
            { label: labels.methods.EXACT_AMOUNT_OUT, name: methodNames.EXACT_AMOUNT_OUT },
            { label: labels.methods.EXACT_MARGINAL_PRICE, name: methodNames.EXACT_MARGINAL_PRICE }
        ]
        return (
            <Grid container style={{ marginBottom: '50px' }}>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="demo-controlled-open-select">Swap method</InputLabel>
                    <Select
                        open={open}
                        onClose={this.handleClose}
                        onOpen={this.handleOpen}
                        value={method}
                        onChange={this.handleDropdownChange}
                        inputProps={{
                            name: 'method',
                            id: 'demo-controlled-open-select'
                        }}
                    >
                        {
                            methods.map((type, index) => {
                                const id = index * 1
                                return (
                                    <MenuItem value={type.name} key={id}>
                                        {type.label}
                                    </MenuItem>
                                )
                            })
                        }
                    </Select>
                </FormControl>
                <SwapFormHandler poolAddress={poolAddress} />
            </Grid>
        )
    }
}

export default withStyles(styles)(SwapForm)