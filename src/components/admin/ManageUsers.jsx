import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { Redirect, withRouter, Link } from 'react-router-dom';
import { Button, Image } from 'react-bootstrap';
import ReactTable from 'react-table';
import EditBaseUserModal from './EditBaseUserModal';
import EditBusinessUserModal from './EditBusinessUserModal';
import Loading from '../Loading';

class ManageUsers extends React.Component {
  state = { users: [],
            showEdit: false,
            selectUser: null
          }

  getUsers = () => {
    let users = [];

    this.props.usersQuery.feed.users.forEach(result => {
      let user      = {};
      user.id       = result.id;
      user.username = result.username;
      user.email    = result.email;
      user.role     = result.role;
      user.files    = result.files;

      if (result.activated) {
        user.activated = "Yes";
      } else {
        user.activated = "No";
      }

      if (result.files[0]) {
        user.avatar = result.files[0].path;
      } else {
        user.avatar = "avatar.png";
      }

      if (result.userprofile) {
        user.name        = result.userprofile.firstname + " " + result.userprofile.lastname;
        user.firstname   = result.userprofile.firstname;
        user.lastname    = result.userprofile.lastname;
        user.phonenumber = result.userprofile.phonenumber;

      } else if (result.businessprofile) {
        user.name        = result.businessprofile.name;
        user.phonenumber = result.businessprofile.phonenumber;

      } else {
        user.phonenumber = "N/A";
      }

      users.push(user);
    })

    return users;
  }

  openEdit = (user) => {
    this.setState({ showEdit: true, selectUser: user });
  }

  closeEdit = () => {
    this.setState({ showEdit: false });
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
        Header: () => <div><strong>Avatar</strong></div>,
        accessor: 'avatar',
        Cell: props => <Image src={props.value} style={{"width": "50px"}} />,
        width: 70
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
        Header: () => <div><strong>Email</strong></div>,
        accessor: 'email',
      },
      {
        Header: () => <div><strong>Phone Number</strong></div>,
        accessor: 'phonenumber',
        width: 130
      },
      {
        Header: () => <div><strong>Role</strong></div>,
        accessor: 'role',
        width: 100
      },
      {
        Header: () => <div><strong>Activated</strong></div>,
        accessor: 'activated',
        width: 100
      },
      {
        Header: () => <div><strong>Actions</strong></div>,
        accessor: '',
        Cell: props => {
          if (props.value.role === "ADMIN") {
            return false;
          } else {
            return <Button onClick={this.openEdit.bind(this, props.value)}>Edit</Button>;
          }
        },
        width: 100
      }
    ]

    return (
      <div id="manage-users">
        <h1>Manage Users</h1>
          <ReactTable
            id="users-table"
            columns={columns}
            data={users}
            minRows={5}
            showPagination={false}
          />
        { (this.state.showEdit && this.state.selectUser.role === "BASEUSER")
          ? <EditBaseUserModal
                show={this.state.showEdit}
                close={this.closeEdit}
                user={this.state.selectUser}
            />
          : (this.state.showEdit && this.state.selectUser.role === "BUSINESS")
          ? <EditBusinessUserModal
                show={this.state.showEdit}
                close={this.closeEdit}
                user={this.state.selectUser}
            />
          : false
        }
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
        activated
        files(filetype: PROFILEIMAGE) {
          path
        }
        userprofile {
          firstname
          lastname
          phonenumber
        }
        businessprofile{
          name
          phonenumber
        }
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
