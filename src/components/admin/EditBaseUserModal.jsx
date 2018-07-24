import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { Button, Modal } from 'react-bootstrap';
import Loading from '../Loading';
import '../../styles/Modal.css';

class EditBaseUserModal extends Component {
  state = {
    username:    this.props.user.username,
    email:       this.props.user.email,
    activated:   this.props.user.activated,
    firstname:   this.props.user.firstname,
    lastname:    this.props.user.lastname,
    phonenumber: this.props.user.phonenumber
  }

  render() {
    return (
      <Modal id="edit-user-modal" show={this.props.show} onHide={this.props.close}>
        <Modal.Header>
          <Modal.Title>Edit Base User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body" style={{"textAlign": "left"}}>
          <ul>
            <li>{this.props.user.id}</li>
            <li>{this.state.username}</li>
            <li>{this.state.email}</li>
            <li>{this.state.firstname}</li>
            <li>{this.state.lastname}</li>
            <li>{this.state.phonenumber}</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" bsStyle="success">Save</Button>
          <Button bsSize="large" onClick={this.props.close}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      username
      email
      role
      activated
      userprofile {
        firstname
        lastname
        phonenumber
      }
      businessprofile {
        name
        phonenumber
      }
    }
  }
`

export default graphql(USER_QUERY, {
  name: 'userQuery',
  options: props => ({
    variables: {
        where: {
          id: props.id
        }
      },
  }),
}) (EditBaseUserModal);

