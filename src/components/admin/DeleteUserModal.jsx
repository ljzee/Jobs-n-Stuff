import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import '../../styles/Modal.css';

class DeleteUserModal extends Component {
  render() {
    return (
      <Modal id="delete-user-modal" show={this.props.show} onHide={this.props.close}>
        <Modal.Header>
          <Modal.Title>Confirm User Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <p>Are you sure you want to delete user {this.props.user.username}?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="modal-button"
            bsSize="large"
            bsStyle="danger"
            onClick={this.props.delete}
          >
          Yes
          </Button>

          <Button
            className="modal-button"
            bsSize="large"
            onClick={this.props.close}
          >
            No
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DeleteUserModal;
