import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { AUTH_TOKEN, INVALID_USERNAME_OR_PASSWORD } from '../constants';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/Login.css';

class Login extends React.Component {

  state = {
    username: {value: '', isValid: true, message: '', validState: null},
    password: {value: '', isValid: true, message: '', validState: null},
    summary: ''
  }

  handleChange = (e) => {
    var state = this.state;
    state[e.target.id].value = e.target.value;

    this.setState(state);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    var state = this.state;
    const username = state.username.value;
    const password = state.password.value;
    var invalid_re = new RegExp("Invalid username or password$");

    if (this.formIsValid()) {
      try {
        const result = await this.props.loginMutation({
          variables: {
            username,
            password,
          },
        });
        const { token } = result.data.login;
        this.saveUserData(token);
        this.props.history.push(`/dashboard`);
      } catch (Error) {
        if (invalid_re.test(Error.message)) {
          state.summary = 'Incorrect email or password';
          this.resetValidationStates();
          this.setState(state);
        } else {
          throw Error;
        }
      }
    }
  }

  formIsValid = () => {
    var state = this.state;
    var isFormValid = true;

    if (state.username.value === '') {
      state.username.isValid = false;
      state.username.message = 'Please enter your username';
      state.username.validState = "error";

      this.setState(state);
      isFormValid = false;
    }

    if (state.password.value === '') {
      state.password.isValid = false;
      state.password.message = 'Please enter your password';
      state.password.validState = "error"

      this.setState(state);
      isFormValid = false;
    }

    return isFormValid;
  }

  resetValidationStates = () => {
    var state = this.state;

    Object.keys(state).map(key => {
      if (state[key].hasOwnProperty('isValid')) {
        state[key].isValid = true;
        state[key].message = '';
        state[key].validState = null;
      }
    });
    this.setState(state);
  }

  saveUserData = token => {
    localStorage.setItem(AUTH_TOKEN, token);
  }

  render() {
    var {username, password, summary} = this.state;
    return (
      <div className="Login">
        <form onSubmit={this.onSubmit}>
          <h2 className="form-signin-heading">Login</h2>
          {summary !== '' && <p className="errormessage">{summary}</p>}
          <FormGroup controlId="username" bsSize="large" validationState={username.validState}>
            <ControlLabel>Username</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              placeholder="Enter your username"
              value={username.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock>{username.message}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="password" bsSize="large" validationState={password.validState}>
            <ControlLabel>Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Enter your password"
              value={password.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock>{password.message}</HelpBlock>
          </FormGroup>
          <Button
            block
            bsSize="large"
            type="submit"
            primary="true"
          >
            Login
          </Button>
          <br />
          <p>Need to create an account? <Link to={'/signup'}>Create Account</Link></p>
        </form>
      </div>
    );
  }
}

const LOGIN_MUTATION = gql`
  mutation LoginMutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`

export default compose(
  graphql(LOGIN_MUTATION, { name: 'loginMutation' }),
)(Login);
