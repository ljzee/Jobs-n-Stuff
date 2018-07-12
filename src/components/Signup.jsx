import React from 'react';
import { Redirect } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { AUTH_TOKEN, USER_TOKEN } from '../constants';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock, Radio } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import validator from 'validator';
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
    var state = this.state;
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
    var state = this.state;
    const username = state.username.value;
    const email = state.email.value;
    const password = state.password.value;
    const role = (state.selectedOption === 'personal') ? 'BASEUSER' : 'BUSINESS';
    const activated = (state.selectedOption === 'personal') ? true : false;
    const username_password_re = new RegExp("Username in use.Email in use.$");
    const username_re = new RegExp("Username in use.$");
    const email_re = new RegExp("Email in use.$");

    this.setFormErrorStates();

    if (state.email.isValid && state.username.isValid) {
      await this.props.signupMutation({
        variables: {
          username,
          email,
          password,
          activated,
          role,
        },
      })
      .then((result) => {
        if (this.formIsValid()) {
          const { token, user } = result.data.signup
          this.saveUserData(token, user)
        }
      })
      .catch((e) => {
        const msg = e.graphQLErrors[0].message;
        if (username_password_re.test(msg)) {
          state.email.isValid = false;
          state.email.message = 'Email is already in use';
          state.email.validState = "error";
          state.username.isValid = false;
          state.username.message = 'Username is already in use';
          state.username.validState = "error";
          this.setState(state);
        } else if (username_re.test(msg)) {
          state.username.isValid = false;
          state.username.message = 'Username is already in use';
          state.username.validState = "error";
          this.setState(state);
        } else if (email_re.test(msg)) {
          state.email.isValid = false;
          state.email.message = 'Email is already in use';
          state.email.validState = "error";
          this.setState(state);
        } else {
          throw e;
        }
      });
    }
  }

  setFormErrorStates = () => {
    var state = this.state;

    if (state.email.isValid && state.email.value === '') {
      state.email.isValid = false;
      state.email.message = 'Please enter an email address';
      state.email.validState = "error";
      this.setState(state);
    }

    if (state.email.isValid && !validator.isEmail(state.email.value)) {
      state.email.isValid = false;
      state.email.message = 'Not a valid email address';
      state.email.validState = "error";
      this.setState(state);
    }

    if (state.username.isValid && state.username.value === '') {
      state.username.isValid = false;
      state.username.message = 'Please enter a username';
      state.username.validState = "error";
      this.setState(state);
    }

    if (state.password.value === '') {
      state.password.isValid = false;
      state.password.message = 'Please enter a password';
      state.password.validState = "error";
      this.setState(state);
    }

    if (state.password.isValid && state.password.value.trim().length < 8) {
      state.password.isValid = false;
      state.password.message = 'Password must be at least 8 characters';
      state.password.validState = "error";
      this.setState(state);
    }

    if (state.confirmPassword.value !== state.password.value) {
      state.confirmPassword.isValid = false;
      state.confirmPassword.message = 'Passwords don\'t match';
      state.confirmPassword.validState = "error";
      this.setState(state);
    }
  }

  formIsValid = () => {
    var state = this.state;

    for (var key in state) {
      if (state[key].hasOwnProperty('isValid') && !state[key].isValid) return false;
    }

    return true;
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

  saveUserData = (token, user) => {
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(USER_TOKEN, JSON.stringify(user));
    this.props.client.resetStore().then(() => {
      const userToken = JSON.parse(localStorage.getItem(USER_TOKEN));
      this.props.history.push(`/profile/` + userToken.id);
    });
  }

  render() {

    const authToken = localStorage.getItem(AUTH_TOKEN)

    if(authToken) {
      return (
        <Redirect to='dashboard'/>
      )
    }

    var {username, email, password, confirmPassword, selectedOption} = this.state;

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
  mutation SignupMutation($email: String!, $password: String!, $username: String!, $role: Role!, $activated: Boolean!) {
    signup(email: $email, password: $password, username: $username, role: $role, activated: $activated) {
      token
      user {
        id
      }
    }
  }
`

export default compose(
  withApollo,
  graphql(SIGNUP_MUTATION, { name: 'signupMutation' }),
)(Signup);
