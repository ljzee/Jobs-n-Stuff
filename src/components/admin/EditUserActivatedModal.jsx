import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import { compose, graphql, withApollo } from 'react-apollo';
import { Button, ControlLabel, Form, FormGroup, Modal, Radio } from 'react-bootstrap';
import '../../styles/Modal.css';

class EditUserActivatedModal extends Component {
  state = {
    activated: this.props.user.activated
  }

  handleChange = (e) => {
    this.setState({ activated: e });
  }

  onSubmit = async (e) => {
    e.preventDefault();
    const id = this.props.user.id;
    const activated = this.state.activated;

    const updatedUser = await this.props.updateActivatedMutation ({
      variables: {
        id,
        activated
      }
    });

    if (updatedUser) {
      this.props.close();
    }
  }

  render() {
    return (
      <Modal id="edit-user-modal" show={this.props.show} onHide={this.props.close}>
        <Modal.Header>
          <Modal.Title>Set User Active State</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form>
            <FormGroup controlId="activated">
              <ControlLabel>Activate State</ControlLabel>
              <Radio name="activatedGroup"
                checked={this.state.activated === true}
                onChange={this.handleChange.bind(this, true)}
              >Activated</Radio>
              <Radio name="activatedGroup"
                checked={this.state.activated === false}
                onChange={this.handleChange.bind(this, false)}
              >Unactivated</Radio>
            </FormGroup>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsSize="large" bsStyle="success" onClick={this.onSubmit}>Save</Button>
          <Button bsSize="large" onClick={this.props.close}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const UPDATE_ACTIVATED_MUTATION = gql`
  mutation toggleUserActiveMutation($id: ID!, $activated: Boolean!) {
    toggleUserActive(id: $id, activated: $activated) {
      id
    }
  }
`

export default compose(
  graphql(UPDATE_ACTIVATED_MUTATION, {
    name: 'updateActivatedMutation',
  }),
  withRouter,
  withApollo
) (EditUserActivatedModal);

