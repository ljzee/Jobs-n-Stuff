import React from 'react';
import { Thumbnail, Col, Form, Image, Button, FormGroup, FormControl, ControlLabel, HelpBlock, Panel } from 'react-bootstrap';
import { USER_TOKEN } from '../../constants';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter, Link } from 'react-router-dom';
import Loading from '../Loading';
import { Redirect } from 'react-router';
import '../../styles/Profile.css';

const validationFields = ['email', 'username', 'firstname', 'lastname', 'phonenumber', 'avatar'];
const requiredFields = ['email', 'username', 'firstname', 'lastname', 'phonenumber'];
const phoneRegEx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

class UserPageForm extends React.Component {

  state = {
    email: {value: '', isValid: true, message: '', validState: null},
    username: {value: '', isValid: true, message: '', validState: null},
    firstname: {value: '', isValid: true, message: '', validState: null},
    lastname: {value: '', isValid: true, message: '', validState: null},
    phonenumber: {value: '', isValid: true, message: '', validState: null},
    preferredname: {value: ''},
    avatar: {selectedFile: null, size: 0.0, filename: '', path: '/avatar.png', isValid: true, message: '', validState: null, mimetype: ''},
    isNewUser: true,
    isEditMode: false,
    userIsMe: false
  }

  componentDidMount() {
    let state = this.state;
    state.email.value = this.props.user.email;
    state.username.value = this.props.user.username;

    for (let i = 0; i < this.props.user.files.length; i++) {
      if (this.props.user.files[i].filetype === 'PROFILEIMAGE') state.avatar.path = this.props.user.files[i].path;
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
    let state = this.state;

    switch (e.target.id) {
      case 'avatar':
        state.avatar.size = e.target.files[0].size;
        state.avatar.path = URL.createObjectURL(e.target.files[0]);
        state.avatar.selectedFile = e.target.files[0];
        state.avatar.filename = e.target.files[0].name;
        state.avatar.mimetype = e.target.files[0].type;
        break;
      default:
        state[e.target.id].value = e.target.value;
    }

    if (state[e.target.id].hasOwnProperty('isValid')) state[e.target.id].isValid = true;
    if (state[e.target.id].hasOwnProperty('message')) state[e.target.id].message = '';
    if (state[e.target.id].hasOwnProperty('validState')) state[e.target.id].validState = null;

    this.setState(state);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    let state = this.state;
    const username = state.username.value;
    const email = state.email.value;
    const firstname = state.firstname.value;
    const lastname = state.lastname.value;
    const preferredname = state.preferredname.value;
    const phonenumber = state.phonenumber.value;
    const newuser = state.isNewUser;

    const updateResult = await this.props.updateUserMutation({
      variables: {
        username,
        email,
        firstname,
        lastname,
        preferredname,
        phonenumber,
        newuser
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

      if (state.avatar.selectedFile !== null) {
        const uploadResult = await this.props.uploadMutation({
          variables: {
            file: state.avatar.selectedFile,
            size: state.avatar.size,
            filetype: 'PROFILEIMAGE',
            filename: state.avatar.filename,
            fieldId: 'avatar',
            mimetype: state.avatar.mimetype
          },
        });
        if (uploadResult.data.uploadFile.file !== null) {
          state.avatar.path = uploadResult.data.uploadFile.file.path;
          state.isNewUser = false;
          state.isEditMode = false;
          this.setState(state);
        } else {
          state.avatar.isValid = false;
          state.avatar.message = uploadResult.data.uploadFile.error.message;
          state.avatar.validState = "error";
          this.setState(state);
        }
      } else {
        state.isNewUser = false;
        state.isEditMode = false;
        this.setState(state);
      }
    }
  }

  formIsValid = () => {
    let state = this.state;

    for (let i = 0; i < validationFields.length; i++) {
      let key = validationFields[i];
      if (!state[key].isValid) return false;
    }

    return true;
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

  requiredFieldsSet = () => {
    let state = this.state;

    for (let i = 0; i < requiredFields.length; i++) {
      let key = requiredFields[i];

      if (state[key].value === '') {
        return false;
      }
    }

    return true;
  }

  buttonDisabled = () => {
    return (this.requiredFieldsSet() && this.formIsValid()) ? false : true;
  }

  render() {

    if (this.props.userQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    return (
      <div className="Profile">
        {this.state.isNewUser
          ? this.editUserForm()
          : this.state.isEditMode
            ? this.editUserForm()
            : this.userDetails()
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
            <FormGroup controlId="avatar" className="avatarUpload"  validationState={this.state.avatar.validState}>
              <Col xs={6} md={4}>
                <Thumbnail src={this.state.avatar.path} alt="avatar">
                  <h3>Profile Picture</h3>
                  <FormControl
                    type="file"
                    accept='image/*'
                    onChange={this.handleChange}
                  />
                  <FormControl.Feedback />
                  <HelpBlock className="errormessage">{this.state.avatar.message}</HelpBlock>
                </Thumbnail>
              </Col>
            </FormGroup>
          </Form>
        </Panel>
        <Button
          type="submit"
          bsSize="large"
          className="pull-right cancelbutton"
          onClick={ () => {
            this.resetValidationStates();
            this.setState({ isEditMode: !this.state.isEditMode })
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          bsSize="large"
          bsStyle="primary"
          className="pull-right savebutton"
          onClick={this.onSubmit}
          disabled={this.buttonDisabled()}
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
            {this.state.avatar.path !== '' &&
              <Image
                alt="avatar"
                src={this.state.avatar.path}
                rounded
                className="pull-right"
                responsive
              />
            }
            <p>{'Email: ' + this.state.email.value}</p>
            <p>{'Phone number: ' + this.state.phonenumber.value}</p>
            {this.props.userQuery.user.username === this.props.match.params.username &&
              <Link to={`/change-password/${this.props.user.username}`}>Change Password</Link>
            }
          </Panel.Body>
        </Panel>
        {this.props.userQuery.user.username === this.props.match.params.username &&
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

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      username
    }
  }
`

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUserMutation(
    $email: String!,
    $username: String!,
    $firstname: String!,
    $lastname: String!,
    $preferredname: String,
    $phonenumber: String!,
    $newuser: Boolean!) {
    updateuser(
      email: $email,
      username: $username,
      firstname: $firstname,
      lastname: $lastname,
      preferredname: $preferredname,
      phonenumber: $phonenumber,
      newuser: $newuser
    ) {
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

const UPLOAD_MUTATION = gql`
  mutation UploadFile($file: Upload!, $name: String, $filetype: Filetype!, $size: Float!, $filename: String!, $fieldId: String!, $mimetype: String!) {
    uploadFile(file: $file, name: $name, filetype: $filetype, size: $size, filename: $filename, fieldId: $fieldId, mimetype: $mimetype) {
      file {
        path
      }
      error {
        fieldId
        message
      }
      quotaError {
        uploadSize
        remaining
      }
    }
  }
`

export default compose(
  graphql(USER_QUERY, {
    name: 'userQuery',
    options: props => ({
      variables: {
          where: {
            id: JSON.parse(localStorage.getItem(USER_TOKEN)).id
          }
        },
    }),
  }),
  graphql(UPDATE_USER_MUTATION, {
    name: 'updateUserMutation'
  }),
  graphql(UPLOAD_MUTATION, {
    name: 'uploadMutation'
  }),
  withRouter,
  withApollo
)(UserPageForm)
