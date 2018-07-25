import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import gql from 'graphql-tag';
import { compose, graphql, withApollo } from 'react-apollo';
import { Button, ControlLabel, Form, FormControl, FormGroup, HelpBlock, Modal, Radio } from 'react-bootstrap';
import '../../styles/Modal.css';

const validationFields = ['email', 'username', 'firstname', 'lastname', 'phonenumber', 'avatar'];
const requiredFields = ['email', 'username', 'firstname', 'lastname', 'phonenumber'];
const phoneRegEx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

class EditBaseUserModal extends Component {
	state = {
    email:         {value: this.props.user.email        , isValid: true, message: '', validState: null},
    username:      {value: this.props.user.username     , isValid: true, message: '', validState: null},
    firstname:     {value: this.props.user.firstname    , isValid: true, message: '', validState: null},
    preferredname: {value: this.props.user.preferredname, isValid: true, message: '', validState: null},
    lastname:      {value: this.props.user.lastname     , isValid: true, message: '', validState: null},
    phonenumber:   {value: this.props.user.phonenumber  , isValid: true, message: '', validState: null},
    activated:     {value: this.props.user.activated    , isValid: true, message: '', validState: null},
  }

  handleChange = (e) => {
    let state = this.state;
		state[e.target.id].value = e.target.value;

    if (state[e.target.id].hasOwnProperty('isValid')) state[e.target.id].isValid = true;
    if (state[e.target.id].hasOwnProperty('message')) state[e.target.id].message = '';
    if (state[e.target.id].hasOwnProperty('validState')) state[e.target.id].validState = null;

    this.setState(state);
  }

  resetValidationStates = () => {
    let state = this.state;

    for (let i = 0; i < validationFields.length; i++) {
      let key = validationFields[i];

      state[key].isValid = true;
      state[key].message = '';
      state[key].validState = null;
    }

    this.setState(state);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    //this.resetValidationStates();
    let state = this.state;

    const id            = this.props.user.id;
    const username      = state.username.value;
    const email         = state.email.value;
    const firstname     = state.firstname.value;
    const preferredname = state.preferredname.value;
    const lastname      = state.lastname.value;
    const phonenumber   = state.phonenumber.value;
    const activated     = state.activated.value;

    const updateResult = await this.props.updateUserMutation({
      variables: {
        id,
        username,
        preferredname,
        email,
        firstname,
        lastname,
        phonenumber,
        activated
      }
    });

		const { user, errors } = updateResult.data.updateuser;

    if (user === null) {

      for (let key in errors) {
        if (state.hasOwnProperty(key) && errors[key] !== '') {
          state[key].isValid = false;
          state[key].message = errors[key];
          state[key].validState = "error";
        }
      }

      this.setState(state);
    } else {
      let unformattedPhone = state.phonenumber.value;
      let formattedPhone = unformattedPhone.replace(phoneRegEx, "($1) $2-$3");

      state.phonenumber.value = formattedPhone;
      this.props.close();
		}
	}

  render() {
    return (
      <Modal id="edit-user-modal" show={this.props.show} onHide={this.props.close}>
        <Modal.Header>
          <Modal.Title>Edit Base User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form>

            <FormGroup controlId="username" validationState={this.state.username.validState}>
              <ControlLabel>Username</ControlLabel>
							<FormControl
								autoFocus
								type="text"
								value={this.state.username.value}
								onChange={this.handleChange}
							/>
							<FormControl.Feedback />
							<HelpBlock className="errormessage">{this.state.email.message}</HelpBlock>
            </FormGroup>

            <FormGroup controlId="email" validationState={this.state.email.validState}>
              <ControlLabel>Email</ControlLabel>
							<FormControl
								autoFocus
								type="text"
								value={this.state.email.value}
								onChange={this.handleChange}
							/>
							<FormControl.Feedback />
							<HelpBlock className="errormessage">{this.state.email.message}</HelpBlock>
            </FormGroup>

            <FormGroup controlId="firstname" validationState={this.state.firstname.validState}>
              <ControlLabel>First Name</ControlLabel>
							<FormControl
								autoFocus
								type="text"
								value={this.state.firstname.value}
								onChange={this.handleChange}
							/>
							<FormControl.Feedback />
							<HelpBlock className="errormessage">{this.state.firstname.message}</HelpBlock>
            </FormGroup>

            <FormGroup controlId="preferredname" validationState={this.state.preferredname.validState}>
              <ControlLabel>Preferred Name</ControlLabel>
							<FormControl
								autoFocus
								type="text"
								value={this.state.preferredname.value}
								onChange={this.handleChange}
							/>
							<FormControl.Feedback />
							<HelpBlock className="errormessage">{this.state.preferredname.message}</HelpBlock>
            </FormGroup>

            <FormGroup controlId="lastname" validationState={this.state.lastname.validState}>
              <ControlLabel>Last Name</ControlLabel>
							<FormControl
								type="text"
								value={this.state.lastname.value}
								onChange={this.handleChange}
							/>
							<FormControl.Feedback />
							<HelpBlock className="errormessage">{this.state.lastname.message}</HelpBlock>
            </FormGroup>

            <FormGroup controlId="phonenumber" validationState={this.state.phonenumber.validState}>
              <ControlLabel>Phone Number</ControlLabel>
							<FormControl
								type="text"
								placeholder="Phone number"
								value={this.state.phonenumber.value}
								onChange={this.handleChange}
							/>
							<FormControl.Feedback />
							<HelpBlock className="errormessage">{this.state.phonenumber.message}</HelpBlock>
            </FormGroup>

            <FormGroup controlId="activated">
              <ControlLabel>Activated</ControlLabel>
              <Radio name="activatedGroup"
                value={true}
                checked={this.state.activated.value === true}
                onClick={this.handleRadioChange}
              >Yes</Radio>
              <Radio name="activatedGroup"
                value={false}
                checked={this.state.activated.value === false}
                onClick={this.handleRadioChange}
              >No</Radio>
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

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUserMutation($id: ID, $email: String!, $username: String!, $firstname: String!, $lastname: String!, $preferredname: String, $phonenumber: String!, $activated: Boolean) {
    updateuser(id: $id, email: $email, username: $username, firstname: $firstname, lastname: $lastname, preferredname: $preferredname, phonenumber: $phonenumber, activated: activated) {
      user {
        username
      }
      errors {
        username
        email
        firstname
        lastname
        phonenumber
      }
    }
  }
`

export default compose(
  graphql(UPDATE_USER_MUTATION, {
    name: 'updateUserMutation',
  }),
  withRouter,
  withApollo
) (EditBaseUserModal);

