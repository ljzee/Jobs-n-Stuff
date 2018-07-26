import React, { Component } from 'react';
import { USER_TOKEN } from '../constants';
import { graphql, compose, Mutation } from 'react-apollo';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';
import { Button, FormGroup, FormControl, ControlLabel, Form } from 'react-bootstrap';
import '../styles/BusinessApprovalRequestForm.css'

class BusinessApprovalRequestForm extends Component {

  /* TODO: Update state to the current convention of utilizing value, isValid, message, validState */
  state = {
    username: {value: '', isValid: true, message: '', validState: null},
    name: {value: '', isValid: true, message: '', validState: null},
    description: {value: '', isValid: true, message: '', validState: null},
    phonenumber: {value: '', isValid: true, message: '', validState: null},
    address: {value: '', isValid: true, message: '', validState: null},
    website: {value: '', isValid: true, message: '', validState: null},
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

  // onSubmit = async (e) => {
  //   e.preventDefault();
  //   let state = this.state;
  //
  //   const name = state.name.value;
  //   const description = state.description.value;
  //   const phonenumber = state.phonenumber.value;
  //   const address = state.address.value;
  //   const website = state.website.value;
  //
  //   const updateResult = await this.props.updateBusinessUserMutation({
  //     variables: {
  //       name,
  //       description,
  //       phonenumber,
  //       address,
  //       website
  //     }
  //   });
  //
  //   const user = updateResult.data.updatebusinessuser;
  //   console.log(user);
  // }

  onClick = async (e) => {
    e.preventDefault();
  }

  render () {
    const { name, description, phonenumber, address, website } = this.state
    console.log(this.props.userQuery.user)
    return (
      <div className="BusinessApprovalRequest">
        <Form horizontal>
          <FormGroup controlId="name">
            <ControlLabel> Business Name </ControlLabel>
            <FormControl
              type="text"
              placeholder="Business Name"
              value={this.state.name.value}
              onChange={e=>this.setState({name: e.target.value})}
            />
          </FormGroup>

          <FormGroup controlId="description">
            <ControlLabel> Business Description </ControlLabel>
            <FormControl
              type="text"
              placeholder="Business Description"
              value={this.state.description.value}
              onChange={e=>this.setState({description: e.target.value})}
            />
          </FormGroup>

          <FormGroup controlId="phonenumber">
            <ControlLabel> Phone Number </ControlLabel>
            <FormControl
              type="text"
              placeholder="Phone Number"
              value={this.state.phonenumber.value}
              onChange={e=>this.setState({phonenumber: e.target.value})}
            />
          </FormGroup>

          <FormGroup controlId="address">
            <ControlLabel> Address </ControlLabel>
            <FormControl
              type="text"
              placeholder="Address"
              value={this.state.address.value}
              onChange={e=>this.setState({address: e.target.value})}
            />
          </FormGroup>

          <FormGroup controlId="website">
            <ControlLabel> Website </ControlLabel>
            <FormControl
              type="text"
              placeholder="Business Website"
              value={this.state.website.value}
              onChange={e=>this.setState({website: e.target.value})}
            />
          </FormGroup>

          {/* <Button
            type="submit"
            onClick={this.onSubmit}
            >Request Approval
          </Button> */}

          <Mutation mutation={UPDATE_BUSINESS_USER_MUTATION} variables={{ name, description, phonenumber, address, website }}>
            {updateBusinessUserMutation => <button onClick={updateBusinessUserMutation}>Request Approval</button>}
          </Mutation>
          
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
    name: 'updateBusinessUserMutation'
  }),
  withRouter,
  withApollo
)(BusinessApprovalRequestForm)
