import React, { Component } from 'react';
import { Grid, TextField, Button } from '@material-ui/core';
import * as helpers from 'utils/helpers';
import * as deployed from 'deployed.json';
import { formNames } from 'stores/ManageForm';
import { observer, inject } from 'mobx-react';

@inject('root')
@observer
class RebindToken extends Component<any, any> {
    updateProperty(form, key, value) {
        this.props.root.manageFormStore[form][key] = value;
    }

    onChange = (event, form) => {
        console.log(event.target);
        console.log(form);
        this.updateProperty(form, event.target.name, event.target.value);
    };

    render() {
        const { manageFormStore, poolStore, utilStore } = this.props.root;
        const { poolAddress } = this.props;

        // TODO: fix hardcoded network
        const tokenList = deployed['kovan'].tokens;

        const tokenInputData = utilStore.generateAllTokenDropdownData(
            tokenList
        );

        if (
            helpers.checkIsPropertyEmpty(
                manageFormStore.setTokenParamsForm.address
            )
        ) {
            manageFormStore.setTokenParamsForm.address =
                tokenInputData[0].value;
        }

        const tokenAddress = manageFormStore.setTokenParamsForm.address;
        const balance = manageFormStore.setTokenParamsForm.balance;
        const weight = manageFormStore.setTokenParamsForm.weight;

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
                            onChange={e =>
                                this.onChange(
                                    e,
                                    formNames.SET_TOKEN_PARAMS_FORM
                                )
                            }
                            SelectProps={{
                                native: true,
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
                    <Grid item xs={12} sm={4}>
                        <TextField
                            id="token-poolAddress"
                            label="Balance"
                            name="balance"
                            type="number"
                            value={balance}
                            onChange={e =>
                                this.onChange(
                                    e,
                                    formNames.SET_TOKEN_PARAMS_FORM
                                )
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            id="token-poolAddress"
                            label="Weight"
                            name="weight"
                            type="number"
                            value={weight}
                            onChange={e =>
                                this.onChange(
                                    e,
                                    formNames.SET_TOKEN_PARAMS_FORM
                                )
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={() =>
                                poolStore.rebind(
                                    poolAddress,
                                    tokenAddress,
                                    helpers.toWei(balance),
                                    helpers.toWei(weight)
                                )
                            }
                        >
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default RebindToken;
