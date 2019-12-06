import React from 'react'
import { Grid, TextField, Button } from '@material-ui/core'
import { observer, inject } from 'mobx-react'
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator'
import { validators } from '../validators'
import * as helpers from 'utils/helpers'
import { labels, methodNames, formNames } from 'stores/InvestForm'

@inject('root')
@observer
class InvestFormHandler extends React.Component {

    updateProperty(form, key, value) {
        this.props.root.investFormStore[form][key] = value
    }

    onChange = async (event, form) => {
        this.updateProperty(form, event.target.name, event.target.value)
    }

    setPropertyToMaxUintIfEmpty(value) {
        if (!value || value === 0 || value === '') {
            value = helpers.hexToNumberString(helpers.MAX_UINT)
        }
        return value
    }

    setPropertyToZeroIfEmpty(value) {
        if (!value || value === '') {
            value = '0'
        }
        return value
    }

    onSubmitJoinPool() {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const { inputs } = investFormStore

        poolStore.joinPool(poolAddress, helpers.toWei(inputs.poolOutputAmount))
    }

    onSubmitJoinSwapExternAmountIn() {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const { inputs } = investFormStore

        poolStore.joinswapExternAmountIn(poolAddress, inputs.inputToken, helpers.toWei(inputs.inputAmount))
    }

    onSubmitJoinSwapPoolAmountOut() {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const { inputs } = investFormStore

        poolStore.joinswapPoolAmountOut(poolAddress, inputs.inputToken, helpers.toWei(inputs.poolOutputAmount))
    }

    onSubmitExitPool() {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const { inputs } = investFormStore

        poolStore.exitPool(poolAddress, helpers.toWei(inputs.poolInputAmount))

    }

    onSubmitdExitSwapPoolAmountIn() {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const { inputs } = investFormStore

        poolStore.exitswapPoolAmountIn(poolAddress, inputs.outputToken, helpers.toWei(inputs.poolInputAmount))
    }

    onSubmitExitSwapExternAmountOut() {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const { inputs } = investFormStore

        poolStore.exitswapExternAmountOut(poolAddress, inputs.outputToken, helpers.toWei(inputs.outputAmount))
    }

    buildTokenFormData(tokenList) {
        const { investFormStore, utilStore } = this.props.root
        const tokenData = utilStore.generateTokenDropdownData(tokenList)

        if (helpers.checkIsPropertyEmpty(investFormStore.inputs.inputToken)) {
            investFormStore.inputs.inputToken = tokenData[0].value
        }

        if (helpers.checkIsPropertyEmpty(investFormStore.inputs.outputToken)) {
            investFormStore.inputs.outputToken = tokenData[0].value
        }

        return tokenData
    }

    buildJoinPoolForm = () => {
        const { investFormStore } = this.props.root
        const { inputs } = investFormStore

        return (
            <div>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={12}>
                        <ValidatorForm
                            ref="form"
                            onSubmit={() => { this.onSubmitJoinPool() }}
                            onError={errors => console.log(errors)}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={3} >
                                    <TextValidator
                                        id="amount-in"
                                        name="poolOutputAmount"
                                        label={labels.inputs.POOL_OUTPUT_AMOUNT}
                                        value={inputs.poolOutputAmount}
                                        onChange={e => this.onChange(e, formNames.INPUT_FORM)}
                                        type="number"
                                        InputLabelProps={{
                                            shrink: true
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                        validators={validators.requiredTokenValueValidators}
                                        errorMessages={validators.requiredTokenValueValidatorErrors}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        style={{ marginTop: 25 }}>
                                        Submit
                                </Button>
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                    </Grid>
                </Grid>
            </div>

        )
    }

    buildJoinSwapExternAmountInForm = () => {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const { inputs } = investFormStore

        const pool = poolStore.getPool(poolAddress)
        const tokenList = pool.tokenList
        const tokens = this.buildTokenFormData(tokenList)

        return (
            <div>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={12}>
                        <ValidatorForm
                            ref="form"
                            onSubmit={() => { this.onSubmitJoinSwapExternAmountIn() }}
                            onError={errors => console.log(errors)}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        id="token-in"
                                        name="inputToken"
                                        select
                                        label={labels.inputs.INPUT_TOKEN}
                                        value={inputs.inputToken}
                                        onChange={e => this.onChange(e, formNames.INPUT_FORM)}
                                        SelectProps={{
                                            native: true
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                    >
                                        {tokens.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextValidator
                                        id="amount-out"
                                        name="inputAmount"
                                        label={labels.inputs.TOKEN_INPUT_AMOUNT}
                                        value={inputs.inputAmount}
                                        onChange={e => this.onChange(e, formNames.INPUT_FORM)}
                                        type="number"
                                        InputLabelProps={{
                                            shrink: true
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                        validators={validators.requiredTokenValueValidators}
                                        errorMessages={validators.requiredTokenValueValidatorErrors}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        style={{ marginTop: 25 }}>
                                        Submit
                            </Button>
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                    </Grid>
                </Grid>
            </div >
        )
    }

    buildJoinSwapPoolAmountOutForm = () => {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const { inputs } = investFormStore

        const pool = poolStore.getPool(poolAddress)
        const tokenList = pool.tokenList
        const tokens = this.buildTokenFormData(tokenList)

        return (
            <div>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={12}>
                        <ValidatorForm
                            ref="form"
                            onSubmit={() => { this.onSubmitJoinSwapPoolAmountOut() }}
                            onError={errors => console.log(errors)}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        id="token-in"
                                        name="inputToken"
                                        select
                                        label={labels.inputs.INPUT_TOKEN}
                                        value={inputs.inputToken}
                                        onChange={e => this.onChange(e, formNames.INPUT_FORM)}
                                        SelectProps={{
                                            native: true
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                    >
                                        {tokens.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextValidator
                                        id="limit-in"
                                        name="poolOutputAmount"
                                        label={labels.inputs.POOL_OUTPUT_AMOUNT}
                                        value={inputs.poolOutputAmount}
                                        onChange={e => this.onChange(e, formNames.INPUT_FORM)}
                                        type="number"
                                        InputLabelProps={{
                                            shrink: true
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                        validators={validators.requiredTokenValueValidators}
                                        errorMessages={validators.requiredTokenValueValidatorErrors}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        style={{ marginTop: 25 }}>
                                        Submit
                                    </Button>
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                    </Grid>
                </Grid>
            </div>
        )
    }

    buildExitPoolForm = () => {
        const { investFormStore } = this.props.root
        const { inputs } = investFormStore

        return (
            <div>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={12}>
                        <ValidatorForm
                            ref="form"
                            onSubmit={() => { this.onSubmitExitPool() }}
                            onError={errors => console.log(errors)}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={3}>
                                    <TextValidator
                                        id="limit-price"
                                        name="poolInputAmount"
                                        label={labels.inputs.POOL_INPUT_AMOUNT}
                                        value={inputs.poolInputAmount}
                                        onChange={e => this.onChange(e, formNames.INPUT_FORM)}
                                        type="number"
                                        InputLabelProps={{
                                            shrink: true
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                        validators={validators.requiredTokenValueValidators}
                                        errorMessages={validators.requiredTokenValueValidatorErrors}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        style={{ marginTop: 25 }}>
                                        Submit
                                </Button>
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                    </Grid>
                </Grid>
            </div>

        )
    }

    buildExitSwapPoolAmountInForm = () => {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const { inputs } = investFormStore

        const pool = poolStore.getPool(poolAddress)
        const tokenList = pool.tokenList
        const tokens = this.buildTokenFormData(tokenList)

        return (
            <div>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={12}>
                        <ValidatorForm
                            ref="form"
                            onSubmit={() => { this.onSubmitdExitSwapPoolAmountIn() }}
                            onError={errors => console.log(errors)}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        id="token-out"
                                        name="outputToken"
                                        select
                                        fullWidth
                                        label={labels.inputs.OUTPUT_TOKEN}
                                        value={inputs.outputToken}
                                        onChange={e => this.onChange(e, formNames.INPUT_FORM)}
                                        SelectProps={{
                                            native: true
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                    >
                                        {tokens.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextValidator
                                        id="limit-in"
                                        name="poolInputAmount"
                                        label={labels.inputs.POOL_INPUT_AMOUNT}
                                        value={inputs.poolInputAmount}
                                        onChange={e => this.onChange(e, formNames.INPUT_FORM)}
                                        type="number"
                                        InputLabelProps={{
                                            shrink: true
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                        validators={validators.requiredTokenValueValidators}
                                        errorMessages={validators.requiredTokenValueValidatorErrors}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        style={{ marginTop: 25 }}>
                                        Submit
                                    </Button>
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                    </Grid>
                </Grid>
            </div >
        )
    }

    buildExitSwapExternAmountOutForm = () => {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const { inputs } = investFormStore

        const pool = poolStore.getPool(poolAddress)
        const tokenList = pool.tokenList
        const tokens = this.buildTokenFormData(tokenList)

        return (
            <div>
                <Grid container spacing={1}>
                    <Grid item xs={12} sm={12}>
                        <ValidatorForm
                            ref="form"
                            onSubmit={() => { this.onSubmitExitSwapExternAmountOut() }}
                            onError={errors => console.log(errors)}
                        >
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        id="token-out"
                                        name="outputToken"
                                        select
                                        fullWidth
                                        label={labels.inputs.OUTPUT_TOKEN}
                                        value={inputs.outputToken}
                                        onChange={e => this.onChange(e, formNames.INPUT_FORM)}
                                        SelectProps={{
                                            native: true
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                    >
                                        {tokens.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextValidator
                                        id="output-amount"
                                        name="outputAmount"
                                        label={labels.inputs.TOKEN_OUTPUT_AMOUNT}
                                        value={inputs.outputAmount}
                                        onChange={e => this.onChange(e, formNames.INPUT_FORM)}
                                        type="number"
                                        InputLabelProps={{
                                            shrink: true
                                        }}
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                        validators={validators.requiredTokenValueValidators}
                                        errorMessages={validators.requiredTokenValueValidatorErrors}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        style={{ marginTop: 25 }}>
                                        Submit
                                    </Button>
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                    </Grid>
                </Grid>
            </div>
        )
    }

    checkMethod() {
        const { poolAddress } = this.props
        const { poolStore, investFormStore } = this.props.root
        const pool = poolStore.poolData[poolAddress]

        if (!pool || !pool.loadedTokenParams || !pool.loadedParams) {
            return <div></div>
        }

        const method = investFormStore.investMethod
        // debugger
        if (method === methodNames.JOIN_POOL) {
            return this.buildJoinPoolForm()
        } else if (method === methodNames.JOINSWAP_EXTERN_AMOUNT_IN) {
            return this.buildJoinSwapExternAmountInForm()
        } else if (method === methodNames.JOINSWAP_POOL_AMOUNT_OUT) {
            return this.buildJoinSwapPoolAmountOutForm()
        } else if (method === methodNames.EXIT_POOL) {
            return this.buildExitPoolForm()
        } else if (method === methodNames.EXITSWAP_POOL_AMOUNT_IN) {
            return this.buildExitSwapPoolAmountInForm()
        } else if (method === methodNames.EXITSWAP_EXTERN_AMOUNT_OUT) {
            return this.buildExitSwapExternAmountOutForm()
        }
    }

    render() {
        return (
            <Grid container>
                <Grid item xs={12}>
                    {this.checkMethod()}
                </Grid>
            </Grid>
        )
    }
}

export default InvestFormHandler
