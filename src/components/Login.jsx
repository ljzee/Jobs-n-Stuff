import React from 'react';
import { Redirect } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { AUTH_TOKEN, USER_TOKEN } from '../constants';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import { withApollo } from 'react-apollo';
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
    state[e.target.id].message = '';
    state[e.target.id].validState = null;

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
      await this.props.loginMutation({
        variables: {
          username,
          password,
        },
      })
      .then((result) => {
        const { token, user } = result.data.login;
        this.saveUserData(token, user);
      })
      .catch((e) => {
        if (invalid_re.test(e.graphQLErrors[0].message)) {
          state.summary = 'Incorrect email or password';
          this.resetValidationStates();
          this.setState(state);
        } else {
          throw e;
        }
      });
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

  saveUserData = (token, user) => {
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(USER_TOKEN, JSON.stringify(user));
    this.props.client.resetStore().then( () => {
      this.props.history.push(`/dashboard`);
    });
  }

  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)

    if(authToken) {
      return (
        <Redirect to='dashboard'/>
      )
    }

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
            <HelpBlock className="errormessage">{username.message}</HelpBlock>
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
            <HelpBlock className="errormessage">{password.message}</HelpBlock>
          </FormGroup>
          <Button
            block
            bsSize="large"
            type="submit"
            bsStyle="primary"
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
      user {
        id
      }
    }
  }
`

export default compose(
  withApollo,
  graphql(LOGIN_MUTATION, { name: 'loginMutation' })
)(Login);
