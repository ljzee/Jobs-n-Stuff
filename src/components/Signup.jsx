import React from 'react';
import { Redirect } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { AUTH_TOKEN, USER_TOKEN } from '../constants';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock, Radio } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import '../styles/Signup.css'

class Signup extends React.Component {

  state = {
    email: {value: '', isValid: true, message: '', validState: null},
    username: {value: '', isValid: true, message: '', validState: null},
    password: {value: '', isValid: true, message: '', validState: null},
    confirmPassword: {value: '', isValid: true, message: '', validState: null},
    selectedOption: 'personal'
  }

  handleChange = (e) => {
    let state = this.state;
    state[e.target.id].value = e.target.value;
    state[e.target.id].message = '';
    state[e.target.id].validState = null;

    this.setState(state);
  }

  handleOptionChange = (e) => {
    this.setState({
      selectedOption: e.target.value
    });
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    let state = this.state;
    const username = state.username.value;
    const email = state.email.value;
    const password = state.password.value;
    const confirmPassword = state.confirmPassword.value;
    const role = (state.selectedOption === 'personal') ? 'BASEUSER' : 'BUSINESS';

    const result = await this.props.signupMutation({
      variables: {
        username,
        email,
        password,
        confirmPassword,
        role
      },
    });

    const { token, user, errors } = result.data.signup;

    if (token !== null && user !== null) {
      this.saveUserData(token, user);
    } else {
      for (let key in errors) {
        if (state.hasOwnProperty(key) && errors[key] !== '') {
          state[key].isValid = false;
          state[key].message = errors[key];
          state[key].validState = "error";
        }
      }
      this.setState(state);
    }
  }

  formIsValid = () => {
    let state = this.state;

    for (let key in state) {
      if (state[key].hasOwnProperty('isValid') && !state[key].isValid) return false;
    }

    return true;
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

  saveUserData = (token, user) => {
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(USER_TOKEN, JSON.stringify(user));

    this.props.client.resetStore().then(() => {
      const userToken = JSON.parse(localStorage.getItem(USER_TOKEN));
      this.props.history.push(`/profile/${userToken.username}`);
    });
  }

  render() {

    const authToken = localStorage.getItem(AUTH_TOKEN)

    if(authToken) {
      return (
        <Redirect to='dashboard'/>
      )
    }

    let {username, email, password, confirmPassword, selectedOption} = this.state;

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
            <HelpBlock className="errormessage">{username.message}</HelpBlock>
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
            <HelpBlock className="errormessage">{email.message}</HelpBlock>
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
            <HelpBlock className="errormessage">{password.message}</HelpBlock>
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
            <HelpBlock className="errormessage">{confirmPassword.message}</HelpBlock>
          </FormGroup>
          <FormGroup>
            <Radio name="radioGroup"
              inline
              checked={selectedOption==='personal'}
              value='personal'
              onChange={this.handleOptionChange}
            >
              Personal Account
            </Radio>{' '}
            <Radio name="radioGroup"
              inline
              checked={selectedOption==='business'}
              value='business'
              onChange={this.handleOptionChange}
            >
              Business Account
            </Radio>{' '}
            <HelpBlock className="radioHelp">
              Note: business accounts will need to be activated by an administrator before user has full access to system.
            </HelpBlock>
          </FormGroup>
          <Button
            type="submit"
            block
            bsSize="large"
            bsStyle="primary"
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
  mutation SignupMutation($email: String!, $password: String!, $username: String!, $role: Role!, $confirmPassword: String!) {
    signup(email: $email, password: $password, username: $username, role: $role, confirmPassword: $confirmPassword) {
      token
      user {
        id
        username
      }
      errors {
        username
        email
        password
        confirmPassword
      }
    }
  }
`

export default compose(
  withApollo,
  graphql(SIGNUP_MUTATION, { name: 'signupMutation' }),
)(Signup);
