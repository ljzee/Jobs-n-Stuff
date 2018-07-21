import React, { Component } from 'react';
import { Button, FormGroup, FormControl, ControlLabel, Form } from 'react-bootstrap';
import '../styles/BusinessApprovalRequestForm.css'

class BusinessApprovalRequestForm extends Component {


  {/* TODO: Update state to the current convention of utilizing value, isValid, message, validState */}
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

{/* TODO: Add graphql mutation for updating the business information*/}

export default BusinessApprovalRequestForm;
