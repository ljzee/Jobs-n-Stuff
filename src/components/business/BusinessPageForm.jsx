import React, { Component } from 'react';
import { Thumbnail, Col, Form, Image, Button, FormGroup, FormControl, ControlLabel, HelpBlock, Panel } from 'react-bootstrap';
import { USER_TOKEN } from '../../constants';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter, Link } from 'react-router-dom';
import Loading from '../Loading';
import { Redirect } from 'react-router';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import '../../styles/Profile.css';

const validationFields = ['email', 'username', 'firstname', 'lastname', 'phonenumber', 'avatar', 'city', 'country', 'region', 'address', 'postalcode', 'name', 'description', 'website'];
const requiredFields = ['email', 'username', 'firstname', 'lastname', 'phonenumber', 'city', 'country', 'region', 'address', 'postalcode', 'name', 'description', 'website'];
const phoneRegEx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

class BusinessPageForm extends Component {

  state = {
    email: {value: '', isValid: true, message: '', validState: null},
    username: {value: '', isValid: true, message: '', validState: null},
    firstname: {value: '', isValid: true, message: '', validState: null},
    lastname: {value: '', isValid: true, message: '', validState: null},
    name: {value: '', isValid: true, message: '', validState: null},
    description: {value: '', isValid: true, message: '', validState: null},
    phonenumber: {value: '', isValid: true, message: '', validState: null},
    website: {value: '', isValid: true, message: '', validState: null},
    postalcode: {value: '', isValid: true, message: '', validState: null},
    address: {value: '', isValid: true, message: '', validState: null},
    city: {value: '', isValid: true, message: '', validState: null},
    region: {value: '', isValid: true, message: '', validState: null},
    country: {value: '', isValid: true, message: '', validState: null},
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
      state.phonenumber.value = this.props.user.businessprofile.phonenumber;
      state.city.value = this.props.user.businessprofile.city;
      state.country.value = this.props.user.businessprofile.country;
      state.region.value = this.props.user.businessprofile.region;
      state.postalcode.value = this.props.user.businessprofile.country;
      state.address.value = this.props.user.businessprofile.address;
      state.name.value = this.props.user.businessprofile.name;
      state.description.value = this.props.user.businessprofile.description;
      state.website.value = this.props.user.businessprofile.website;
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
    const description = state.description.value;
    const website = state.website.value;
    const name = state.name.value;
    const address = state.address.value;
    const city = state.city.value;
    const region = state.region.value;
    const country = state.country.value;
    const postalcode = state.postalcode.value
    const newuser = state.isNewUser;

    const updateResult = await this.props.updateBusinessUserMutation({
      variables: {
        username,
        email,
        firstname,
        lastname,
        preferredname,
        phonenumber,
        description,
        website,
        name,
        address,
        city,
        region,
        country,
        postalcode,
        newuser
      }
    });

    const { user, errors } = updateResult.data.updatebusinessuser;

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

  selectCountry(val) {
    let state = this.state;
    state.country.value = val;
    this.setState(state);
  }

  selectRegion(val) {
    let state = this.state;
    state.region.value = val;
    this.setState(state);
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

        <FormGroup controlId="name" validationState={this.state.name.validState}>
        <Col componentClass={ControlLabel} sm={2} className="required">
        Business Name:
        </Col>
        <Col sm={10}>
        <FormControl
        type="text"
        placeholder="Business name"
        value={this.state.name.value}
        onChange={this.handleChange}
        />
        <FormControl.Feedback />
        <HelpBlock className="errormessage">{this.state.name.message}</HelpBlock>
        </Col>
        </FormGroup>

        <FormGroup controlId="description" validationState={this.state.description.validState}>
        <Col componentClass={ControlLabel} sm={2} className="required">
        Description:
        </Col>
        <Col sm={10}>
        <FormControl
        type="text"
        placeholder="Description"
        value={this.state.description.value}
        onChange={this.handleChange}
        />
        <FormControl.Feedback />
        <HelpBlock className="errormessage">{this.state.description.message}</HelpBlock>
        </Col>
        </FormGroup>

        <FormGroup controlId="website" validationState={this.state.website.validState}>
        <Col componentClass={ControlLabel} sm={2} className="required">
        Website:
        </Col>
        <Col sm={10}>
        <FormControl
        type="text"
        placeholder="Website"
        value={this.state.website.value}
        onChange={this.handleChange}
        />
        <FormControl.Feedback />
        <HelpBlock className="errormessage">{this.state.website.message}</HelpBlock>
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

        <FormGroup controlId="address" validationState={this.state.address.validState}>
        <Col componentClass={ControlLabel} sm={2} className="required">
        Street Address:
        </Col>
        <Col sm={10}>
        <FormControl
        type="text"
        placeholder="Address"
        value={this.state.address.value}
        onChange={this.handleChange}
        />
        <FormControl.Feedback />
        <HelpBlock className="errormessage">{this.state.address.message}</HelpBlock>
        </Col>
        </FormGroup>

        <FormGroup controlId="city" validationState={this.state.city.validState}>
        <Col componentClass={ControlLabel} sm={2} className="required">
        City:
        </Col>
        <Col sm={10}>
        <FormControl
        type="text"
        placeholder="City"
        value={this.state.city.value}
        onChange={this.handleChange}
        />
        <FormControl.Feedback />
        <HelpBlock className="errormessage">{this.state.city.message}</HelpBlock>
        </Col>
        </FormGroup>

        <FormGroup controlId="country" validationState={this.state.country.validState}>
        <Col componentClass={ControlLabel} sm={2} className="required">
        Country:
        </Col>
        <Col sm={10}>
        {/* <br /> */}
        <CountryDropdown
        value={this.state.country.value}
        onChange={(val) => this.selectCountry(val)} />
        <FormControl.Feedback />
        <HelpBlock className="errormessage">{this.state.country.message}</HelpBlock>
        </Col>
        </FormGroup>

        <FormGroup controlId="region" validationState={this.state.region.validState}>
        <Col componentClass={ControlLabel} sm={2} className="required">
        Region:
        </Col>
        <Col sm={10}>
        {/* <br /> */}
        <RegionDropdown
        disableWhenEmpty={true}
        country={this.state.country.value}
        value={this.state.region.value}
        onChange={(val) => this.selectRegion(val)} />
        <FormControl.Feedback />
        <HelpBlock className="errormessage">{this.state.region.message}</HelpBlock>
        </Col>
        </FormGroup>

        <FormGroup controlId="postalcode" validationState={this.state.postalcode.validState}>
        <Col componentClass={ControlLabel} sm={2} className="required">
        Locale Code:
        </Col>
        <Col sm={10}>
        <FormControl
        type="text"
        placeholder="Postal Code / Zip Code"
        value={this.state.postalcode.value}
        onChange={this.handleChange}
        />
        <FormControl.Feedback />
        <HelpBlock className="errormessage">{this.state.postalcode.message}</HelpBlock>
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
      <p>{'Business Name: ' + this.state.name.value}</p>
      <p>{'Business Description: ' + this.state.description.value}</p>
      <p>{'Business Website: ' + this.state.website.value}</p>
      <p>{'Business Phone Number: ' + this.state.phonenumber.value}</p>
      <p>{'Phone number: ' + this.state.phonenumber.value}</p>
      <p>{'Street Address: ' + this.state.address.value}</p>
      <p>{'City: ' + this.state.city.value}</p>
      <p>{'Region: ' + this.state.region.value}</p>
      <p>{'Country: ' + this.state.country.value}</p>
      <p>{'Locale Code: ' + this.state.postalcode.value}</p>
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
    role
    username
    activated
    businessprofile {
      id
      location {
        address
        city
        region
        country
        postalcode
      }
    }
  }
}
`

const UPDATE_BUSINESS_USER_MUTATION = gql`
mutation UpdateBusinessUserMutation(
  $email: String!,
  $username: String!,
  $firstname: String!,
  $lastname: String!,
  $preferredname: String,
  $newuser: Boolean!,
  $name: String!,
  $description: String!,
  $phonenumber: String!,
  $address: String!,
  $website: String!
  $city: String!,
  $country: String!,
  $region: String!,
  $postalcode: String!) {
    updatebusinessuser(
      email: $email,
      username: $username,
      firstname: $firstname,
      lastname: $lastname,
      preferredname: $preferredname,
      newuser: $newuser,
      name: $name,
      description: $description,
      phonenumber: $phonenumber,
      address: $address,
      website: $website,
      city: $city,
      country: $country,
      region: $region,
      postalcode: $postalcode,
    ) {
      user {
        id
        username
        businessprofile {
          id
          location {
            address
            country
            city
            postalcode
            region
          }
        }
      }
      errors {
        username
        email
        firstname
        lastname
        phonenumber
        name
        description
        address
        website
        city
        country
        region
        postalcode
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
    graphql(UPDATE_BUSINESS_USER_MUTATION, {
      name: 'updateBusinessUserMutation',
    }),
    graphql(UPLOAD_MUTATION, {
      name: 'uploadMutation'
    }),
    withRouter,
    withApollo
  )(BusinessPageForm)
