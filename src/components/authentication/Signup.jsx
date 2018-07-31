import React from 'react';
import { Redirect } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { AUTH_TOKEN, USER_TOKEN } from '../../constants';
import { Link } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import { SubmissionError, reduxForm } from 'redux-form';
import ValidationForm from '../form/ValidationForm';
import '../../styles/Signup.css'

class Signup extends React.Component {

  fields = [
    {
      name: 'username',
      label: 'Username',
      type: 'text',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
    },
    {
      name: 'role',
      type: 'radio',
      options: [
        {
          label: 'Personal',
          value: 'BASEUSER',
        },
        {
          label: 'Business',
          value: 'BUSINESS'
        }
      ],
      helpBlock: 'Note: business accounts will need to be activated by an administrator before user has full access to system.',
    },
  ]

  submit = async values => {
    this.fields.map(field => {
      if (!values[field.name]) {
        values[field.name] = '';
      }
      return null;
    });
    if (!values['role']) {
      values['role'] = 'BASEUSER';
    }

    const result = await this.props.signupMutation({
      variables: values,
    });

    const { token, user, errors } = result.data.signup;

    if (token !== null && user !== null) {
      this.saveUserData(token, user);
    } else {
      let submissionErrors = {};
      for (let error in errors) {
        if (errors[error] !== '') {
          submissionErrors[error] = errors[error];
        }
      }
      throw new SubmissionError(submissionErrors);
    }
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

    const Form = reduxForm({
      form: 'signup'
    })(ValidationForm);

    return (
      <div className="Signup">
        <h2 className="form-signin-heading">Create Account</h2>
        <form onSubmit={this.onSubmit}>
          <Form
            fields={this.fields}
            onSubmit={this.submit}
            submitText="Create Your Account" 
          />
          <br />
        </form>
        <p>Already have an account? <Link to={'/login'}>Log in</Link></p>
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
