import React, { Component } from 'react'
import {
  Container, Grid,
  FormControl,
  Select, MenuItem, InputLabel,
  TextField
} from '@material-ui/core'

import { PoolListTokenTable, Button, Loading, PoolParamsGrid } from 'components'
import {
  joinPool, joinswapExternAmountIn, joinswapPoolAmountOut,
  exitPool, exitswapPoolAmountIn, exitswapExternAmountOut
} from 'components/PoolInvestForm/calls'
import { providerService, bFactoryService, bPoolService } from 'core/services'

import { appConfig } from 'configs'
import { formConfig } from './config'

class PoolInvestView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      factoryAddress: appConfig.factory,
      knownPools: {},
      poolsLoaded: false,
      formConfig: formConfig.joinPool,
      selectedAction: 'joinPool',
      tokenAddress: 'Token Address1',
      tokenAmount: '0',
      pool: {
        poolParams: {},
        tokenParams: {},
        pendingTx: false,
        txError: null,
        loadedParams: false,
        loadedTokenParams: false
      }
    }
  }

  async componentWillMount() {
    const { factoryAddress } = this.state
    const { address } = this.props.match.params
    const provider = await providerService.getProvider()
    console.log(provider)
    const { defaultAccount } = provider.web3Provider.eth
    const poolData = await bFactoryService.getKnownPools(provider, factoryAddress, {
      caller: defaultAccount,
      fromBlock: 0,
      toBlock: 'latest'
    })
    this.setState({
      knownPools: poolData.knownPools,
      poolsLoaded: true,
      provider,
      address
    })
    await this.getParams()
    await this.getTokenParams()
  }

  async getTokenParams() {
    const { address, provider, pool } = this.state
    const tokenData = await bPoolService.getTokenParams(provider, address)

    this.setState({
      pool: {
        ...pool,
        loadedTokenParams: true,
        tokenParams: tokenData.data
      }
    })
  }

  async getParams() {
    const { address, provider, pool } = this.state
    const poolData = await bPoolService.getParams(provider, address)
    this.setState({
      pool: {
        ...pool,
        loadedParams: true,
        poolParams: poolData.data
      }
    })
  }

  render() {
    const {
      selectedAction, tokenAddress, tokenAmount, pool, address, provider
    } = this.state

    const tokens = Object.keys(pool.tokenParams).map((value) => {
      return { address: value }
    })

    const config = formConfig
    const handleFormConfigChange = (event) => {
      const action = event.target.value
      this.setState({
        formConfig: config[event.target.value],
        selectedAction: action,
        tokenAddress: 'Token Address1',
        tokenAmount: '0'
      })
    }
    const handleTokenAmountChange = (event) => {
      if (event.target.value !== '') {
        const amount = event.target.value
        this.setState({ tokenAmount: amount })
      } else {
        this.setState({ tokenAmount: '' })
      }
    }
    const handleTokenAddressSelect = (event) => {
      this.setState({ tokenAddress: event.target.value })
    }
    const buttonText = () => {
      if (this.state.selectedAction.slice(0, 4) === 'join') {
        return 'Invest'
      }
        return 'Redeem'
    }
    const handleSubmit = (event) => {
      // All this code will be refactored
      event.preventDefault()
      const data = {
        provider,
        address,
        tokenAmount,
        tokenAddress
      }
      // this logic will be moved to a component.
      switch (selectedAction) {
        case 'joinPool':
          return joinPool(data)
        case 'joinswap_ExternAmountIn':
          return joinswapExternAmountIn(data)
        case 'joinswap_PoolAmountOut':
          return joinswapPoolAmountOut(data)
        case 'exitPool':
          return exitPool(data)
        case 'exitswap_PoolAmountIn':
          return exitswapPoolAmountIn(data)
        case 'exitswap_ExternAmountOut':
          return exitswapExternAmountOut(data)
        default:
          return null
      }
    }

    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <PoolParamsGrid address={address} pool={pool} />
          </Grid>
          <Grid item xs={12}>
            {
              pool.loadedTokenParams ? (<PoolListTokenTable tokenParams={pool.tokenParams} address={address} provider={provider} linkPath="logs" />) :
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Loading />
              </div>
            }
          </Grid>
          <Grid item xs={12}>
            <FormControl style={{ margin: 10, minWidth: 120 }}>
              <InputLabel htmlFor="action-type">Invest/Devest</InputLabel>
              <Select
                value={selectedAction}
                onChange={handleFormConfigChange}
                displayEmpty
                inputProps={{
                    name: 'actionType',
                    id: 'action-type'
                  }}
              >
                <MenuItem value="joinPool">Join Pool</MenuItem>
                <MenuItem value="joinswap_ExternAmountIn">Join Swap</MenuItem>
                <MenuItem value="joinswap_PoolAmountOut">Join Swap Pool</MenuItem>
                <MenuItem value="exitPool">Exit Pool</MenuItem>
                <MenuItem value="exitswap_PoolAmountIn">Exit Swap Pool</MenuItem>
                <MenuItem value="exitswap_ExternAmountOut">Exit Swap</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} style={{ marginBottom: '100px' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    {
                      this.state.formConfig.inputs.map((input, index) => {
                        const id = index * 1
                        switch (input.type) {
                          case 'number':
                            return (
                              <Grid item xs={12} sm={9}>

                                <TextField
                                  label={input.label}
                                  placeholder="0"
                                  value={tokenAmount}
                                  onChange={handleTokenAmountChange}
                                  type="number"
                                  InputLabelProps={{
                                      shrink: true
                                    }}
                                  margin="normal"
                                  variant="outlined"
                                  fullWidth
                                />
                              </Grid>
                            )
                            // break
                          case 'select':
                            return (
                              <Grid item xs={12} sm={9}>
                                <TextField
                                  select
                                  fullWidth
                                  label="Select a Token"
                                  value={tokenAddress}
                                  onChange={handleTokenAddressSelect}
                                  SelectProps={{
                                    native: true
                                  }}
                                  margin="normal"
                                  variant="outlined"
                                >
                                  {tokens.map(option => (
                                    <option key={option.address} value={option.address}>
                                      {option.address}
                                    </option>
                                  ))}
                                </TextField>
                              </Grid>
                            )
                            // break
                          default:
                          return null
                        }
                      })
                    }
                    <Grid item xs={12} sm={3}>
                      <Button
                        type="submit"
                        variant="contained"
                        style={{ marginTop: 25 }}
                      >
                        { buttonText() }
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default PoolInvestView
