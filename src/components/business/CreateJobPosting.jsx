import React, { Component } from 'react';
import { Panel, InputGroup, Radio, Checkbox, Button, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import { USER_TOKEN } from '../../constants';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from '../Loading';
import { Redirect } from 'react-router';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import NumericInput from 'react-numeric-input';
import ReactQuill from 'react-quill';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/CreateJobPosting.css';
import 'react-quill/dist/quill.snow.css';

const requiredFields = ['title', 'description', 'deadline', 'city', 'country', 'region'];
const validationFields = [
  'title',
  'description',
  'deadline',
  'city',
  'country',
  'region',
  'duration',
  'openings',
  'salary'
]

class CreateJobPosting extends Component {

  state = {
    title: {value: '', isValid: true, message: '', validState: null},
    duration: {value: '', isValid: true, message: '', validState: null},
    city: {value: '', isValid: true, message: '', validState: null},
    region: {value: '', isValid: true, message: '', validState: null},
    country: {value: '', isValid: true, message: '', validState: null},
    openings: {value: '', isValid: true, message: '', validState: null},
    description: {value: '', isValid: true, message: '', validState: null},
    contactname: {value: '', isValid: true, message: '', validState: null},
    salary: {value: '', isValid: true, message: '', validState: null},
    deadline: {date: moment(), value: `${moment().format()}`, isValid: true, message: '', validState: null},
    coverletterrequired: false,
    selectedOption: {type: '', pay: 'hourly'},
    paytype: '',
    isNewPosting: true
  }

  handleChange = (e) => {
    let state = this.state;
    state[e.target.id].value = e.target.value;
    state[e.target.id].message = '';
    state[e.target.id].validState = null;
    state[e.target.id].isValid = true;

    this.setState(state);
  }

  handleOptionChange = ({ target }) => {
    let state = this.state;
    let key = '';

    if (target.name === 'full-time' || target.name === 'part-time') {
      key = 'type';
    } else {
      key = 'pay';
      state.paytype = (target.name === 'hourly') ? 'HOURLY' : 'SALARY';
    }

    state.selectedOption[key] = target.name;
    this.setState(state);
  }

  handleCheckboxChange = ({ target }) => {
    let state = this.state;

    state[target.name] = target.checked;

    this.setState(state);
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

  setDate(val) {
    let state = this.state;
    state.deadline.isValid = true;
    state.deadline.validState = null;
    state.deadline.message = '';
    state.deadline.date = val;
    state.deadline.value = val.format();
    this.setState(state);
  }

  setDuration(val) {
    let state = this.state;
    state.duration.isValid = true;
    state.duration.validState = null;
    state.duration.message = '';
    state.duration.value = val;
    this.setState(state);
  }

  setOpenings(val) {
    let state = this.state;
    state.openings.isValid = true;
    state.openings.validState = null;
    state.openings.message = '';
    state.openings.value = val;
    this.setState(state);
  }

  setDescription(val) {
    let state = this.state;
    state.description.isValid = true;
    state.description.validState = null;
    state.description.message = '';
    state.description.value = val;
    this.setState(state);
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

  formIsValid = () => {
    let state = this.state;

    for (let i = 0; i < validationFields.length; i++) {
      let key = validationFields[i];
      if (!state[key].isValid) return false;
    }

    return true;
  }

  buttonDisabled = () => {
    return (this.requiredFieldsSet() && this.formIsValid()) ? false : true;
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.resetValidationStates();
    let state = this.state;
    const title = state.title.value;
    const description = state.description.value;
    const duration = state.duration.value;
    const city = state.city.value;
    const region = state.region.value;
    const country = state.country.value;
    const openings = state.openings.value;
    const contactname = state.contactname.value;
    const salary = state.salary.value;
    const paytype = (state.selectedOption.pay === 'hourly') ? 'HOURLY' : 'SALARY';
    const deadline = state.deadline.value;
    let type = '';

    if (state.selectedOption.type === 'full-time') {
      type = 'FULLTIME';
    } else if (state.selectedOption.type === 'part-time') {
      type = 'PARTTIME';
    }

    const createPostingResult = await this.props.createPosting({
      variables: {
        title,
        description,
        type,
        duration,
        city,
        region,
        country,
        openings,
        contactname,
        salary,
        paytype,
        deadline,
        coverletter: state.coverletterrequired
      }
    });

    const { jobposting, errors } = createPostingResult.data.createPosting;

    if (jobposting === null) {

      for (let key in errors) {
        if (state.hasOwnProperty(key) && errors[key] !== '') {
          state[key].isValid = false;
          state[key].message = errors[key];
          state[key].validState = "error";
        }
      }

      this.setState(state);
    } else {
      this.props.client.resetStore().then(() => {
        this.props.history.push(`/manage-postings/${this.props.userQuery.user.username}`);
      });

    }
  }

  render() {

    if (this.props.userQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    if (this.props.userQuery.user.role !== 'BUSINESS') {
      return <Redirect to='/dashboard'/>;
    }

    return (
      <div className="CreateJobPosting">
        <form onSubmit={this.onSubmit}>
          <h2 className="form-signin-heading">{this.state.isNewPosting ? 'Create Job Posting' : 'Edit Job Posting'}</h2>
          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">Required Fields</Panel.Title>
            </Panel.Heading>
            <div className="panel-form">
              <FormGroup controlId="title" bsSize="large" validationState={this.state.title.validState}>
                <ControlLabel className="required">Title</ControlLabel>
                  <FormControl
                    autoFocus
                    type="text"
                    placeholder="Job Title"
                    value={this.state.title.value}
                    onChange={this.handleChange}
                  />
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.title.message}</HelpBlock>
              </FormGroup>

              <FormGroup controlId="description" bsSize="large" validationState={this.state.description.validState}>
                <ControlLabel className="required">Description</ControlLabel>
                <HelpBlock className="errormessage">{this.state.description.message}</HelpBlock>
                <div className="description-text-area">
                  <ReactQuill
                    value={this.state.description.value}
                    style={{ height: 400 }}
                    onChange={(val) => this.setDescription(val)}
                  />
                </div>
                <br />
                <FormControl.Feedback />
              </FormGroup>

              <FormGroup controlId="deadline" bsSize="large" validationState={this.state.deadline.validState}>
                <ControlLabel className="required">Application Deadline</ControlLabel>
                <div className="job-posting-input-small">
                  <InputGroup>
                    <DatePicker
                      readOnly
                      selected={this.state.deadline.date}
                      onChange={(date) => this.setDate(date)}
                      ref={(c) => this._calendar = c}
                    />
                    <InputGroup.Addon><i className="fa fa-calendar" onClick={() => this._calendar.setOpen(true)}/></InputGroup.Addon>
                  </InputGroup>
                </div>
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.deadline.message}</HelpBlock>
              </FormGroup>

              <FormGroup controlId="city" bsSize="large" validationState={this.state.city.validState}>
                <ControlLabel className="required">City</ControlLabel>
                <FormControl
                  type="text"
                  placeholder="City"
                  value={this.state.city.value}
                  onChange={this.handleChange}
                />
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.city.message}</HelpBlock>
              </FormGroup>

              <FormGroup controlId="country" bsSize="large" validationState={this.state.country.validState}>
                <ControlLabel className="required">Country</ControlLabel>
                <br />
                <CountryDropdown
                  value={this.state.country.value}
                  onChange={(val) => this.selectCountry(val)} />
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.country.message}</HelpBlock>
              </FormGroup>

              <FormGroup controlId="region" bsSize="large" validationState={this.state.region.validState}>
                <ControlLabel className="required">Region</ControlLabel>
                <br />
                <RegionDropdown
                  disableWhenEmpty={true}
                  country={this.state.country.value}
                  value={this.state.region.value}
                  onChange={(val) => this.selectRegion(val)} />
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.region.message}</HelpBlock>
              </FormGroup>
            </div>
          </Panel>
          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">Optional Fields</Panel.Title>
            </Panel.Heading>
            <div className="panel-form">
              <FormGroup controlId="duration" bsSize="large" validationState={this.state.duration.validState}>
                <ControlLabel>Duration</ControlLabel>
                <br />
                <HelpBlock>Enter the duration of the position in months.</HelpBlock>
                <div className="job-posting-input-xsmall">
                  <NumericInput
                    className="form-control"
                    placeholder="Duration"
                    onChange={(val) => this.setDuration(val)}/>
                </div>
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.duration.message}</HelpBlock>
              </FormGroup>

              <FormGroup controlId="openings" bsSize="large" validationState={this.state.openings.validState}>
                <ControlLabel>Openings</ControlLabel>
                <br />
                <HelpBlock>Enter the number of openings for the position.</HelpBlock>
                <div className="job-posting-input-xsmall">
                  <NumericInput
                    className="form-control"
                    placeholder="Openings"
                    onChange={(val) => this.setOpenings(val)}/>
                </div>
                <FormControl.Feedback />
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.openings.message}</HelpBlock>
              </FormGroup>

              <FormGroup controlId="contactname" bsSize="large" validationState={this.state.contactname.validState}>
                <ControlLabel>Contact Name</ControlLabel>
                <FormControl
                  type="text"
                  placeholder="Contact Name"
                  value={this.state.contactname.value}
                  onChange={this.handleChange}
                />
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.contactname.message}</HelpBlock>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Type of Position</ControlLabel>
                <br />
                <Radio
                  inline
                  checked={this.state.selectedOption.type==='full-time'}
                  name='full-time'
                  onChange={this.handleOptionChange}
                >
                  Full Time
                </Radio>{' '}
                <Radio
                  inline
                  checked={this.state.selectedOption.type==='part-time'}
                  name='part-time'
                  onChange={this.handleOptionChange}
                >
                  Part Time
                </Radio>{' '}
              </FormGroup>

              <FormGroup>
                <ControlLabel>Pay Type</ControlLabel>
                <br />
                <Radio
                  inline
                  checked={this.state.selectedOption.pay==='hourly'}
                  name='hourly'
                  onChange={this.handleOptionChange}
                >
                  Hourly
                </Radio>{' '}
                <Radio
                  inline
                  checked={this.state.selectedOption.pay==='salary'}
                  name='salary'
                  onChange={this.handleOptionChange}
                >
                  Salary
                </Radio>{' '}
              </FormGroup>

              <FormGroup controlId="salary" bsSize="large" validationState={this.state.salary.validState}>
                <div className="job-posting-input-small">
                  <InputGroup>
                    <InputGroup.Addon>$</InputGroup.Addon>
                    <FormControl
                      type="text"
                      placeholder={this.state.selectedOption.pay === 'hourly' ? 'Hourly wage' : 'Salary'}
                      value={this.state.salary.value}
                      onChange={this.handleChange}
                    />
                  </InputGroup>
                </div>
                <FormControl.Feedback />
                <HelpBlock className="errormessage">{this.state.salary.message}</HelpBlock>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Required Files</ControlLabel>
                <HelpBlock>
                  All job postings require a resume to be submitted by applicants. Please check the box below if a cover letter is also required.
                </HelpBlock>
                <Checkbox
                  name='coverletterrequired'
                  checked={this.state.coverletterrequired}
                  onChange={this.handleCheckboxChange}
                >
                  Cover Letter Required
                </Checkbox>
              </FormGroup>
            </div>
          </Panel>
          <Button
            type="submit"
            bsSize="large"
            className="pull-right cancelbutton"
            onClick={ () => {
              this.resetValidationStates();
              this.props.history.push(`/manage-postings/` + this.props.userQuery.user.username);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            block
            bsSize="large"
            bsStyle="primary"
            className="job-posting-submit-button pull-right"
            disabled={this.buttonDisabled()}
          >
            {this.state.isNewPosting ?  'Create Job Posting' : 'Save'}
          </Button>
        </form>
      </div>
    );
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      username
      role
    }
  }
`

const CREATE_POSTING = gql`
  mutation CreatePosting(
    $title: String,
    $type: String,
    $duration: String,
    $city: String,
    $region: String,
    $country: String,
    $openings: String,
    $description: String,
    $contactname: String,
    $salary: String
    $paytype: PayType,
    $deadline: String,
    $coverletter: Boolean
  ) {
    createPosting(
      title: $title,
      type: $type,
      duration: $duration,
      city: $city,
      region: $region,
      country: $country,
      openings: $openings,
      description: $description,
      contactname: $contactname,
      salary: $salary
      paytype: $paytype,
      deadline: $deadline,
      coverletter: $coverletter
    ) {
      jobposting {
        id
      }
      errors {
        title
        duration
        city
        region
        country
        openings
        description
        salary
        deadline
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
  graphql(CREATE_POSTING, {
    name: 'createPosting'
  }),
  withRouter,
  withApollo
)(CreateJobPosting)
