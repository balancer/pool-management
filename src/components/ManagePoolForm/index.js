import React, { Component } from 'react'
import { Grid, Typography } from '@material-ui/core'
import { observer, inject } from 'mobx-react'
import BindToken from './BindToken'
import RebindToken from './RebindToken'
import SetFees from './SetFees'
import MakeShared from './MakeShared'

@inject('root')
@observer
class ManagePoolForm extends Component {
    updateProperty(form, key, value) {
        this.props.root.manageFormStore[form][key] = value
    }

    onChange = (event, form) => {
        console.log(event.target)
        console.log(form)
        this.updateProperty(form, event.target.name, event.target.value)
    }

    render() {
        const { poolAddress } = this.props
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">Bind Token</Typography>
                    <br />
                    <BindToken poolAddress={poolAddress}></BindToken>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">Rebind Token</Typography>
                    <br />
                    <RebindToken poolAddress={poolAddress}></RebindToken>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">Set Fees (%)</Typography>
                    <br />
                    <SetFees poolAddress={poolAddress}></SetFees>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">Make Shared</Typography>
                    <br />
                    <MakeShared poolAddress={poolAddress}></MakeShared>
                </Grid>
            </Grid>
        )
    }
}

export default ManagePoolForm
