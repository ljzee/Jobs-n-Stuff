import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import '../styles/Modal.css';

class LogoutModal extends Component {
  render() {
    return (
      <Modal id="logout-modal" show={this.props.show} onHide={this.props.close}>
        <Modal.Header>
          <Modal.Title>Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          Are you sure you want to logout?
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" bsStyle="danger" onClick={this.props.logout}>Yes</Button>
          <Button bsSize="large" onClick={this.props.close}>No</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default LogoutModal;
