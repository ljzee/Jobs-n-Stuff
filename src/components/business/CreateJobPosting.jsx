import React, { Component } from 'react';
import { Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';

class CreateJobPosting extends Component {

  state = {
    fields: {
      title: '',
      type: '',
      duration: '',
      streetaddress: '',
      city: '',
      province: '',
      country: '',
      postalcode: '',
      openings: '',
      description: '',
      contactname: '',
      salary: '',
      deadline: '',
    }
  }

  onSubmit = (event) => {
    event.preventDefault();
  }

  onChange = (event, field) => {
    let _fields = { ...this.state.fields };
    _fields[field] = event.target.value;
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
            value={this.state.fields.title}
            onChange={(event) => this.onChange(event, 'title')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="type" bsSize="large">
          <ControlLabel>Type</ControlLabel>
          <FormControl
            type="text"
            placeholder="Type"
            value={this.state.fields.type}
            onChange={(event) => this.onChange(event, 'type')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="duration" bsSize="large">
          <ControlLabel>Duration</ControlLabel>
          <FormControl
            type="text"
            placeholder="Duration"
            value={this.state.fields.duration}
            onChange={(event) => this.onChange(event, 'duration')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="openings" bsSize="large">
          <ControlLabel>Openings</ControlLabel>
          <FormControl
            type="text"
            placeholder="Number of openings"
            value={this.state.fields.openings}
            onChange={(event) => this.onChange(event, 'openings')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="description" bsSize="large">
          <ControlLabel>Description</ControlLabel>
          <FormControl
            type="text"
            placeholder="Description"
            value={this.state.fields.description}
            onChange={(event) => this.onChange(event, 'description')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="contactname" bsSize="large">
          <ControlLabel>Contact Name</ControlLabel>
          <FormControl
            type="text"
            placeholder="Contact Name"
            value={this.state.fields.contactname}
            onChange={(event) => this.onChange(event, 'contactname')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="salary" bsSize="large">
          <ControlLabel>Salary</ControlLabel>
          <FormControl
            type="text"
            placeholder="Salary"
            value={this.state.fields.salary}
            onChange={(event) => this.onChange(event, 'salary')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="deadline" bsSize="large">
          <ControlLabel>Deadline</ControlLabel>
          <FormControl
            type="text"
            placeholder="Deadline"
            value={this.state.fields.deadline}
            onChange={(event) => this.onChange(event, 'deadline')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="streetaddress" bsSize="large">
          <ControlLabel>Steet Address</ControlLabel>
          <FormControl
            type="text"
            placeholder="Steet Address"
            value={this.state.fields.streetaddress}
            onChange={(event) => this.onChange(event, 'streetaddress')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="city" bsSize="large">
          <ControlLabel>City</ControlLabel>
          <FormControl
            type="text"
            placeholder="City"
            value={this.state.fields.city}
            onChange={(event) => this.onChange(event, 'city')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="province" bsSize="large">
          <ControlLabel>Province</ControlLabel>
          <FormControl
            type="text"
            placeholder="Province"
            value={this.state.fields.province}
            onChange={(event) => this.onChange(event, 'province')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="country" bsSize="large">
          <ControlLabel>Country</ControlLabel>
          <FormControl
            type="text"
            placeholder="Country"
            value={this.state.fields.country}
            onChange={(event) => this.onChange(event, 'country')}
          />
          <FormControl.Feedback />
          <HelpBlock className="errormessage">Some Error!</HelpBlock>
        </FormGroup>

        <FormGroup controlId="postalcode" bsSize="large">
          <ControlLabel>Postal Code</ControlLabel>
          <FormControl
            type="text"
            placeholder="Postal Code"
            value={this.state.fields.postalcode}
            onChange={(event) => this.onChange(event, 'postalcode')}
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
