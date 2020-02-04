import React, { Component } from 'react';
import { Grid, Button } from '@material-ui/core';
import * as helpers from 'utils/helpers';
import { formNames } from 'stores/ManageForm';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { observer, inject } from 'mobx-react';
import { validators } from 'components/validators';

@inject('root')
@observer
class SetFees extends Component<any, any> {
    updateProperty(form, key, value) {
        this.props.root.manageFormStore[form][key] = value;
    }

    onChange = (event, form) => {
        console.log(event.target);
        console.log(form);
        this.updateProperty(form, event.target.name, event.target.value);
    };

    render() {
        const { manageFormStore, poolStore } = this.props.root;
        const { poolAddress } = this.props;

        const swapFee = manageFormStore.setFeeForm.swapFee;

        return (
            <ValidatorForm
                ref="form"
                onSubmit={() => {
                    poolStore.setSwapFee(
                        poolAddress,
                        helpers.fromPercentageToFee(swapFee)
                    );
                }}
                onError={errors => console.log(errors)}
            >
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <TextValidator
                            id="swap-fee-amount"
                            label="Swap Fee"
                            type="number"
                            name="swapFee"
                            value={swapFee}
                            onChange={e =>
                                this.onChange(e, formNames.SET_FEE_FORM)
                            }
                            fullWidth
                            validators={validators.requiredTokenValueValidators}
                            errorMessages={
                                validators.requiredTokenValueValidatorErrors
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button type="submit" variant="contained">
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </ValidatorForm>
        );
    }
}

export default SetFees;
