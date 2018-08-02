import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { Redirect, withRouter } from 'react-router-dom';
import { Button, Image, Row, Col } from 'react-bootstrap';
import ReactTable from 'react-table';
import DeleteUserModal from './DeleteUserModal';
import Loading from '../Loading';
import '../../styles/ManageUsers.css';

class ManageUsers extends React.Component {
  state = {
    showDelete: false,
    selectedUser: {}
  }

  openDelete = (user) => {
    this.setState({
      showDelete: true,
      selectedUser: user
    });
  }

  closeDelete = () => {
    this.setState({showDelete: false});
  }

  deleteUser = async () => {
    const id = this.state.selectedUser.id;

    await this.props.deleteUserMutation({
      variables: {
        id
      }
    });

    this.setState({showDelete: false});
    this.props.client.resetStore();
  }

  getUsers = () => {
    let users = [];

    this.props.usersQuery.users.forEach(result => {
      let user       = {};
      user.id        = result.id;
      user.username  = result.username;
      user.email     = result.email;
      user.role      = result.role;
      user.files     = result.files;
      user.activated = result.activated;

      if (result.files[0]) {
        user.avatar = result.files[0].path;
      } else {
        user.avatar = "/avatar.png";
      }

      if (result.userprofile) {
        user.name = result.userprofile.firstname + " " + result.userprofile.lastname;
        user.phonenumber = result.userprofile.phonenumber;

      } else if (result.businessprofile) {
        user.name        = result.businessprofile.name;
        user.phonenumber = result.businessprofile.phonenumber;
      }

      users.push(user);
    })

    return users;
  }

  handleToggle = async (e) => {
    const id = e.id;
    const activated = !e.activated;

    await this.props.updateActivatedMutation ({
      variables: {
        id,
        activated
      }
    });

    this.props.client.resetStore();
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

    let users = this.getUsers();

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
        Header: () => <div><strong>Role</strong></div>,
        accessor: 'role',
        Cell: props => {
          if (props.value === 'BASEUSER') {
            return 'User';

          } else if (props.value === 'BUSINESS') {
            return 'Business';

          } else if (props.value === 'ADMIN') {
            return 'Admin';

          } else {
            return 'Undefined';
          }
        },
        width: 100
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
        }
      },
      {
        Header: () => <div><strong>Activated</strong></div>,
        accessor: 'activated',
        Cell: props => {
          if (props.value) {
            return 'Yes';
          } else {
            return 'No';
          }
        },
        width: 100
      },
      {
        Header: () => <div><strong>Actions</strong></div>,
        accessor: '',
        width: 250,
        Cell: props => {
          if (props.value.role !== "ADMIN") {
            if (props.value.activated) {
              return (
                <Row>
                  <Col md={6}>
                    <Button
                      className="action-button"
                      bsStyle="warning"
                      onClick={() => this.handleToggle(props.value)}
                    >
                    Deactivate
                    </Button>
                  </Col>
                  <Col md={6}>
                    <Button
                      className="action-button"
                      bsStyle="danger"
                      onClick={() => this.openDelete(props.value)}
                    >
                    Delete
                    </Button>
                  </Col>
                </Row>
              );
            } else {
              return (
                <Row>
                  <Col md={6}>
                    <Button
                      className="action-button"
                      bsStyle="success"
                      onClick={() => this.handleToggle(props.value)}
                    >
                    Activate
                    </Button>
                  </Col>
                  <Col md={6}>
                    <Button
                      className="action-button"
                      bsStyle="danger"
                      onClick={() => this.openDelete(props.value)}
                    >
                    Delete
                    </Button>
                  </Col>
                </Row>
              );
            }
          } else {
            return false;
          }
        }
      }
    ]

    return (
      <div id="manage-users">
        <h1>Manage Users</h1>
        <DeleteUserModal
          show={this.state.showDelete}
          close={this.closeDelete}
          user={this.state.selectedUser}
          delete={this.deleteUser}
        />
        <ReactTable
          id="users-table"
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

const UPDATE_ACTIVATED_MUTATION = gql`
  mutation toggleUserActiveMutation($id: ID!, $activated: Boolean!) {
    toggleUserActive(id: $id, activated: $activated) {
      id
    }
  }
`

const DELETE_USER_MUTATION = gql`
  mutation deleteUserMutation($id: ID!) {
    deleteUser(id: $id) {
      id
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
  graphql(UPDATE_ACTIVATED_MUTATION, {
    name: 'updateActivatedMutation',
  }),
  graphql(DELETE_USER_MUTATION, {
    name: 'deleteUserMutation',
  }),
  withRouter,
  withApollo
) (ManageUsers);
