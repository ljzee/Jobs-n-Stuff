import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock, ButtonToolbar } from 'react-bootstrap';
import { USER_TOKEN } from '../constants';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from './Loading';
import { Redirect } from 'react-router';
import '../styles/UpdatePassword.css';

const requiredFields = ['oldpassword', 'newpassword', 'newpassword2'];

class ChangePassword extends React.Component {

  state = {
    oldpassword: {value: '', isValid: true, message: '', validState: null},
    newpassword: {value: '', isValid: true, message: '', validState: null},
    newpassword2: {value: '', isValid: true, message: '', validState: null},
  }

  handleChange = (e) => {
    var state = this.state;

    state[e.target.id].value = e.target.value;
    state[e.target.id].isValid = true;
    state[e.target.id].message = '';
    state[e.target.id].validState = null;

    this.setState(state);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    let state = this.state;
    const username = this.props.match.params.username;
    const oldpassword = state.oldpassword.value;
    const newpassword = state.newpassword.value;
    const newpassword2 = state.newpassword2.value;

    const updateResult = await this.props.updatePasswordMutation({
      variables: {
        username,
        oldpassword,
        newpassword,
        newpassword2
      }
    });

    const { success, errors } = updateResult.data.updatePassword;

    if (!success) {
      for (let key in errors) {
        if (state.hasOwnProperty(key) && errors[key] !== '') {
          state[key].isValid = false;
          state[key].message = errors[key];
          state[key].validState = "error";
        }
      }
      this.setState(state);
    } else {
      this.props.history.push(`/profile/${this.props.match.params.username}`);
    }
  }

  formIsValid = () => {
    let state = this.state;

    for (let i = 0; i < requiredFields.length; i++) {
      let key = requiredFields[i];
      if (!state[key].isValid) return false;
    }

    return true;
  }

  resetValidationStates = () => {
    let state = this.state;

    for (let i = 0; i < requiredFields.length; i++) {
      let key = requiredFields[i];
      state[key].isValid = true;
      state[key].message = '';
      state[key].validState = null;
    }

    this.setState(state);
  }

  requiredFieldsSet = () => {
    let state = this.state;

    for (let i = 0; i < requiredFields.length; i++) {
      let key = requiredFields[i];
      if (state[key].value === '') {
        return false;
      }
    }

    return true;
  }

  buttonDisabled = () => {
    return (this.requiredFieldsSet() && this.formIsValid()) ? false : true;
  }

  render() {

    if (this.props.userQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    if (this.props.userQuery.user.username !== this.props.match.params.username) {
      return <Redirect to={`/profile/${this.props.match.params.username}`}/>;
    }

    var {oldpassword, newpassword, newpassword2} = this.state;

    return (
      <div className="ChangePassword">
        <form onSubmit={this.onSubmit}>
          <h2 className="form-signin-heading">Change Password</h2>
          <FormGroup controlId="oldpassword" bsSize="large" validationState={oldpassword.validState}>
            <ControlLabel>Old password</ControlLabel>
            <FormControl
              autoFocus
              type="password"
              placeholder="Enter your old password"
              value={oldpassword.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="errormessage">{oldpassword.message}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="newpassword" bsSize="large" validationState={newpassword.validState}>
            <ControlLabel>New Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Enter a new password"
              value={newpassword.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="errormessage">{newpassword.message}</HelpBlock>
          </FormGroup>
          <FormGroup controlId="newpassword2" bsSize="large" validationState={newpassword2.validState}>
            <ControlLabel>Confirm New Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Re-enter new password"
              value={newpassword2.value}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
            <HelpBlock className="errormessage">{newpassword2.message}</HelpBlock>
          </FormGroup>
        </form>
        <ButtonToolbar>
          <Button
            type="submit"
            block
            bsSize="large"
            bsStyle="primary"
            disabled={this.buttonDisabled()}
            onClick={this.onSubmit}
          >
            Change Password
          </Button>
          <Button
            block
            bsSize="large"
            onClick={() => this.props.history.push(`/profile/${this.props.match.params.username}`)}
          >
            Cancel
          </Button>
        </ButtonToolbar>
      </div>
    );
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      username
    }
  }
`

const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePasswordMutation($username: String!, $oldpassword: String!, $newpassword: String!, $newpassword2: String!) {
    updatePassword(username: $username, oldpassword: $oldpassword, newpassword: $newpassword, newpassword2: $newpassword2) {
      success
      errors {
        oldpassword
        newpassword
        newpassword2
      }
    }
  }
`

export default compose(
  graphql(USER_QUERY, {
    name: 'userQuery',
    options: props => ({
      variables: {
          where: {
            id: JSON.parse(localStorage.getItem(USER_TOKEN)).id
          }
        },
    }),
  }),
  graphql(UPDATE_PASSWORD_MUTATION, {
    name: 'updatePasswordMutation'
  }),
  withRouter,
  withApollo
)(ChangePassword)
