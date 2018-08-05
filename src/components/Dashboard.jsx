import React, { Component } from 'react';
import { Redirect } from 'react-router';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from './Loading';
import AdminDashboard from './admin/AdminDashboard';
import BusinessDashboard from './business/BusinessDashboard';
import UserDashboard from './users/UserDashboard';
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
        <h1>Dashboard</h1>
        {this.adminDeactivated() &&
          <Alert bsStyle="danger">
            Your account has been deactivated by an administrator. Please email jobsnstuff001@gmail.com for more details.
          </Alert>
        }
        {this.props.userQuery.user.role === 'BASEUSER'
          ? <UserDashboard />

          : this.props.userQuery.user.role === 'BUSINESS'
          ? <BusinessDashboard />

          : this.props.userQuery.user.role === 'ADMIN'
          ? <AdminDashboard />

          : false
        }
      </div>
    );
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      role
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
) (Dashboard);
