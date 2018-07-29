import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { Alert, Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import { AUTH_TOKEN, USER_TOKEN } from '../constants';
import { Link } from 'react-router-dom';
import '../styles/ResetPassword.css';

class ResetPassword extends Component {
  state = {
    password: {value: '', isValid: true, message: '', validState: null},
    confirmPassword: {value: '', isValid: true, message: '', validState: null},
    resetPasswordToken: '',
    resetPass: '',
    showForgotPassLink: false
  }

  componentDidMount() {
    const resetPasswordToken = this.props.match.params.resetpasstoken;
    if(resetPasswordToken) {
      this.setState({
        resetPasswordToken: resetPasswordToken
      })
    }
  }

  handleChange = (e) => {
    let state = this.state;
    state[e.target.id].value = e.target.value;
    state[e.target.id].message = '';
    state[e.target.id].validState = null;

    this.setState(state);
  }

  resetValidationStates = () => {
    let state = this.state;

    Object.keys(state).forEach(key => {
      if (state[key].hasOwnProperty('isValid')) {
        state[key].isValid = true;
        state[key].message = '';
        state[key].validState = null;
      }
    });

    this.setState(state);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    let state = this.state;
    const password = state.password.value;
    const confirmPassword = state.confirmPassword.value;
    const resetPasswordToken = state.resetPasswordToken;

    const result = await this.props.resetPasswordMutation({
      variables: {
        password,
        confirmPassword,
        resetPasswordToken
      },
    });

    const { token, user, errors } = result.data.resetPassword;

    if (token !== null && user !== null) {
      this.saveUserData(token, user);
    } else {
      for (let key in errors) {
        if (state.hasOwnProperty(key) && state[key].hasOwnProperty('isValid') && errors[key] !== '') {
          state[key].isValid = false;
          state[key].message = errors[key];
          state[key].validState = "error";
        }
      }
      if (errors.resetPass !== '') {
        state.resetPass = errors.resetPass;
        state.showForgotPassLink = true;
      }
      this.setState(state);
    }
  }

  saveUserData = (token, user) => {
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(USER_TOKEN, JSON.stringify(user));

    const userToken = JSON.parse(localStorage.getItem(USER_TOKEN));
    this.props.history.push(`/profile/${userToken.username}`);
  }

  render() {

    let state = this.state;

    return (
      <div className="ResetPassword">
        <form>
          <h2 className="form-signin-heading">Reset Password</h2>
          <FormGroup controlId="password" bsSize="large" validationState={state.password.validState}>
            <ControlLabel>New Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Enter new password"
              value={state.password.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="errormessage">{state.password.message}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="confirmPassword" bsSize="large" validationState={state.confirmPassword.validState}>
            <ControlLabel>Confirm Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Confirm password"
              value={state.confirmPassword.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="errormessage">{state.confirmPassword.message}</HelpBlock>
          </FormGroup>
          {state.showForgotPassLink &&
            <Alert bsStyle="danger">
              {`The link to reset your password is ${state.resetPass}. `}
              <Link to={'/forgot-password'}>Please click here.</Link>
            </Alert>
          }
        </form>
        <Button
          type="submit"
          bsSize="large"
          bsStyle="primary"
          onClick={this.onSubmit}
          disabled={state.showForgotPassLink}
        >
          Submit
        </Button>
      </div>
    )
  }
}

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPasswordMutation($password: String!, $confirmPassword: String!, $resetPasswordToken: String!) {
    resetPassword(password: $password, confirmPassword: $confirmPassword, resetPasswordToken: $resetPasswordToken) {
      token
      user {
        id
        username
      }
      errors {
        password
        confirmPassword
        resetPass
      }
    }
  }
`

export default compose(
  graphql(RESET_PASSWORD_MUTATION, { name: 'resetPasswordMutation' }),
)(ResetPassword)
