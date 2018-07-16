import React, { Component } from 'react';
import { Button, FormGroup, FormControl, ControlLabel, Col, Form } from 'react-bootstrap';

class BusinessApprovalRequestForm extends Component {

  constructor(props){
    super(props);
    this.state = {name: '', description: '', website: ''};
  }

  render () {
    return (
      <div className="BusinessApprovalRequest">
        <Form horizontal>
          <FormGroup controlId="formHorizontalName">
            <Col componentClass={ControlLabel} sm={2}>
              Business Name
            </Col>
            <Col sm={10}>
              <FormControl
                type="text"
                placeholder="Business Name"
                value={this.state.email}
                onChange={e=>this.setState({name: e.target.value})}
              />
            </Col>
          </FormGroup>

          <FormGroup controlId="formHorizontalDescription">
            <Col componentClass={ControlLabel} sm={2}>
              Business Description
            </Col>
            <Col sm={10}>
              <FormControl
                type="text"
                placeholder="Business Description"
                value={this.state.description}
                onChange={e=>this.setState({description: e.target.value})}
              />
            </Col>
          </FormGroup>

          <FormGroup controlId="formHorizontalWebsite">
            <Col componentClass={ControlLabel} sm={2}>
              Website
            </Col>
            <Col sm={10}>
              <FormControl
                type="text"
                placeholder="Business Website"
                value={this.state.website}
                onChange={e=>this.setState({website: e.target.value})}
              />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col smOffset={2} sm={10}>
              <Button type="submit">Request Approval</Button>
            </Col>
          </FormGroup>
        </Form>;
      </div>
    );
  }
}

export default BusinessApprovalRequestForm;
