import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { Redirect, withRouter } from 'react-router-dom';
import ReactTable from 'react-table';
import Loading from '../Loading';

class ManageUsers extends React.Component {
  state = { users: [] }

  getUsers = () => {
    let users = [];

    this.props.usersQuery.feed.users.forEach(user => {
      users.push(user);
    })

    return users;
  }

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

    var users = this.getUsers();

    const columns = [
      {
        Header: () => <div><strong>Username</strong></div>,
        accessor: 'username',
        width: 200
      },
      {
        Header: () => <div><strong>Email</strong></div>,
        accessor: 'email',
        width: 200
      },
      {
        Header: () => <div><strong>Role</strong></div>,
        accessor: 'role',
        width: 200
      }
    ]


    return (
      <div id="manage-users">
        <h1>Manage Users</h1>
          <ReactTable
            id="users-table"
            className="-striped"
            columns={columns}
            data={users}
            minRows={5}
            showPagination={false}
          />
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
