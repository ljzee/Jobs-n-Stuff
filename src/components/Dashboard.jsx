import React, { Component } from 'react';
import { Redirect } from 'react-router';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from './Loading';
import { Alert } from 'react-bootstrap';
import { USER_TOKEN } from '../constants';

class Dashboard extends Component {

  adminDeactivated = () => {
    return this.props.userQuery.user.admindeactivated;
  }

  render() {

    if (this.props.userQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    return (
      <div className="Dashboard">
        {this.adminDeactivated() &&
          <Alert bsStyle="danger">
            Your account has been deactivated by an administrator. Please email jobsnstuff001@gmail.com for more details.
          </Alert>
        }
        <h1>This will be a landing page for users after logging in</h1>
      </div>
    );
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      admindeactivated
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
  withRouter,
  withApollo
)(Dashboard)
