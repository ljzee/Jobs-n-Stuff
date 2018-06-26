import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { AUTH_TOKEN } from '../constants'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import '../styles/Login.css';

class Login extends Component {
  state = {
    email: '',
    password: '',
  }

  render() {
    return (
      <div className="Login">
        <form onSubmit={this._handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this._handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              type="password"
              value={this.state.password}
              onChange={this._handleChange}
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={!this._validateForm()}
            type="submit"
          >
            Login
          </Button>
        </form>
      </div>
    )
  }

  _validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  _handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  _handleSubmit = async (event) => {
    event.preventDefault()
    const { email, password } = this.state
    const result = await this.props.loginMutation({
      variables: {
        email,
        password,
      },
    })
    const { token } = result.data.login
    this._saveUserData(token)
    this.props.history.push(`/dashboard`)
  }

  _saveUserData = token => {
    localStorage.setItem(AUTH_TOKEN, token)
  }
}

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`

export default compose(
  graphql(LOGIN_MUTATION, { name: 'loginMutation' }),
)(Login)
