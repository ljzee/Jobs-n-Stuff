import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AUTH_TOKEN, USER_TOKEN } from '../../constants';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';

import BusinessApprovalRequestForm from './BusinessApprovalRequestForm';
import Loading from '../Loading';

const userToken = localStorage.getItem(USER_TOKEN)
const authToken = localStorage.getItem(AUTH_TOKEN)

class BusinessPageForm extends Component {

  render() {

    console.log(this.props.userQuery.user)

    if (this.props.userQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    if(authToken) {
      return (
        <div className="Profile">
          {this.props.userQuery.user.activated === false
          ? this.businessApprovalRequest()
          : this.businessDetails()}
        </div>
      );
    } else {
      return (
        <Redirect to='login'/>
      );
    }
  }

  businessApprovalRequest() {
    return (
      <div className="BusinessApprovalRequest">
        <h1>This is an unapproved business profile</h1>
        {/* TODO: If the business user is not approved render the business approval form */}
        <BusinessApprovalRequestForm />
      </div>
    );
  }

  businessDetails(){
    return (
      <div className="BusinessDetails">
        <h1>This is an approved business profile potatoe</h1>
        {/* TODO: Render the business details form*/}
      </div>
    );
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      username
      activated
    }
  }
`

export default compose(
  graphql(USER_QUERY, {
    name: 'userQuery',
    options: props => ({
      variables: {
          where: {
            id:JSON.parse(userToken).id
          }
        },
    }),
  }),
  withRouter,
  withApollo
)(BusinessPageForm)
