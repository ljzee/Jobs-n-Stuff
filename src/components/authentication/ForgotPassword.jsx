import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { HelpBlock } from 'react-bootstrap';
import { reduxForm, SubmissionError } from 'redux-form';
import ValidationForm from '../form/ValidationForm';
import { Link } from 'react-router-dom';
import '../../styles/ForgotPassword.css';

class ForgotPassword extends Component {

  fields = [
    { name: 'email', type: 'email', label: 'Email'},
  ]

  submit = async values => {
    this.fields.map(field => {
      if (!values[field.name]) {
        values[field.name] = '';
      }
      return null;
    });
    const result = await this.props.forgotPasswordMutation({
      variables: values,
    });
    const { user, error } = result.data.forgotPassword;

    if (user !== null) {
      this.props.history.push(`/`);
    } else {
      throw new SubmissionError({ email: error });
    }
  }

  render() {
    const Form = reduxForm({
      form: 'forgotPassword'
    })(ValidationForm);
    return (
      <div className="ForgotPassword">
          <h2 className="form-signin-heading">Forgot Password</h2>
          <HelpBlock>
            After clicking Submit an email will be sent with a link to reset your password.
            The link is valid for 24 hrs.
          </HelpBlock>
          <Form
            fields={this.fields}
            onSubmit={this.submit}
            submitText="Send Reset Link"
          />
          <br />
          <p><Link to={'/login'}>Cancel</Link></p>
      </div>
    )
  }
}

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPasswordMutation($email: String!) {
    forgotPassword(email: $email) {
      user {
        id
      }
      error
    }
  }
`

export default compose(
  graphql(FORGOT_PASSWORD_MUTATION, { name: 'forgotPasswordMutation' }),
)(ForgotPassword)
