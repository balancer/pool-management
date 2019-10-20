import React, { Component } from 'react'
import { Grid, TextField, Button } from '@material-ui/core'
import * as helpers from 'utils/helpers'
import { formNames } from 'stores/ManageForm'
import { observer, inject } from 'mobx-react'

@inject('root')
@observer
class MakeShared extends Component {
    updateProperty(form, key, value) {
        this.props.root.manageFormStore[form][key] = value
    }

    onChange = (event, form) => {
        this.updateProperty(form, event.target.name, event.target.value)
    }

    render() {
        const { manageFormStore, poolStore } = this.props.root
        const { poolAddress } = this.props

        const initialSupply = manageFormStore.makeSharedForm.initialSupply

        return (
            <div>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            id="fee-amount"
                            label="Initial Pool Token Supply"
                            type="number"
                            name="initialSupply"
                            value={initialSupply}
                            onChange={e => this.onChange(e, formNames.MAKE_SHARED_FORM)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={() => poolStore.finalize(poolAddress, helpers.toWei(initialSupply))}>Submit
                </Button>
                    </Grid>
                </Grid>
            </div>)
    }

}

export default MakeShared
