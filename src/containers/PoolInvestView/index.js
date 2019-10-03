import React, { Component } from 'react'
import {
  Container, Grid,
  Card, CardContent,
  Typography, FormControl,
  Select, MenuItem, InputLabel,
  TextField
} from '@material-ui/core'

import { PoolInvestListTable, Button, Loading } from 'components'
import { providerService, bFactoryService, bPoolService } from 'core/services'
import { numberLib } from 'core/libs'

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
      tokenAmount: 0,
      pool: {
        poolParams: {},
        tokenParams: {},
        pendingTx: false,
        txError: null,
        loadedParams: false,
        loadedTokenParams: false
      },
      poolBalance: 0
    }
  }

  async componentWillMount() {
    const { factoryAddress } = this.state
    const { address } = this.props.match.params
    const provider = await providerService.getProvider()
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
    const poolBalance = Object.keys(tokenData.data).map((token) => {
      return +tokenData.data[token].balance
    }).reduce((a, b) => a + b, 0)

    this.setState({
      pool: {
        ...pool,
        loadedTokenParams: true,
        tokenParams: tokenData.data
      },
      poolBalance
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
      selectedAction, tokenAddress, tokenAmount, pool, address, poolBalance
    } = this.state
    const config = formConfig
    const handleFormConfigChange = (event) => {
      const action = event.target.value
      this.setState({
        formConfig: config[event.target.value],
        selectedAction: action,
        tokenAddress: 'Token Address1',
        tokenAmount: 0
      })
    }
    const handleTokenAmountChange = (event) => {
      if (event.target.value !== '') {
        const amount = Number(event.target.value)
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
    const handleSubmit = () => {
      // Send Data somewhere!
    }

    const active = !pool.poolParams.isPaused ? 'Yes' : 'No'
    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                Pool Card Address: { address || '' }
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                Active? { active }
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                My Pool Token Balance: { numberLib.toEther(poolBalance.toString()) }
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            {
              pool.loadedTokenParams ? (<PoolInvestListTable tokenParams={pool.tokenParams} linkPath="logs" />) :
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Loading />
              </div>
            }
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
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
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={12} style={{ marginBottom: '100px' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">{ this.state.formConfig.actionLabel }</Typography>
                <Container>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                      {
                        this.state.formConfig.inputs.map((input, index) => {
                          const id = index * 1
                          switch (input.type) {
                            case 'number':
                              return (
                                <Grid item xs={12} sm={8}>

                                  <TextField
                                    required
                                    value={tokenAmount}
                                    key={id}
                                    label={input.label}
                                    type="number"
                                    onChange={handleTokenAmountChange}
                                  />
                                </Grid>
                              )
                              // break
                            case 'select':
                              return (
                                <Grid item xs={12} sm={8}>
                                  <FormControl key={id}>
                                    <InputLabel htmlFor="token">Select a Token</InputLabel>
                                    <Select
                                      value={tokenAddress}
                                      onChange={handleTokenAddressSelect}
                                      inputProps={{
                                        name: 'token',
                                        id: 'token'
                                      }}
                                      displayEmpty
                                    >
                                      {
                                      input.options.map((option) => {
                                        return (
                                          <MenuItem key={id} value={option.address}>
                                            { option.address }
                                          </MenuItem>
                                        )
                                      })
                                    }
                                    </Select>
                                  </FormControl>
                                </Grid>
                              )
                              // break
                            default:
                            return null
                          }
                        })
                      }
                      <Grid item xs={12} sm={4}>
                        <Button
                          type="submit"
                          variant="contained"
                        >
                          { buttonText() }
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Container>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    )
  }
}

export default PoolInvestView
