import React from 'react';
import {
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    Grid,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import InvestFormHandler from './InvestFormHandler';
import { methodNames, labels } from 'stores/InvestForm';

const styles = theme => ({
    button: {
        display: 'block',
        marginTop: theme.spacing(2),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
});

@inject('root')
@observer
class InvestForm extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
        };
    }

    handleClose = () => {
        this.setState({ open: false });
    };

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleDropdownChange = event => {
        const { investFormStore } = this.props.root;
        console.log(event.target.value);
        investFormStore.setInvestMethod(event.target.value);
    };

    render() {
        const { poolAddress, classes } = this.props;
        const { poolStore, investFormStore } = this.props.root;
        const { open } = this.state;

        const pool = poolStore.getPool(poolAddress);

        if (!pool || !pool.loadedTokenParams || !pool.loadedParams) {
            return;
        }

        const methods = [
            { label: labels.methods.JOIN_POOL, name: methodNames.JOIN_POOL },
            {
                label: labels.methods.JOINSWAP_EXTERN_AMOUNT_IN,
                name: methodNames.JOINSWAP_EXTERN_AMOUNT_IN,
            },
            {
                label: labels.methods.JOINSWAP_POOL_AMOUNT_OUT,
                name: methodNames.JOINSWAP_POOL_AMOUNT_OUT,
            },
            { label: labels.methods.EXIT_POOL, name: methodNames.EXIT_POOL },
            {
                label: labels.methods.EXITSWAP_POOL_AMOUNT_IN,
                name: methodNames.EXITSWAP_POOL_AMOUNT_IN,
            },
            {
                label: labels.methods.EXITSWAP_EXTERN_AMOUNT_OUT,
                name: methodNames.EXITSWAP_EXTERN_AMOUNT_OUT,
            },
        ];

        const method = investFormStore.investMethod;

        return (
            <Grid container style={{ marginBottom: '50px' }}>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="demo-controlled-open-select">
                        Invest method
                    </InputLabel>
                    <Select
                        open={open}
                        onClose={this.handleClose}
                        onOpen={this.handleOpen}
                        value={method}
                        onChange={this.handleDropdownChange}
                        inputProps={{
                            name: 'method',
                            id: 'method-select',
                        }}
                    >
                        {methods.map((type, index) => {
                            const id = index * 1;
                            return (
                                <MenuItem value={type.name} key={id}>
                                    {type.label}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                <InvestFormHandler poolAddress={poolAddress} />
            </Grid>
        );
    }
}

export default withStyles(styles)(InvestForm);
