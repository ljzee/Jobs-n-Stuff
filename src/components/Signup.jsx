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
    name: {value: '', isValid: true, message: '', validState: null},
    password: {value: '', isValid: true, message: '', validState: null},
    confirmPassword: {value: '', isValid: true, message: '', validState: null},
    summary: ''
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
    const name = state.name.value;
    const email = state.email.value;
    const password = state.password.value;
    const role = 'BASEUSER';

    if (this.formIsValid()) {
      try {
        const result = await this.props.signupMutation({
          variables: {
            name,
            email,
            password,
            role,
          },
        });
        const { token } = result.data.signup;
        this.saveUserData(token);
        this.props.history.push(`/dashboard`);
      } catch (Error) {
        state.summary = Error.message.replace('GraphQL error: ', '');
        this.resetValidationStates();
        this.setState(state);
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

    if (state.name.value === '') {
      state.name.isValid = false;
      state.name.message = 'Please enter your name';
      state.name.validState = "error";

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
    var {name, email, password, confirmPassword, summary} = this.state;
    return (
      <div className="Signup">
        <form onSubmit={this.onSubmit}>
          <h2 className="form-signin-heading">Create Account</h2>
          {summary !== '' && <p className="errormessage">{summary}</p>}
          <FormGroup controlId="name" bsSize="large" validationState={name.validState}>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              placeholder="Enter your name"
              value={name.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="signuperrormessage">{name.message}</HelpBlock>
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
  mutation SignupMutation($email: String!, $password: String!, $name: String!, $role: Role!) {
    signup(email: $email, password: $password, name: $name, role: $role) {
      token
    }
  }
`

export default compose(
  graphql(SIGNUP_MUTATION, { name: 'signupMutation' }),
)(Signup);
