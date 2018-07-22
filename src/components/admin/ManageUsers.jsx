import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { Redirect, withRouter } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import Loading from '../Loading';

class ManageUsers extends React.Component {
  render() {
    if (this.props.usersQuery.loading || this.props.meQuery.loading) {
      return <Loading />
    }

    if (this.props.meQuery.error || this.props.meQuery.me.role !== 'ADMIN') {
      return <Redirect to="/dashboard" />
    }

    if (this.props.usersQuery.error) {
      return <h3>Error</h3>
    }

    return (
      <div id="manage-users" className="container">
        <h1>Manage Users</h1>
        <Table striped bordered hover>
          <thead>
            <tr>
             <th>Username</th>
             <th>Email</th>
             <th>Role</th>
            </tr>
          </thead>
          <tbody>
        { this.props.usersQuery.feed.users.map(user =>
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          )
        }
          </tbody>
        </Table>

      </div>
    );
  }
}
const ME_QUERY =gql`
  query MeQuery {
    me {
      role
    }
  }
`
const USERS_QUERY = gql`
  query UserQuery {
    feed {
      users {
        id
        username
        email
        role
      }
    }
  }
`

export default compose(
  graphql(USERS_QUERY, {
    name: 'usersQuery',
  }),
  graphql(ME_QUERY, {
	name: 'meQuery',
  }),
  withRouter,
  withApollo
) (ManageUsers);
