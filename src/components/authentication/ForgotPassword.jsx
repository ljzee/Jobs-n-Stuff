import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import '../../styles/ForgotPassword.css';

class ForgotPassword extends Component {
  state = {
    email: {value: '', isValid: true, message: '', validState: null},
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
    const email = state.email.value;

    const result = await this.props.forgotPasswordMutation({
      variables: {
        email
      },
    });

    const { user, error } = result.data.forgotPassword;

    if (user !== null) {
      this.props.history.push(`/`);
    } else {
      state.email.message = error;
      this.setState(state);
    }
  }

  render() {
    return (
      <div className="ForgotPassword">
        <form>
          <h2 className="form-signin-heading">Forgot Password</h2>
          <HelpBlock>
            After clicking Submit an email will be sent with a link to reset your password.
            The link is valid for 24 hrs.
          </HelpBlock>
          <FormGroup controlId="email" bsSize="large" validationState={this.state.email.validState}>
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="text"
              placeholder="Enter your email"
              value={this.state.email.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="errormessage">{this.state.email.message}</HelpBlock>
          </FormGroup>
        </form>
        <Button
          type="submit"
          bsSize="large"
          bsStyle="primary"
          onClick={this.onSubmit}
        >
          Submit
        </Button>
        <Button
          type="submit"
          bsSize="large"
          onClick={ () => {
            this.props.history.push(`/login`);
          }}
        >
          Cancel
        </Button>
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
