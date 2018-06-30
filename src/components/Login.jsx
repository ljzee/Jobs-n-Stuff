import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { AUTH_TOKEN } from '../constants';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import validator from 'validator';
import '../styles/Login.css';

class Login extends React.Component {

  state = {
    email: {value: '', isValid: true, message: '', validState: null},
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
    const email = state.email.value;
    const password = state.password.value;

    if (this.formIsValid()) {
      try {
        const result = await this.props.loginMutation({
          variables: {
            email,
            password,
          },
        });
        const { token } = result.data.login;
        this.saveUserData(token);
        this.props.history.push(`/dashboard`);
      } catch (Error) {
        state.summary = Error.message.replace('GraphQL error: ', '');
        this.resetValidationStates();
        this.setState(state)
      }
    }
  }

  formIsValid = () => {
    var state = this.state;
    var isFormValid = true;

    if (state.email.value === '') {
      state.email.isValid = false;
      state.email.message = 'Please enter an email address';
      state.email.validState = "error";

      this.setState(state);
      isFormValid = false;
    }

    if (state.email.isValid && !validator.isEmail(state.email.value)) {
      state.email.isValid = false;
      state.email.message = 'Not a valid email address';
      state.email.validState = "error";

      this.setState(state);
      isFormValid = false;
    }

    if (state.password.value === '') {
      state.password.isValid = false;
      state.password.message = 'Please enter a password';
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
    var {email, password, summary} = this.state;
    return (
      <div className="Login">
        <form onSubmit={this.onSubmit}>
          <h2 className="form-signin-heading">Login</h2>
          {summary !== '' && <p className="errormessage">{summary}</p>}
          <FormGroup controlId="email" bsSize="large" validationState={email.validState}>
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              placeholder="Enter your email"
              value={email.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock>{email.message}</HelpBlock>
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
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`

export default compose(
  graphql(LOGIN_MUTATION, { name: 'loginMutation' }),
)(Login);
