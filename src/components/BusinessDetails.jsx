import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AUTH_TOKEN, USER_TOKEN } from '../constants';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';

import BusinessDetailsForm from './BusinessDetailsForm';
import BusinessApprovalRequestForm from './BusinessApprovalRequestForm';
import Loading from './Loading';

const userToken = localStorage.getItem(USER_TOKEN)
const authToken = localStorage.getItem(AUTH_TOKEN)

class BusinessDetail extends Component {

    /* TODO: Update state to the current convention of utilizing value, isValid, message, validState */
    state = {
      name: '',
      description: '',
      phonenumber: '',
      address:'',
      website: ''
    }

    render () {
      return (
        <div className="BusinessApprovalRequest">
          <Form horizontal>
            <FormGroup controlId="name">
              <ControlLabel> Business Name </ControlLabel>
              <FormControl
                type="text"
                placeholder="Business Name"
                value={this.state.email}
                onChange={e=>this.setState({name: e.target.value})}
              />
            </FormGroup>

            <FormGroup controlId="description">
              <ControlLabel> Business Description </ControlLabel>
              <FormControl
                type="text"
                placeholder="Business Description"
                value={this.state.description}
                onChange={e=>this.setState({description: e.target.value})}
              />
            </FormGroup>

            <FormGroup controlId="phonenumber">
              <ControlLabel> Phone Number </ControlLabel>
              <FormControl
                type="text"
                placeholder="Phone Number"
                value={this.state.website}
                onChange={e=>this.setState({phonenumber: e.target.value})}
              />
            </FormGroup>

            <FormGroup controlId="address">
              <ControlLabel> Address </ControlLabel>
              <FormControl
                type="text"
                placeholder="Address"
                value={this.state.website}
                onChange={e=>this.setState({address: e.target.value})}
              />
            </FormGroup>

            <FormGroup controlId="website">
              <ControlLabel> Website </ControlLabel>
              <FormControl
                type="text"
                placeholder="Business Website"
                value={this.state.website}
                onChange={e=>this.setState({website: e.target.value})}
              />
            </FormGroup>

              <Button type="submit">Request Approval</Button>
          </Form>
        </div>
      );
    }
  }

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      activated
    }
  }
`

export default compose(
  graphql(USER_QUERY, {
    name: 'userQuery',
    options: props => ({
      variables: {
          where: {
            id:JSON.parse(userToken).id
          }
        },
    }),
  }),
  withRouter,
  withApollo
)(BusinessDetails)
