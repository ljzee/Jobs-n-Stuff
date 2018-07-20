import React, { Component } from 'react';
import { Button, FormGroup, FormControl, ControlLabel, Form } from 'react-bootstrap';
import '../styles/BusinessApprovalRequestForm.css'

class BusinessApprovalRequestForm extends Component {

  constructor(props){
    super(props);
    this.state = {name: '', description: '', phonenumber: '', address:'', website: ''};
  }

  render () {
    return (
      <div className="BusinessApprovalRequest">
        <Form horizontal>
          <FormGroup controlId="formHorizontalName">
            <ControlLabel> Business Name </ControlLabel>
            <FormControl
              type="text"
              placeholder="Business Name"
              value={this.state.email}
              onChange={e=>this.setState({name: e.target.value})}
            />
          </FormGroup>

          <FormGroup controlId="formHorizontalDescription">
            <ControlLabel> Business Description </ControlLabel>
            <FormControl
              type="text"
              placeholder="Business Description"
              value={this.state.description}
              onChange={e=>this.setState({description: e.target.value})}
            />
          </FormGroup>

          <FormGroup controlId="formHorizontalWebsite">
            <ControlLabel> Phone Number </ControlLabel>
            <FormControl
              type="text"
              placeholder="Phone Number"
              value={this.state.website}
              onChange={e=>this.setState({phonenumber: e.target.value})}
            />
          </FormGroup>

          <FormGroup controlId="formHorizontalWebsite">
            <ControlLabel> Address </ControlLabel>
            <FormControl
              type="text"
              placeholder="Address"
              value={this.state.website}
              onChange={e=>this.setState({address: e.target.value})}
            />
          </FormGroup>

          <FormGroup controlId="formHorizontalWebsite">
            <ControlLabel> Website </ControlLabel>
            <FormControl
              type="text"
              placeholder="Business Website"
              value={this.state.website}
              onChange={e=>this.setState({website: e.target.value})}
            />
          </FormGroup>

          <FormGroup>
            <Button type="submit">Request Approval</Button>
          </FormGroup>
        </Form>;
      </div>
    );
  }
}

export default BusinessApprovalRequestForm;
