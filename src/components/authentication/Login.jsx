import React from 'react';
import { Redirect } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { AUTH_TOKEN, USER_TOKEN } from '../../constants';
import { withApollo } from 'react-apollo';
import { Link } from 'react-router-dom';
import { reduxForm } from 'redux-form';
import ValidationForm from '../form/ValidationForm';
import '../../styles/Login.css';

class Login extends React.Component {


  fields = [
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'password', label: 'Password', type: 'password' },
  ]

  state = {
    summary: ''
  }

  submit = async values => {
    this.fields.map(field => {
      if (!values[field.name]) {
        values[field.name] = '';
      }
      return null;
    });
    const result = await this.props.loginMutation({
      variables: values,
    });
    const { token, user, errors } = result.data.login;

    if (token !== null && user !== null) {
      this.saveUserData(token, user);
    } else {
      this.setState({ summary: errors.login });
    }
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

    const Form = reduxForm({
      form: 'login'
    })(ValidationForm);

    let {summary} = this.state;
    return (
      <div className="Login">
        <h2 className="form-signin-heading">Login</h2>
        {summary !== '' && <p className="errormessage">{summary}</p>}
        <Form
          fields={this.fields}
          onSubmit={this.submit}
          submitText="Login"
        />
        <p className="forgot-password-link"><Link to={'/forgot-password'}>Forgot password?</Link></p>
        <p>Need to create an account? <Link to={'/signup'}>Create Account</Link></p>
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
        username
      }
      errors {
        login
      }
    }
  }
`

export default compose(
  withApollo,
  graphql(LOGIN_MUTATION, { name: 'loginMutation' })
)(Login);
