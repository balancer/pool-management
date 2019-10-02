import React, { Component } from 'react'
import {
  Container, Grid,
  Card, CardContent,
  Typography, FormControl,
  Select, MenuItem, InputLabel,
  TextField
} from '@material-ui/core'

import { PoolInvestListTable, Button } from 'components'
import { providerService, bFactoryService } from 'core/services'
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
      tokenAmount: 0
    }
  }

  async componentWillMount() {
    const { factoryAddress } = this.state
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
      provider
    })
  }

  render() {
    const {
      knownPools, poolsLoaded, selectedAction, tokenAddress, tokenAmount
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
    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                Pool Card Address: { '0x5Db06acd673531218B10430bA6dE9b69913Ad545' }
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                Active Card
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                My Pool Token Balance: { '1000' }
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            {
              poolsLoaded ? (<PoolInvestListTable linkPath="logs" poolData={knownPools} />) : (<div />)
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
          <Grid item xs={12} sm={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" component="h5">{ this.state.formConfig.actionLabel }</Typography>
                <Container>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      {
                        this.state.formConfig.inputs.map((input, index) => {
                          const id = index * 1
                          switch (input.type) {
                            case 'number':
                              return (
                                <Grid item xs={12} sm={12}>

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
                                <Grid item xs={12} sm={12}>
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
