import React, { Component } from 'react';
import { Modal, Panel, InputGroup, Radio, Checkbox, Button, FormGroup, FormControl, ControlLabel, HelpBlock, Label } from 'react-bootstrap';
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
import ReactTable from "react-table";
import 'react-table/react-table.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-quill/dist/quill.snow.css';
import '../../styles/ManagePostings.css';

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

class ManagePostings extends Component {

  state = {
    showDeleteModal: false,
    showActivateModal: false,
    activatePostingId: '',
    activatePostingTitle: '',
    deletePostingId: '',
    deletePostingTitle: '',
    editPostingId: '',
    isEditMode: false,
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

  resetState = () => {
    this.setState ({
      showDeleteModal: false,
      showActivateModal: false,
      activatePostingId: '',
      activatePostingTitle: '',
      deletePostingId: '',
      deletePostingTitle: '',
      editPostingId: '',
      isEditMode: false,
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
    });
  }

  getPostings = () => {
    let postings = []

    for (let i = 0; i < this.props.userQuery.user.businessprofile.jobpostings.length; i++) {
      postings.push(this.props.userQuery.user.businessprofile.jobpostings[i]);
    }

    return postings;
  }

  changeToEditMode = (id) => {
    let state = this.state;
    state.isNewPosting = false;
    state.isEditMode = true;
    state.editPostingId = id;
    let posting = null;

    for (let i = 0; i < this.props.userQuery.user.businessprofile.jobpostings.length; i++) {
      const p = this.props.userQuery.user.businessprofile.jobpostings[i];
      if (p.id === id) {
        posting = p;
        break;
      }
    }

    state.title.value = posting.title;
    state.description.value = posting.description;
    state.city.value = posting.location.city;
    state.region.value = posting.location.region;
    state.country.value = posting.location.country;
    state.openings.value = posting.openings;
    state.duration.value = posting.duration;
    state.contactname.value = posting.contactname;
    state.deadline.value = moment(posting.deadline).format();
    state.deadline.date = moment(posting.deadline);
    state.coverletterrequired = posting.coverletter;
    state.salary.value = (posting.salary !== null) ? posting.salary.toLocaleString("en-US", {minimumFractionDigits: 2}) : '';

    if (posting.paytype !== null) {
      state.selectedOption.pay = (posting.paytype === 'SALARY') ? 'salary' : 'hourly';
    }

    if (posting.type !== null) {
      state.selectedOption.type =  (posting.type === 'FULLTIME') ? 'full-time' : 'part-time';
    }

    this.setState(state);
  }

  openDeleteModal = (id, title) => {
    let state = this.state;
    state.showDeleteModal = true;
    state.deletePostingId = id;
    state.deletePostingTitle = title;
    this.setState(state);
  }

  closeDeleteModal = () => {
    let state = this.state;
    state.showDeleteModal = false;
    state.deletePostingId = '';
    state.deletePostingTitle = '';
    this.setState(state);
  }

  openActivateModal = (id, title) => {
    let state = this.state;
    state.showActivateModal = true;
    state.activatePostingId = id;
    state.activatePostingTitle = title;
    this.setState(state);
  }

  closeActivateModal = () => {
    let state = this.state;
    state.showActivateModal = false;
    state.activatePostingId = '';
    state.activatePostingTitle = '';
    this.setState(state);
  }

  deletePosting = async (e) => {
    e.preventDefault();
    let state = this.state;
    const id = state.deletePostingId;

    await this.props.deletePosting({
      variables: {
        id
      }
    });

    this.props.client.resetStore().then(() => {
      this.setState({
        showDeleteModal: false,
        deletePostingId: ''
      })
    });
  }

  activatePosting = async (e) => {
    e.preventDefault();
    let state = this.state;
    const id = state.activatePostingId;

    await this.props.activatePosting({
      variables: {
        id
      }
    });

    this.props.client.resetStore().then(() => {
      this.setState({
        showActivateModal: false,
        activatePostingId: ''
      })
    });
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
    const newPosting = state.isNewPosting;
    const id = state.editPostingId;
    let type = '';

    if (state.selectedOption.type === 'full-time') {
      type = 'FULLTIME';
    } else if (state.selectedOption.type === 'part-time') {
      type = 'PARTTIME';
    }

    const createPostingResult = await this.props.createOrEditPosting({
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
        newPosting,
        id,
        coverletter: state.coverletterrequired
      }
    });

    const { jobposting, errors } = createPostingResult.data.createOrEditPosting;

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
        this.resetState();
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

    if (!this.props.userQuery.user.activated) {
      return <Redirect to='/dashboard'/>;
    }

    if (this.props.userQuery.user.username !== this.props.match.params.username) {
      return <Redirect to='/dashboard'/>;
    }

    const columns = [
      {
        Header: () => <div><strong>Job Title</strong></div>,
        accessor: 'title'
      },
      {
        id: 'updatedAt',
        Header: () => <div><strong>Last Modified</strong></div>,
        width: 175,
        accessor: props => moment(props.updatedAt).format('DD/MM/YYYY h:mm a')
      },
      {
        id: 'activated',
        Header: () => <div><strong>Status</strong></div>,
        width: 125,
        accessor: props =>
        <div>
          {props.activated
            ? <Label bsStyle="success">Activated</Label>
            : <Label bsStyle="warning">Pending</Label>
          }
        </div>
      },
      {
        id: 'applications',
        Header: () => <div><strong>Applications</strong></div>,
        width: 115,
        accessor: props =>
        <div>
          {props.activated && <span>{props.applications.length}</span>}
        </div>
      },
      {
        accessor: 'id',
        Header: () => <div><strong>Actions</strong></div>,
        Cell: props =>
        <div>
          {props.original.activated
            ?
              <div>
                <a
                  className="btn btn-info"
                  role="button"
                  onClick={ () => this.props.history.push(`/job-applications/${props.value}`) }
                >
                  View Applications
                </a>
                <a
                  className="btn btn-info"
                  role="button"
                  onClick={ () => this.props.history.push(`/manage-postings/${this.props.match.params.username}/${props.value}`) }
                >
                  View Job
                </a>
              </div>
            :
              <div>
                <a
                  className="btn btn-info"
                  role="button"
                  onClick={ () => this.openActivateModal(props.value, props.original.title) }
                >
                  Activate
                </a>
                <a
                  className="btn btn-info"
                  role="button"
                  onClick={ () => this.props.history.push(`/manage-postings/${this.props.match.params.username}/${props.value}`) }
                >
                  View
                </a>
                <a
                  className="btn btn-info"
                  role="button"
                  onClick={ () => this.changeToEditMode(props.value) }
                >
                  Edit
                </a>
                <a
                  className="btn btn-info"
                  role="button"
                  onClick={ () => this.openDeleteModal(props.value, props.original.title) }
                >
                  Delete
                </a>
              </div>
          }
        </div>
      }
    ];

    let postings = this.getPostings();

    return (
      <div className="ManagePostings">
        {this.state.isEditMode
          ? <div className="CreateJobPosting">
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
                            dateFormat="DD-MM-YYYY"
                            selected={this.state.deadline.date}
                            onChange={(date) => this.setDate(date)}
                            className="btn btn-default dropdown-toggle component-field"
                            ref={(c) => this._calendar = c}
                          />
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
                          value={this.state.duration.value}
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
                          value={this.state.openings.value}
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
                  bsSize="large"
                  className="pull-right"
                  onClick={ () => {
                    this.resetState();
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
          :
            <React.Fragment>
              <h2 className="form-signin-heading">Manage Job Postings</h2>
              <Button
                type="submit"
                bsSize="large"
                bsStyle="primary"
                className="manage-postings-create-new"
                onClick={ () => {
                  this.setState({isEditMode: true});
                }}
              >
                Create New Posting
              </Button>
              <ReactTable
                className="-striped"
                data={postings}
                columns={columns}
                minRows={5}
                showPagination={false}
                noDataText='No postings found'
                style={{
                  borderRadius: "5px",
                  overflow: "hidden",
                  padding: "5px",
                  textAlign: "center"
                }}
                defaultSorted={[
                  {
                    id: "updatedAt",
                    desc: true
                  }
                ]}
              />
            </React.Fragment>
        }
        {this.state.showDeleteModal &&
          <Modal id="delete-file-modal" show={this.state.showDeleteModal} onHide={this.closeDeleteModal}>
            <Modal.Header>
              <Modal.Title>Delete - {this.state.deletePostingTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body">
              Are you sure you want to delete this job posting?
            </Modal.Body>
            <Modal.Footer>
              <Button bsSize="large" bsStyle="primary" onClick={this.deletePosting}>Yes</Button>
              <Button bsSize="large" onClick={this.closeDeleteModal}>Cancel</Button>
            </Modal.Footer>
          </Modal>
        }
        {this.state.showActivateModal &&
          <Modal id="delete-file-modal" show={this.state.showActivateModal} onHide={this.closeActivateModal}>
            <Modal.Header>
              <Modal.Title>Activate - {this.state.activatePostingTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="activate-modal-body">
              <p className="modal-medium-text">Are you sure you want to activate this job posting?</p>
              <p className="modal-small-text">
                After activation this job posting will be viewable by all users. You will no longer be able to edit or delete the job posting.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button bsSize="large" bsStyle="primary" onClick={this.activatePosting}>Yes</Button>
              <Button bsSize="large" onClick={this.closeActivateModal}>Cancel</Button>
            </Modal.Footer>
          </Modal>
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
        jobpostings {
          id
          title
          updatedAt
          type
          duration
          activated
          location {
            city
            region
            country
          }
          openings
          description
          contactname
          salary
          paytype
          deadline
          coverletter
          applications {
            id
          }
        }
      }
    }
  }
`

const DELETE_POSTING_MUATATION = gql`
  mutation DeletePosting($id: ID!) {
    deletePosting(id: $id) {
      id
    }
  }
`

const ACTIVATE_POSTING_MUATATION = gql`
  mutation ActivatePosting($id: ID!) {
    activatePosting(id: $id) {
      id
    }
  }
`

const CREATE_OR_EDIT_POSTING = gql`
  mutation CreateOrEditPosting(
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
    $coverletter: Boolean,
    $newPosting: Boolean,
    $id: ID
  ) {
    createOrEditPosting(
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
      coverletter: $coverletter,
      newPosting: $newPosting,
      id: $id
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
  graphql(DELETE_POSTING_MUATATION, {
    name: 'deletePosting'
  }),
  graphql(CREATE_OR_EDIT_POSTING, {
    name: 'createOrEditPosting'
  }),
  graphql(ACTIVATE_POSTING_MUATATION, {
    name: 'activatePosting'
  }),
  withRouter,
  withApollo
)(ManagePostings)
