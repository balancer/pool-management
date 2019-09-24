import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Link } from 'react-router-dom'
import AppBar from 'components/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'

import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AccountCircle from '@material-ui/icons/AccountCircle'
import AccountBalance from '@material-ui/icons/AccountBalance'
import SwapHoriz from '@material-ui/icons/SwapHoriz'
import { appConfig } from 'configs/config-main'
import { styles } from './styles.scss'

class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: null
    }
  }

  getMenu() {
    const { anchorEl } = this.state

    return (
      <div>
        <IconButton
          aria-haspopup="true"
          color="inherit"
          className="dropdown"
          aria-owns={anchorEl ? 'simple-menu' : null}
          onClick={this.handleClick}
        >
          <AccountCircle />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.close}
        >
          <MenuItem data-link="account" onClick={this.goTo}>Menu Option 1</MenuItem>
          <MenuItem data-link="settings" onClick={this.goTo}>Menu Option 2</MenuItem>
        </Menu>
      </div>
    )
  }

  goTo = (evt) => {
    const { history } = this.props
    const { link } = evt.currentTarget.dataset

    history.push(link)
    this.close()
  }

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  close = () => {
    this.setState({ anchorEl: null })
  }

  render() {
    const menu = this.getMenu()

    return (
      <div className={styles}>
        <AppBar>
          <Toolbar>
            <Link href="/list/" to="/list/">
              <IconButton edge="start" color="inherit" aria-label="menu">
                {/* <img src="src/assets/pngs/balancer_logo.png" /> */}
                <Typography variant="title" color="inherit">
                  {appConfig.name}
                </Typography>
              </IconButton>
            </Link>
            <IconButton color="inherit" aria-label="menu">
              <SwapHoriz />
              <Typography variant="title" color="inherit">
                Swap
              </Typography>
            </IconButton>
            <IconButton color="inherit" aria-label="menu">
              <AccountBalance />
              <Typography variant="title" color="inherit">
                Manage
              </Typography>
            </IconButton>
            {menu}
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

Header.propTypes = {
  history: PropTypes.shape({}).isRequired
}

export default withRouter(Header)
