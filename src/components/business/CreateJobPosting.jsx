import React, { Component } from 'react';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';

class CreateJobPosting extends Component {

  state = {
    fields: {
      title: {value: '', isValid: true, message: '', validState: null},
      type: {value: '', isValid: true, message: '', validState: null},
      duration: {value: '', isValid: true, message: '', validState: null},
      streetaddress: {value: '', isValid: true, message: '', validState: null},
      city: {value: '', isValid: true, message: '', validState: null},
      province: {value: '', isValid: true, message: '', validState: null},
      country: {value: '', isValid: true, message: '', validState: null},
      postalcode: {value: '', isValid: true, message: '', validState: null},
      openings: {value: '', isValid: true, message: '', validState: null},
      description: {value: '', isValid: true, message: '', validState: null},
      contactname: {value: '', isValid: true, message: '', validState: null},
      salary: {value: '', isValid: true, message: '', validState: null},
      deadline: {value: '', isValid: true, message: '', validState: null},
    }
  }

  onSubmit = (event) => {
    event.preventDefault();
  }

  onChange = (event) => {
    let _fields = { ...this.state.fields };
    let updatedField = { ..._fields[event.target.id] };
    updatedField.value = event.target.value;
    _fields[event.target.id] = updatedField;
    this.setState({ fields: _fields });
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <h2 className="form-signin-heading">Create Job Posting</h2>
        <FormGroup controlId="title" bsSize="large">
          <ControlLabel>Title</ControlLabel>
          <FormControl
            autoFocus
            type="text"
            placeholder="Job Title"
            value={this.state.fields.title.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="type" bsSize="large">
          <ControlLabel>Type</ControlLabel>
          <FormControl
            type="text"
            placeholder="Type"
            value={this.state.fields.type.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="duration" bsSize="large">
          <ControlLabel>Duration</ControlLabel>
          <FormControl
            type="text"
            placeholder="Duration"
            value={this.state.fields.duration.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="openings" bsSize="large">
          <ControlLabel>Openings</ControlLabel>
          <FormControl
            type="text"
            placeholder="Number of openings"
            value={this.state.fields.openings.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="description" bsSize="large">
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            placeholder="Description"
            value={this.state.fields.description.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="contactname" bsSize="large">
          <ControlLabel>Contact Name</ControlLabel>
          <FormControl
            type="text"
            placeholder="Contact Name"
            value={this.state.fields.contactname.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="salary" bsSize="large">
          <ControlLabel>Salary</ControlLabel>
          <FormControl
            type="text"
            placeholder="Salary"
            value={this.state.fields.salary.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="deadline" bsSize="large">
          <ControlLabel>Deadline</ControlLabel>
          <FormControl
            type="text"
            placeholder="Deadline"
            value={this.state.fields.deadline.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="streetaddress" bsSize="large">
          <ControlLabel>Steet Address</ControlLabel>
          <FormControl
            type="text"
            placeholder="Steet Address"
            value={this.state.fields.streetaddress.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="city" bsSize="large">
          <ControlLabel>City</ControlLabel>
          <FormControl
            type="text"
            placeholder="City"
            value={this.state.fields.city.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="province" bsSize="large">
          <ControlLabel>Province</ControlLabel>
          <FormControl
            type="text"
            placeholder="Province"
            value={this.state.fields.province.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="country" bsSize="large">
          <ControlLabel>Country</ControlLabel>
          <FormControl
            type="text"
            placeholder="Country"
            value={this.state.fields.country.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="postalcode" bsSize="large">
          <ControlLabel>Postal Code</ControlLabel>
          <FormControl
            type="text"
            placeholder="Postal Code"
            value={this.state.fields.postalcode.value}
            onChange={this.onChange}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <Button
          type="submit"
          block
          bsSize="large"
          bsStyle="primary"
        >
          Create Job Posting
        </Button>
      </form>
    );
  }
}

export default CreateJobPosting;
