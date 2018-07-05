import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { AUTH_TOKEN } from '../constants';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import validator from 'validator';
import '../styles/Signup.css'

class Signup extends React.Component {

  state = {
    email: {value: '', isValid: true, message: '', validState: null},
    username: {value: '', isValid: true, message: '', validState: null},
    password: {value: '', isValid: true, message: '', validState: null},
    confirmPassword: {value: '', isValid: true, message: '', validState: null}
  }

  handleChange = (e) => {
    var state = this.state;
    state[e.target.id].value = e.target.value;
    state[e.target.id].message = '';
    state[e.target.id].validState = null;

    this.setState(state);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    var state = this.state;
    const username = state.username.value;
    const email = state.email.value;
    const password = state.password.value;
    const role = 'BASEUSER';
    var username_password_re = new RegExp("Username and email in use$");
    var username_re = new RegExp("Username in use$");
    var email_re = new RegExp("Email in use$");

    if (this.formIsValid()) {
      try {
        const result = await this.props.signupMutation({
          variables: {
            username,
            email,
            password,
            role,
          },
        });
        const { token } = result.data.signup;
        this.saveUserData(token);
        this.props.history.push(`/dashboard`);
      } catch (Error) {
        if (username_password_re.test(Error.message)) {
          state.email.isValid = false;
          state.email.message = 'Email is already in use';
          state.email.validState = "error";
          state.username.isValid = false;
          state.username.message = 'Username is already in use';
          state.username.validState = "error";
          this.setState(state);
        } else if (username_re.test(Error.message)) {
          state.username.isValid = false;
          state.username.message = 'Username is already in use';
          state.username.validState = "error";
          this.setState(state);
        } else if (email_re.test(Error.message)) {
          state.email.isValid = false;
          state.email.message = 'Email is already in use';
          state.email.validState = "error";
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

    if (state.username.value === '') {
      state.username.isValid = false;
      state.username.message = 'Please enter a username';
      state.username.validState = "error";

      this.setState(state);
      isFormValid = false;
    }

    if (state.password.value === '') {
      state.password.isValid = false;
      state.password.message = 'Please enter a password';
      state.password.validState = "error";

      this.setState(state);
      isFormValid = false;
    }

    if (state.password.isValid && state.password.value.trim().length < 8) {
      state.password.isValid = false;
      state.password.message = 'Password must be at least 8 characters';
      state.password.validState = "error";

      this.setState(state);
      isFormValid = false;
    }

    if (state.password.isValid && state.password.value !== state.confirmPassword.value) {
      state.confirmPassword.isValid = false;
      state.confirmPassword.message = 'Passwords don\'t match';
      state.confirmPassword.validState = "error";

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
    var {username, email, password, confirmPassword} = this.state;
    return (
      <div className="Signup">
        <form onSubmit={this.onSubmit}>
          <h2 className="form-signin-heading">Create Account</h2>
          <FormGroup controlId="username" bsSize="large" validationState={username.validState}>
            <ControlLabel>Username</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              placeholder="Enter a username"
              value={username.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="signuperrormessage">{username.message}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="email" bsSize="large" validationState={email.validState}>
            <ControlLabel>Email</ControlLabel>
            <FormControl
              type="text"
              placeholder="Enter your email"
              value={email.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="signuperrormessage">{email.message}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="password" bsSize="large" validationState={password.validState}>
            <ControlLabel>Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Enter password"
              value={password.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="signuperrormessage">{password.message}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="confirmPassword" bsSize="large" validationState={confirmPassword.validState}>
            <ControlLabel>Confirm Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Confirm password"
              value={confirmPassword.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="signuperrormessage">{confirmPassword.message}</HelpBlock>
          </FormGroup>
          <Button
            type="submit"
            block
            bsSize="large"
            primary="true"
          >
            Create Account
          </Button>
          <br />
          <p>Already have an account? <Link to={'/login'}>Log in</Link></p>
        </form>
      </div>
    );
  }
}

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $username: String!, $role: Role!) {
    signup(email: $email, password: $password, username: $username, role: $role) {
      token
    }
  }
`

export default compose(
  graphql(SIGNUP_MUTATION, { name: 'signupMutation' }),
)(Signup);
