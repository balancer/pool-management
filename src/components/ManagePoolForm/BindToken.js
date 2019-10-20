import React, { Component } from 'react'
import { Container, Grid, Typography, TextField, Button } from '@material-ui/core'
import * as helpers from 'utils/helpers'
import { formNames } from 'stores/ManageForm'
import { observer, inject } from 'mobx-react'

@inject('root')
@observer
class BindToken extends Component {
    updateProperty(form, key, value) {
        this.props.root.manageFormStore[form][key] = value
    }

    onChange = (event, form) => {
        this.updateProperty(form, event.target.name, event.target.value)
    }

    render() {
        const { manageFormStore, poolStore, utilStore } = this.props.root
        const { poolAddress } = this.props
        const pool = poolStore.poolData[poolAddress]
        const tokenList = pool.whitelistTokens
        const tokenInputData = utilStore.generateTokenDropdownData(tokenList)

        if (helpers.checkIsPropertyEmpty(manageFormStore.bindTokenForm.address)) {
            manageFormStore.bindTokenForm.address = tokenInputData[0].value
        }

        const tokenAddress = manageFormStore.bindTokenForm.address
        const balance = manageFormStore.bindTokenForm.balance
        const weight = manageFormStore.bindTokenForm.weight

        return (
            <div>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={12}>
                        <TextField
                            id="token-poolAddress"
                            label="Token Address"
                            name="address"
                            select
                            fullWidth
                            value={tokenAddress}
                            onChange={e => this.onChange(e, formNames.BIND_TOKEN_FORM)}
                            SelectProps={{
                                native: true
                            }}
                            margin="normal"
                            variant="outlined"
                        >
                            {tokenInputData.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </TextField>
                    </Grid>
                    {/* <Grid item xs={12} sm={4}>
                        <TextField
                            label="Balance"
                            name="balance"
                            type="number"
                            value={balance}
                            onChange={e => this.onChange(e, formNames.BIND_TOKEN_FORM)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}><TextField
                        label="Weight"
                        name="weight"
                        type="number"
                        value={weight}
                        onChange={e => this.onChange(e, formNames.BIND_TOKEN_FORM)}
                    /></Grid> */}
                    <Grid item xs={12} sm={4}>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={() => poolStore.bind(poolAddress, tokenAddress)}
                        >
                            Submit
                  </Button>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default BindToken
