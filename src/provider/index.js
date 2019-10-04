import React, { Component } from 'react'

export const Error = React.createContext({
    error: null,
    setError: () => {}
})

export default class HandleError extends Component {
  state = {
    error: null,
    setError: (message) => {
      console.log('we calling it')
      this.setState({
        error: message
      })
    }
  }

  getError = () => {
    return this.state.error
  }

  render() {
    return (
      <Error.Provider value={this.state}>
        {this.props.children}
      </Error.Provider>
    )
  }
}
