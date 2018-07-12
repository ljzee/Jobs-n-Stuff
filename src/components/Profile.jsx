import React, { Component } from 'react';
import { AUTH_TOKEN } from '../constants';
import { Redirect } from 'react-router';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from './Loading';
import UserPageForm from './UserPageForm';
import BusinessPageForm from './BusinessPageForm';
import '../styles/Profile.css';

class Profile extends Component {

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
        userQuery = {this.props.userQuery}
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
      id
      role
      email
      username
      files {
        id
        filename
        path
        name
        filetype
      }
      userprofile {
        id
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

export default compose(
  graphql(USER_QUERY, {
    name: 'userQuery',
    options: props => ({
      variables: {
          where: {
            id: props.match.params.id,
          }
        },
    }),
  }),
  withRouter,
  withApollo
)(Profile)
