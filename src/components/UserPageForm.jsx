import React from 'react';
import { Thumbnail, Col, Form, Image, Button, FormGroup, FormControl, ControlLabel, HelpBlock, Panel } from 'react-bootstrap';
import { USER_TOKEN } from '../constants';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import validator from 'validator';
import '../styles/Profile.css';

class UserPageForm extends React.Component {

  state = {
    email: {value: '', isValid: true, message: '', validState: null},
    username: {value: '', isValid: true, message: '', validState: null},
    firstname: {value: '', isValid: true, message: '', validState: null},
    lastname: {value: '', isValid: true, message: '', validState: null},
    phonenumber: {value: '', isValid: true, message: '', validState: null},
    preferredname: {value: ''},
    selectedFile: null,
    avatarPath: '/avatar.png',
    isNewUser: true,
    isEditMode: false,
    fileType: ''
  }

  componentDidMount() {
    var state = this.state;
    state.email.value = this.props.user.email;
    state.username.value = this.props.user.username;

    for (var i = 0; i < this.props.user.files.length; i++) {
      state.avatarPath = this.props.user.files[i].path;
    }

    if (this.props.user.userprofile !== null && this.props.user.userprofile.firstname !== '') {
      state.firstname.value = this.props.user.userprofile.firstname;
      state.lastname.value = this.props.user.userprofile.lastname;
      state.preferredname.value = this.props.user.userprofile.preferredname;
      state.phonenumber.value = this.props.user.userprofile.phonenumber;
      state.isNewUser = false;
    }

    this.setState(state);
  }

  handleChange = (e) => {
    var state = this.state;

    switch (e.target.id) {
      case 'avatarImage':
        state.avatarPath = URL.createObjectURL(e.target.files[0]);
        state.selectedFile = e.target.files[0];
        state.fileType = 'PROFILEIMAGE';
        break;
      default:
        state[e.target.id].value = e.target.value;
        if (state[e.target.id].hasOwnProperty('message')) state[e.target.id].message = '';
        if (state[e.target.id].hasOwnProperty('validState')) state[e.target.id].validState = null;
    }

    this.setState(state);
  }

  isUserMyself = () => {
    return JSON.parse(localStorage.getItem(USER_TOKEN)).id === this.props.user.id;
  }

  updateUser = async (username, email, firstname, lastname, preferredname, phonenumber) => {
    var state = this.state;
    const username_password_re = new RegExp("Username in use.Email in use.$");
    const username_re = new RegExp("Username in use.$");
    const email_re = new RegExp("Email in use.$");
    await this.props.updateUser({
      variables: {
        username,
        email,
        firstname,
        lastname,
        preferredname,
        phonenumber
      }
    })
    .then(async (result) => {
      if (this.formIsValid()) {
        var file = null;
        if (this.state.selectedFile !== null) {
          file = await this.props.uploadMutation({
            variables: {
              file: this.state.selectedFile,
              filetype: this.state.fileType
            },
          });
        }
        state.avatarPath = (file !== null) ? file.data.uploadFile.path : '/avatar.png';
        state.isNewUser = false;
        state.isEditMode = false;
        this.setState(state);
      }
    })
    .catch((Error) => {
      const msg = Error.message;
      if (username_password_re.test(msg)) {
        state.email.isValid = false;
        state.email.message = 'Email is already in use';
        state.email.validState = "error";
        state.username.isValid = false;
        state.username.message = 'Username is already in use';
        state.username.validState = "error";
        this.setState(state);
      } else if (username_re.test(msg)) {
        state.username.isValid = false;
        state.username.message = 'Username is already in use';
        state.username.validState = "error";
        this.setState(state);
      } else if (email_re.test(msg)) {
        state.email.isValid = false;
        state.email.message = 'Email is already in use';
        state.email.validState = "error";
        this.setState(state);
      } else {
        throw Error;
      }
    });
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    var state = this.state;

    this.setFormErrorStates();

    if (state.email.isValid
          && state.username.isValid
          && state.firstname.isValid
          && state.lastname.isValid
          && state.phonenumber.isValid) {
      this.updateUser(
        state.username.value,
        state.email.value,
        state.firstname.value,
        state.lastname.value,
        state.preferredname.value,
        state.phonenumber.value
      );
    }
  }

  setFormErrorStates = () => {
    var state = this.state;
    var phoneReg = new RegExp("([0-9]{3})-([0-9]{3})-([0-9]{4})");

    if (state.email.isValid && state.email.value === '') {
      state.email.isValid = false;
      state.email.message = 'Please enter an email address';
      state.email.validState = "error";
      this.setState(state);
    }

    if (state.email.isValid && !validator.isEmail(state.email.value)) {
      state.email.isValid = false;
      state.email.message = 'Not a valid email address';
      state.email.validState = "error";
      this.setState(state);
    }

    if (state.username.isValid && state.username.value === '') {
      state.username.isValid = false;
      state.username.message = 'Please enter a username';
      state.username.validState = "error";
      this.setState(state);
    }

    if (state.firstname.value === '') {
      state.firstname.isValid = false;
      state.firstname.message = 'Please enter your first name';
      state.firstname.validState = "error";
      this.setState(state);
    }

    if (state.lastname.value === '') {
      state.lastname.isValid = false;
      state.lastname.message = 'Please enter your last name';
      state.lastname.validState = "error";
      this.setState(state);
    }

    if (state.phonenumber.value === '') {
      state.phonenumber.isValid = false;
      state.phonenumber.message = 'Please enter your phone number';
      state.phonenumber.validState = "error";
      this.setState(state);
    }

    if(state.phonenumber.isValid && !phoneReg.test(state.phonenumber.value)) {
      state.phonenumber.isValid = false;
      state.phonenumber.message = 'Please enter phone number in XXX-XXX-XXXX format';
      state.phonenumber.validState = "error";
      this.setState(state);
    }
  }

  formIsValid = () => {
    var state = this.state;

    for (var key in state) {
      if (state[key] !== null && state[key].hasOwnProperty('isValid') && !state[key].isValid) return false;
    }

    return true;
  }

  resetValidationStates = () => {
    var state = this.state;

    state.username.isValid = true;
    state.username.message = '';
    state.username.validState = null;

    state.email.isValid = true;
    state.email.message = '';
    state.email.validState = null;

    state.firstname.isValid = true;
    state.firstname.message = '';
    state.firstname.validState = null;

    state.lastname.isValid = true;
    state.lastname.message = '';
    state.lastname.validState = null;

    state.phonenumber.isValid = true;
    state.phonenumber.message = '';
    state.phonenumber.validState = null;

    this.setState(state);
  }

  render() {
    return (
      <div className="Profile">
        {this.state.isNewUser
          ? this.editUserForm()
          : <div>
              {this.state.isEditMode
                ? this.editUserForm()
                : this.userDetails()
              }
            </div>
        }
      </div>
    );
  }

  editUserForm  = () => {
    return (
      <div className="EditProfile">
        <h2>
          {this.state.isNewUser
            ? 'Create Profile'
            : 'Edit Profile'}
        </h2>
        <Panel>
          <Panel.Heading>
            <Panel.Title componentClass="h3">Profile</Panel.Title>
          </Panel.Heading>
          <Form horizontal>
            {!this.state.isNewUser &&
              <div>
                <FormGroup controlId="username" validationState={this.state.username.validState}>
                  <Col componentClass={ControlLabel} sm={2} className="required">
                    Username:
                  </Col>
                  <Col sm={10}>
                    <FormControl
                      type="text"
                      placeholder="Username"
                      value={this.state.username.value}
                      onChange={this.handleChange}
                    />
                    <FormControl.Feedback />
                    <HelpBlock className="errormessage">{this.state.username.message}</HelpBlock>
                  </Col>
                </FormGroup>
                <FormGroup controlId="email" validationState={this.state.email.validState}>
                  <Col componentClass={ControlLabel} sm={2} className="required">
                    Email:
                  </Col>
                  <Col sm={10}>
                    <FormControl
                      type="text"
                      placeholder="Email"
                      value={this.state.email.value}
                      onChange={this.handleChange}
                    />
                    <FormControl.Feedback />
                    <HelpBlock className="errormessage">{this.state.email.message}</HelpBlock>
                  </Col>
                </FormGroup>
              </div>
            }
            <FormGroup controlId="firstname" validationState={this.state.firstname.validState}>
              <Col componentClass={ControlLabel} sm={2} className="required">
                First Name:
              </Col>
              <Col sm={10}>
                <FormControl
                  autoFocus
                  type="text"
                  placeholder="First name"
                  value={this.state.firstname.value}
                  onChange={this.handleChange}
                />
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.firstname.message}</HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup controlId="preferredname" validationState={null}>
              <Col componentClass={ControlLabel} sm={2}>
                Preferred Name:
              </Col>
              <Col sm={10}>
                <FormControl
                  type="text"
                  placeholder="Preferred name"
                  value={this.state.preferredname.value}
                  onChange={this.handleChange}
                />
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{''}</HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup controlId="lastname" validationState={this.state.lastname.validState}>
              <Col componentClass={ControlLabel} sm={2} className="required">
                Last Name:
              </Col>
              <Col sm={10}>
                <FormControl
                  type="text"
                  placeholder="Last name"
                  value={this.state.lastname.value}
                  onChange={this.handleChange}
                />
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.lastname.message}</HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup controlId="phonenumber" validationState={this.state.phonenumber.validState}>
              <Col componentClass={ControlLabel} sm={2} className="required">
                Phone number:
              </Col>
              <Col sm={10}>
                <FormControl
                  type="text"
                  placeholder="Phone number"
                  value={this.state.phonenumber.value}
                  onChange={this.handleChange}
                />
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.phonenumber.message}</HelpBlock>
              </Col>
            </FormGroup>
            <p className="requiredhelptext">Required field</p><br />
            <FormGroup controlId="avatarImage" className="avatarUpload">
              <Col xs={6} md={4}>
                <Thumbnail src={this.state.avatarPath} alt="150x150">
                  <h3>Profile Picture</h3>
                  <FormControl
                    type="file"
                    accept='image/*'
                    onChange={this.handleChange}
                  />
                </Thumbnail>
              </Col>
            </FormGroup>
          </Form>
        </Panel>
        <Button
          type="submit"
          bsSize="large"
          bsStyle="primary"
          className="pull-right"
          onClick={this.onSubmit}
        >
          Save
        </Button>
      </div>
    );
  }

  userDetails  = () => {
    return (
      <div className="UserDetails">
        <h1>
          {(this.state.preferredname.value !== '') ? this.state.preferredname.value : this.state.firstname.value}{' '}
          {this.state.lastname.value}
        </h1>
        <Panel>
          <Panel.Heading>
            <Panel.Title componentClass="h3">Profile</Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            {this.state.avatarPath !== '' &&
              <Image
                alt="150x150"
                src={this.state.avatarPath}
                rounded
                className="pull-right"
                responsive
              />
            }
            <p>{'Email: ' + this.state.email.value}</p>
            <p>{'Phone number: ' + this.state.phonenumber.value}</p>
          </Panel.Body>
        </Panel>
        {this.isUserMyself &&
          <Button
            type="submit"
            bsSize="large"
            bsStyle="primary"
            className="pull-right"
            onClick={ () => this.setState({ isEditMode: !this.state.isEditMode })}
          >
            Edit Profile
          </Button>
        }
      </div>
    );
  }
}

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUserMutation($email: String!, $username: String!, $firstname: String!, $lastname: String!, $preferredname: String, $phonenumber: String!) {
    updateuser(email: $email, username: $username, firstname: $firstname, lastname: $lastname, preferredname: $preferredname, phonenumber: $phonenumber) {
      id
    }
  }
`

const UPLOAD_MUTATION = gql`
  mutation uploadFile($file: Upload!, $name: String, $filetype: Filetype!) {
    uploadFile(file: $file, name: $name, filetype: $filetype) {
      id
      path
    }
  }
`

export default compose(
  graphql(UPDATE_USER_MUTATION, {
    name: 'updateUser',
  }),
  graphql(UPLOAD_MUTATION, {
    name: 'uploadMutation'
  }),
  withRouter,
  withApollo
)(UserPageForm)
