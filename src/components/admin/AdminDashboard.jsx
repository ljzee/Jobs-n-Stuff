import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import { graphql, compose, withApollo } from 'react-apollo';
import Loading from '../Loading';
import { Button, Image } from 'react-bootstrap';
import ReactTable from 'react-table';
import { USER_TOKEN } from '../../constants';

class AdminDashboard extends Component {

  activateUser = async (id) => {
    const activated = true;

    await this.props.activateUserMutation({
      variables: {
        id,
        activated
      }
    });

    this.props.client.resetStore();
  }

  getBusinessUsers = () => {
    let users = [];

    let resultUsers = this.props.businessUsersQuery.users;

    resultUsers.forEach(result => {
      let user       = {};
      user.id        = result.id;
      user.username  = result.username;
      user.email     = result.email;
      user.name        = result.businessprofile.name;
      user.phonenumber = result.businessprofile.phonenumber;
      user.activated = result.activated;
      user.files = result.files;
      user.avatar = "/avatar.png";


      for (let i = 0; i < result.files.length; i++) {
        if (result.files[i].filetype === 'PROFILEIMAGE') {
          user.avatar = result.files[i].path;
        }
      }

      users.push(user);
    });

    return users;
  }

  getSuspendedUsers = () => {
    let users = [];

    this.props.suspendedUsersQuery.users.forEach(result => {
      let user       = {};
      user.id        = result.id;
      user.username  = result.username;
      user.email     = result.email;
      user.role      = result.role;
      user.files     = result.files;
      user.activated = result.activated;
      user.suspended = result.admindeactivated;

      user.avatar = "/avatar.png";
      for (let i = 0; i < result.files.length; i++) {
        if (result.files[i].filetype === 'PROFILEIMAGE') {
          user.avatar = result.files[i].path;
        }
      }

      if (result.userprofile) {
        user.name = result.userprofile.firstname + " " + result.userprofile.lastname;
        user.phonenumber = result.userprofile.phonenumber;

      } else if (result.businessprofile) {
        user.name        = result.businessprofile.name;
        user.phonenumber = result.businessprofile.phonenumber;
      }

      users.push(user);
    });

    return users;
  }

  render() {

    if (this.props.userQuery.loading || this.props.businessUsersQuery.loading || this.props.suspendedUsersQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    const businessUsers = this.getBusinessUsers();
    const suspendedUsers = this.getSuspendedUsers();
    const columns = [
      {
        Header: () => <div><strong>Picture</strong></div>,
        accessor: 'avatar',
        Cell: props => <Image src={props.value} style={{"width": "50px"}} />,
        width: 70,
      },
      {
        Header: () => <div><strong>Username</strong></div>,
        accessor: 'username'
      },
      {
        Header: () => <div><strong>Name</strong></div>,
        accessor: 'name'
      },
      {
        Header: () => <div><strong>Contact Info</strong></div>,
        accessor: '',
        Cell: props => {
          return (
            <div>
              <span>{props.value.email}</span>
              <br />
              <span>{props.value.phonenumber}</span>
            </div>
          );
        },
        sortMethod: (a, b) => {
          return a.email > b.email? 1 : -1;
        }
      }
    ];

    let businessUsersColumns = columns.slice();
    businessUsersColumns.push(
      {
        Header: () => <div><strong>Actions</strong></div>,
        accessor: '',
        Cell: props =>
          <Button
            bsStyle="success"
            bsSize="large"
            block
            onClick={() => this.activateUser(props.value.id)}
          >
          Activate
          </Button>
      }
    );

    let suspendedUsersColumns = columns.slice();
    suspendedUsersColumns.push(
      {
        Header: () => <div><strong>Actions</strong></div>,
        accessor: '',
        Cell: props =>
          <Button
            bsStyle="warning"
            bsSize="large"
            block
            onClick={() => this.activateUser(props.value.id)}
          >
          Reactivate
          </Button>
      }
    );

    return (
      <div id="admin-dashboard">
        <h2>Business Users Awaiting Activation</h2>
        <ReactTable
          columns={businessUsersColumns}
          data={businessUsers}
          minRows={5}
          showPagination={false}
          noDataText='No business users awaiting activation'
          style={{
            borderRadius: "5px",
            overflow: "hidden",
            padding: "5px",
            textAlign: "center"
          }}
        />

        <h2>Suspended Users</h2>
        <ReactTable
          columns={suspendedUsersColumns}
          data={suspendedUsers}
          minRows={5}
          showPagination={false}
          noDataText='No suspended users'
          style={{
            borderRadius: "5px",
            overflow: "hidden",
            padding: "5px",
            textAlign: "center"
          }}
        />
      </div>
    );
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      role
    }
  }
`

const BUSINESS_USERS_QUERY = gql`
 query BusinessUsersQuery {
   users(where: {
     role: BUSINESS
     activated: false
     admindeactivated: false
   }) {
     id
     username
     email
     activated
     businessprofile {
       id
     }
     files {
       path
       filename
       filetype
     }
   }
 }
`

const SUSPENDED_USERS_QUERY = gql`
  query SuspendedUsersQuery {
    users(where: {
      admindeactivated: true
    }) {
      id
      username
      email
      role
      activated
      admindeactivated
      files(filetype: PROFILEIMAGE) {
        filetype
        path
      }
      userprofile {
        firstname
        preferredname
        lastname
        phonenumber
      }
      businessprofile{
        name
        phonenumber
      }
    }
  }
`

const ACTIVATE_USER_MUTATION = gql`
  mutation ActivateUserMutation($id: ID!, $activated: Boolean!) {
    toggleUserActive(id: $id, activated: $activated) {
      id
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
  graphql(BUSINESS_USERS_QUERY, {
    name: 'businessUsersQuery',
  }),
  graphql(SUSPENDED_USERS_QUERY, {
    name: 'suspendedUsersQuery',
  }),
  graphql(ACTIVATE_USER_MUTATION, {
    name: 'activateUserMutation',
  }),
  withRouter,
  withApollo
)(AdminDashboard)
