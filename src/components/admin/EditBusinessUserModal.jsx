import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import '../../styles/Modal.css';

class EditBusinessUserModal extends Component {
  state = {
    username:    this.props.user.username,
    email:       this.props.user.email,
    role:        this.props.user.role,
    activated:   this.props.user.activated,
    name:        this.props.user.name,
    phonenumber: this.props.user.phonenumber
  }


  render() {
    return (
      <Modal id="edit-user-modal" show={this.props.show} onHide={this.props.close}>
        <Modal.Header>
          <Modal.Title>Edit Business User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body" style={{"textAlign": "left"}}>
          <ul>
            <li>{this.props.user.id}</li>
            <li>{this.state.username}</li>
            <li>{this.state.email}</li>
            <li>{this.state.role}</li>
            <li>{this.state.name}</li>
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

export default EditBusinessUserModal;
