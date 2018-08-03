import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import '../../styles/Modal.css';

class ActivateUserModal extends Component {
  render() {
    return (
      <Modal id="activate-modal" show={this.props.show} onHide={this.props.close}>
        <Modal.Header>
          <Modal.Title>Confirm User {this.props.user.activated ? "Deactivation" : "Activation"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <p>Are you sure you want to {this.props.user.activated ? "deactivate" : "activate"} user {this.props.user.username}?</p>
        </Modal.Body>
        <Modal.Footer>
          {this.props.user.activated
            ?  <Button
                 className="modal-button"
                 bsSize="large"
                 bsStyle="warning"
                 onClick={this.props.activate}
               >
               Yes
               </Button>
            :  <Button
                 className="modal-button"
                 bsSize="large"
                 bsStyle="success"
                 onClick={this.props.activate}
               >
               Yes
               </Button>
          }

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

export default ActivateUserModal;
