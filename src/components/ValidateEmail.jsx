import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import { Alert } from 'react-bootstrap';
import { AUTH_TOKEN, USER_TOKEN } from '../constants';

class ValidateEmail extends Component {
  state = {
    email: '',
    validateEmailToken: '',
    alertStyle: '',
    alertMessage: '',
    validationFinished: false
  }

  componentDidMount() {
    let validateEmailToken = this.props.match.params.emailtoken;
    if(validateEmailToken) {
      this.validateEmailMutation(validateEmailToken);
    }
  }

  validateEmailMutation = async (validateEmailToken) => {
    let state = this.state;

    const result = await this.props.validateEmailMutation({
      variables: {
        validateEmailToken
      },
    });

    const { token, user, errors } = result.data.validateEmail;

    if (token !== null && user !== null) {
      state.alertStyle = "success";
      state.alertMessage = "Your account has been activated!";
      this.setState(state);
      this.saveUserData(token, user);
    } else {
      state.alertStyle = "danger";
      state.alertMessage = errors.validateEmail;
      state.validationFinished = true;
      this.setState(state);
    }
  }

  saveUserData = (token, user) => {
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(USER_TOKEN, JSON.stringify(user));

    this.props.client.resetStore().then(() => {
      this.setState({validationFinished: true})
    });
  }

  render() {
    return (
      <div>
        {this.state.validationFinished &&
          <Alert bsStyle={this.state.alertStyle}>
            {this.state.alertMessage}
          </Alert>
        }
      </div>
    )
  }
}

const VALIDATE_EMAIL_TOKEN_MUTATION = gql`
  mutation ValidateEmailMutation($validateEmailToken: String!) {
    validateEmail(validateEmailToken: $validateEmailToken) {
      token
      user {
        id
        username
      }
      errors {
        validateEmail
      }
    }
  }
`

export default compose(
  graphql(VALIDATE_EMAIL_TOKEN_MUTATION, { name: 'validateEmailMutation' }),
  withApollo
)(ValidateEmail)
