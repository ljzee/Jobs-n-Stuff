import React, { Component } from 'react';
import { USER_TOKEN } from '../../constants';
import { graphql, compose, Mutation } from 'react-apollo';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';
import { Button, FormGroup, FormControl, ControlLabel, Form } from 'react-bootstrap';
import '../..styles/BusinessApprovalRequestForm.css'

class BusinessApprovalRequestForm extends Component {

  /* TODO: Update state to the current convention of utilizing value, isValid, message, validState */
  state = {
    username: {value: '', isValid: true, message: '', validState: null},
    name: {value: '', isValid: true, message: '', validState: null},
    description: {value: '', isValid: true, message: '', validState: null},
    phonenumber: {value: '', isValid: true, message: '', validState: null},
    streetaddress: {value: '', isValid: true, message: '', validState: null},
    city: {value: '', isValid: true, message: '', validState: null},
    province: {value: '', isValid: true, message: '', validState: null},
    country: {value: '', isValid: true, message: '', validState: null}
  }

  // componentDidMount() {
  //   let state = this.state;
  //   state.name.value = this.props.user.businessprofile.name;
  //   state.description.value = this.props.user.businessprofile.description;
  //   state.phonenumber.value = this.props.user.businessprofile.phonenumber;
  //   state.address.value = this.props.user.user.businessprofile.address;
  //   state.website.value = this.props.user.user.businessprofile.website;
  //   this.setState(state);
  // }

  handleChange = (e) => {
    let state = this.state;

    state[e.target.id].value = e.target.value;

    if (state[e.target.id].hasOwnProperty('isValid')) state[e.target.id].isValid = true;
    if (state[e.target.id].hasOwnProperty('message')) state[e.target.id].message = '';
    if (state[e.target.id].hasOwnProperty('validState')) state[e.target.id].validState = null;

    this.setState(state);
  }


  onSubmit = async (e) => {
    e.preventDefault();
    let state = this.state;
  
    const name = state.name.value;
    const description = state.description.value;
    const phonenumber = state.phonenumber.value;
    const address = state.address.value;
    const website = state.website.value;
    const city = state.city.value;
    const province = state.province.value;
    const country = state.country.value;

    console.log("this is the name" + name);
    console.log("this is the des" + description);
    console.log("this is the phone" + phonenumber);
    console.log("this is the address" + address);
    console.log("this is the website" + website);
  
    const updateResult = await this.props.updateBusinessUserMutation({
      variables: {
        name,
        description,
        phonenumber,
        address,
        website,
        city,
        province,
        country
      }
    });
  
    const user = updateResult.data.updatebusinessuser;
    console.log(user);
  }

  render () {
    console.log(this.props.userQuery.user);
    return (
      <div className="BusinessApprovalRequest">
        <Form horizontal>
          <FormGroup controlId="name">
            <ControlLabel> Business Name </ControlLabel>
            <FormControl
              type="text"
              placeholder="Business Name"
              value={this.state.name.value}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="description">
            <ControlLabel> Business Description </ControlLabel>
            <FormControl
              type="text"
              placeholder="Business Description"
              value={this.state.description.value}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="phonenumber">
            <ControlLabel> Phone Number </ControlLabel>
            <FormControl
              type="text"
              placeholder="Phone Number"
              value={this.state.phonenumber.value}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="address">
            <ControlLabel> Address </ControlLabel>
            <FormControl
              type="text"
              placeholder="Address"
              value={this.state.address.value}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="website">
            <ControlLabel> Website </ControlLabel>
            <FormControl
              type="text"
              placeholder="Business Website"
              value={this.state.website.value}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="streetaddress">
            <ControlLabel> Street Address </ControlLabel>
            <FormControl
              type="text"
              placeholder="Address"
              value={this.state.streetaddress.value}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="city">
            <ControlLabel> City </ControlLabel>
            <FormControl
              type="text"
              placeholder="City"
              value={this.state.city.value}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="province">
            <ControlLabel> Province/State </ControlLabel>
            <FormControl
              type="text"
              placeholder=""
              value={this.state.province.value}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="postalcode">
            <ControlLabel> Postal Code / Zip Code </ControlLabel>
            <FormControl
              type="text"
              placeholder=""
              value={this.state.postalcode.value}
              onChange={this.handleChange}
            />
          </FormGroup>

          <FormGroup controlId="country">
            <ControlLabel> Country </ControlLabel>
            <FormControl
              type="text"
              placeholder="Business Website"
              value={this.state.country.value}
              onChange={this.handleChange}
            />
          </FormGroup>

          <Button
            type="submit"
            onClick={this.onSubmit}
            >Request Approval
          </Button>
          
        </Form>
      </div>
    );
  }
}

{/* TODO: Add graphql mutation for updating the business information*/}

const USER_QUERY = gql`
query UserQuery($where: UserWhereUniqueInput!) {
  user(where: $where) {
    id
    businessprofile {
      name
      description
      phonenumber
      address
      website
    }
  }
}
`

const UPDATE_BUSINESS_USER_MUTATION = gql`
mutation UpdateBusinessUserMutation($name: String!, $description: String!, $phonenumber: String!, $address: String!, $website: String!) {
  updatebusinessuser(name: $name, description: $description, phonenumber: $phonenumber, address: $address, website: $website) {
    user {
      id
    }
  }
}
`

// const UPDATE_LOCATION_MUTATION = gql`

// `

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
  withRouter,
  withApollo
)(BusinessApprovalRequestForm)
