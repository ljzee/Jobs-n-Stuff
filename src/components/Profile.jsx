import React, { Component } from 'react';
import { AUTH_TOKEN } from '../constants';
import { Redirect } from 'react-router';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from './Loading';
import UserPageForm from './users/UserPageForm';
import BusinessPageForm from './business/BusinessPageForm';
import { Alert, Button } from 'react-bootstrap';
import '../styles/Profile.css';

class Profile extends Component {

  state = {
    emailError: ''
  }

  resendActivationEmail = async (e) => {
    let state = this.state;

    const result = await this.props.sendLinkValidateEmail({
      variables: {
        email: this.props.userQuery.user.email
      },
    });

    const { user, error } = result.data.sendLinkValidateEmail;

    if (user !== null) {
      this.props.client.resetStore().then(() => {

      });
    } else {
      state.emailError = error;
      this.setState(state);
    }
  }

  adminDeactivated = () => {
    return this.props.userQuery.user.admindeactivated;
  }

  showActivationWarning = () => {
    if (!this.props.userQuery.user.activated) {
      if (this.props.userQuery.user.userprofile.firstname === '' && this.props.userQuery.user.userprofile.lastname === '') {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  render() {

    if (this.props.userQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    const { user } = this.props.userQuery;
    if(!user) {
      return <Redirect to='/login'/>;
    }

    const authToken = localStorage.getItem(AUTH_TOKEN);

    if (authToken) {
      return (
        <div className="Profile">
          {this.adminDeactivated()
            ?
              <Alert bsStyle="danger">
                Your account has been deactivated by an administrator. Please email jobsnstuff001@gmail.com for more details.
              </Alert>
            :
              <div>
                {this.showActivationWarning() &&
                  <Alert bsStyle="warning">
                    <div className="activation-warning-first">Your account has not been activated. Please check your email for the activation link.</div>
                    <div>
                      <Button
                        type="submit"
                        bsSize="small"
                        bsStyle="primary"
                        onClick={this.resendActivationEmail}
                      >
                        Resend Activation Link
                      </Button>
                    </div>
                  </Alert>
                }
              </div>
          }
          {this.state.emailError !== '' &&
            <Alert bsStyle="danger">
              {`${this.state.emailError}`}
            </Alert>
          }
          {this.props.userQuery.user.role === 'BASEUSER'
            ? this.userProfile()
            : this.businessProfile()}
        </div>
      );
    } else {
      return <Redirect to='/login'/>;
    }
  }

  userProfile() {
    return (
      <UserPageForm
        user = {this.props.userQuery.user}
      />
    );
  }

  businessProfile() {
    return (
      <BusinessPageForm
        user = {this.props.userQuery.user}
      />
    );
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      role
      email
      username
      activated
      admindeactivated
      files {
        filename
        path
        name
        filetype
      }
      userprofile {
        firstname
        lastname
        preferredname
        phonenumber
      }
      businessprofile {
        name
        description
        phonenumber
        address
        website
      }
    }
  }
`

const SEND_VALIDATION_LINK_MUTATION = gql`
  mutation SendValidationLinkMutation($email: String!) {
    sendLinkValidateEmail(email: $email) {
      user {
        id
      }
      error
    }
  }
`

export default compose(
  graphql(USER_QUERY, {
    name: 'userQuery',
    options: props => ({
      variables: {
          where: {
            username: props.match.params.username
          }
        },
    }),
  }),
  graphql(SEND_VALIDATION_LINK_MUTATION, { name: 'sendLinkValidateEmail' }),
  withRouter,
  withApollo
)(Profile)
