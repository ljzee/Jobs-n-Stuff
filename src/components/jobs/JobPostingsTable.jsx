import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { Button, Col, ControlLabel, FormControl, FormGroup, InputGroup, Label, Panel, Radio, Row } from 'react-bootstrap';
import CreatableSelect from 'react-select';
import DatePicker from 'react-datepicker';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import NumericInput from 'react-numeric-input';
import ReactTable from 'react-table';
import Loading from '../Loading';
import { Redirect } from 'react-router';
import moment from 'moment';
import { USER_TOKEN } from '../../constants';
import '../../styles/JobPostingsTable.css'

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const createOption = (label) => ({
  label,
  value: label,
});

/*
Code below is from:
  https://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript
By Shyam Habarakada
*/
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
/* End of referenced code */

/*
Code below is from:
  https://stackoverflow.com/questions/563406/add-days-to-javascript-date
By sparebytes
*/
function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
/* End of referenced code */

class JobPostingsTable extends React.Component {
  state = {
    inputTitle: '',
    title: [],
    filters: {
      deadline: {value: `${moment().format()}`, date: moment()},
      type: '',
      salary: '',
      wage: '',
      location: {
        country: '',
        region: '',
        city: ''
      },
      duration: '',
      openings: ''
    }
  }

  resetFilters = async () => {
    this.setState({
      inputTitle: '',
      title: [],
      filters: {
        deadline: {value: `${moment().format()}`, date: moment()},
        type: '',
        salary: '',
        wage: '',
        location: {
          country: '',
          region: '',
          city: ''
        },
        duration: '',
        openings: ''
      }
    });
  }

  handleTitleCreate= (title, actionMeta) => {
    this.setState({ title });
  };

  handleInputChange = (inputTitle) => {
    this.setState({ inputTitle });
  };

  handleKeyDown = (event) => {
    const { inputTitle, title} = this.state;

    if (!inputTitle) return;

    if (event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === ',') {
      this.setState({
        inputTitle: '',
        title: [...title, createOption(inputTitle)],
      });
      event.preventDefault();
    }
  };

  handleBlur = () => {
    const { inputTitle, title} = this.state;
    if (inputTitle.length > 0) {
      this.setState({
        inputTitle: '',
        title: [...title, createOption(inputTitle)],
      });
    }
  }

  handleChange = (e) => {
    let state = this.state;
    if (e.target.id === "city") {
      state.filters.location[e.target.id] = e.target.value;
    }

    this.setState(state);
  }

  setDeadline = (val) => {
    let state = this.state;
    state.filters.deadline.date = val;
    state.filters.deadline.value = val.format();

    this.setState(state);
  }

  setType = (val) => {
    let state = this.state;
    state.filters.type = val;

    this.setState(state);
  }

  setSalary = (val) => {
    let state = this.state;
    state.filters.salary = val;

    this.setState(state);
  }

  setWage = (val) => {
    let state = this.state;
    state.filters.wage = val;

    this.setState(state);
  }

  selectCountry = (val) => {
    let state = this.state;
    state.filters.location.country = val;
    state.filters.location.region = '';

    this.setState(state);
  }

  selectRegion = (val) => {
    let state = this.state;
    state.filters.location.region = val;

    this.setState(state);
  }

  setDuration = (val) => {
    let state = this.state;
    state.filters.duration = val;

    this.setState(state);
  }

  setOpenings = (val) => {
    let state = this.state;
    state.filters.openings = val;

    this.setState(state);
  }

  getPostings = () => {
    let postings = [];

    let resultPostings = this.props.jobPostingsQuery.jobpostings;

    resultPostings.forEach(result => {
      if (result.activated) {
        let posting = {};

        let date = new Date(result.deadline);

        posting.deadline = {
          day: monthNames[date.getMonth()] + " " +
              date.getDate().toString() + ", " +
              date.getFullYear().toString(),

          daysUntil: dateDiffInDays(new Date(Date.now()), date)
        }

        posting.job = {
          id:           result.id,
          title:        result.title,
          organization: result.businessprofile.name
        };

        posting.location = {
          country: result.location.country,
          region:  result.location.region,
          city:    result.location.city
        }

        posting.type     = result.type;
        posting.duration = result.duration;
        posting.openings = result.openings;

        posting.pay = {
          paytype: result.paytype,
          salary:  result.salary
        }

        postings.push(posting);
      }
    });

    return postings;
  }

  filterPostings = async (e) => {
    e.preventDefault();

    const deadline = this.state.filters.deadline.value;
    let deadlineQuery = [{
      deadline_gte: new Date(Date.now())
    }];

    if (deadline !== '') {
      deadlineQuery.push({deadline_lte: addDays(deadline, 1)});
    }

    let titleQuery = [];
    this.state.title.forEach(word => {
      titleQuery.push({
        title_contains: word.value.charAt(0).toUpperCase() + word.value.slice(1)
      }, {
        title_contains: word.value.charAt(0).toLowerCase() + word.value.slice(1)
      });
    });

    const type     = this.state.filters.type;

    let typeQuery;
    // typeQuery is reversed to allow retrieval of jobs with null position types
    if (type === 'FULLTIME') {
      typeQuery = 'PARTTIME';

    } else if (type === 'PARTTIME') {
      typeQuery = 'FULLTIME';

    } else {
      typeQuery = [];
    }

    let salary = this.state.filters.salary;
    let wage = this.state.filters.wage;

    const salaryEmpty = (salary === null || salary === '');
    const wageEmpty   = (wage === null || wage === '');

    let payQuery;

    if (salaryEmpty && wageEmpty) {
      // Query all pay types
      payQuery = [{
        salary_gte: 0
      }, {
        salary: null
      }];

    } else if (salaryEmpty) {
      // Query for wage only
      payQuery = [{
        paytype: 'HOURLY',
        salary_gte: wage,
      }];

    } else if (wageEmpty) {
      // Query for salary only
      payQuery = [{
        paytype: 'SALARY',
        salary_gte: salary
      }];

    } else {
      // Query both salary and wage
      payQuery = [{
        paytype: 'SALARY',
        salary_gte: salary
      }, {
        paytype: 'HOURLY',
        salary_gte: wage,
      }];
    }

    let duration = this.state.filters.duration;
    let durationQuery;
    if (duration === null || duration === '') {
      durationQuery = [{
        duration_gte: 0
      }, {
        duration: null
      }];

    } else {
      durationQuery = [{
        duration_gte: duration
      }];
    }

    let openings = this.state.filters.openings;
    let openingsQuery;
    if (openings === null || openings === '') {
      openingsQuery = [{
        openings_gte: 0
      }, {
        openings: null
      }];

    } else {
      openingsQuery = [{
        openings_gte: openings
      }]
    }

    const country = this.state.filters.location.country;
    const region  = this.state.filters.location.region;
    const city    = this.state.filters.location.city;

    let locationQuery;

    if (country !== '') {

      if (region !== '') {
        // Country and region defined
        locationQuery = {
          country: country,
          region: region
        }

      } else {
        // Only country defined
        locationQuery = {
          country: country,
        }
      }

    } else {
      // Country and region undefined
      locationQuery = {
        country_contains: '',
        region_contains: ''
      }
    }

    locationQuery.OR = [{
      city_contains: city.charAt(0).toUpperCase() + city.slice(1)
    }, {
      city_contains: city.charAt(0).toLowerCase() + city.slice(1)
    }];

    this.props.jobPostingsQuery.refetch({
      where: {
        AND: [{
          AND: deadlineQuery,
          OR: titleQuery
        }, {
          OR: payQuery
        }, {
          type_not_in: typeQuery,
          location: locationQuery,
        }, {
          OR: durationQuery
        }, {
          OR: openingsQuery
        }],
      }
    });
  }

  render() {
    if (this.props.jobPostingsQuery.loading || this.props.userQuery.loading) {
      return <Loading />
    }

    if (this.props.jobPostingsQuery.error) {
      console.log(this.props.jobPostingsQuery.error)
      return <h3>Error</h3>
    }

    if (!this.props.userQuery.user.activated) {
      return <Redirect to='/dashboard'/>;
    }

    let postings = this.getPostings();

    const columns = [
      {
        Header: () => <div><strong>Deadline</strong></div>,
        accessor: 'deadline',
        Cell: props =>
          <div>
            { props.value.daysUntil > 6
              ? <Label bsStyle="primary">In {props.value.daysUntil} Days</Label>

              : (props.value.daysUntil > 3)
              ? <Label bsStyle="warning">In {props.value.daysUntil} Days</Label>

              : (props.value.daysUntil > 1)
              ? <Label bsStyle="danger">In {props.value.daysUntil} Days</Label>

              : (props.value.daysUntil === 1)
              ? <Label bsStyle="danger">In 1 Day</Label>

              : (props.value.daysUntil === 0)
              ? <Label bsStyle="danger">Today</Label>

              : <Label>Passed</Label>
            }
            <br />
            <span>{props.value.day}</span>
         </div>,
        width: 150,
        sortMethod: (a, b) => {
          return a.daysUntil -  b.daysUntil;
        }
      },
      {
        Header: () => <div><strong>Job</strong></div>,
        accessor: 'job',
        Cell: props =>
          <div>
            <a href={`/jobs/` + props.value.id}>{props.value.title}</a>
            <br />
            <span>{props.value.organization}</span>
          </div>,
        width: 200,
        sortMethod: (a, b) => {
          return a.title > b.title ? 1 : -1;
        }
      },
      {
        Header: () => <div><strong>Type</strong></div>,
        accessor: 'type',
        Cell: props =>
          <div>
            {props.value === 'FULLTIME'
              ? <span>Full-time</span>
              : props.value === 'PARTTIME'
              ? <span>Part-time</span>
              : <span>N/A</span>
            }
          </div>,
        width: 100
      },
      {
        Header: () => <div><strong>Location</strong></div>,
        accessor: 'location',
        Cell: props =>
          <div>
            <span>{props.value.city}, {props.value.region}</span>
            <br />
            <span>{props.value.country}</span>
          </div>,
        width: 220,
        sortMethod: (a, b) => {
          return a.city> b.city? 1 : -1;
        }
      },
      {
        Header: () => <div><strong>Openings</strong></div>,
        accessor: 'openings',
        Cell: props =>
          <div className="center-content-div ">
            {props.value
              ? <span>{props.value}</span>
              : <span>N/A</span>
            }
          </div>,
        width: 100,
      },
      {
        Header: () => <div><strong>Duration</strong></div>,
        accessor: 'duration',
        Cell: props =>
          <div className="center-content-div ">
            {props.value
              ? <span>{props.value} Months</span>
              : <span>N/A</span>
            }
          </div>,
        width: 100
      },
      {
        Header: () => <div><strong>Pay</strong></div>,
        accessor: 'pay',
        Cell: props =>
          <div>
            {props.value.salary && props.value.paytype === "SALARY"
              ? <div>
                  <span>Salary</span>
                  <br />
                  <span>{`$${props.value.salary.toLocaleString("en-US", {minimumFractionDigits: 2})}`}</span>
                </div>

              : props.value.salary && props.value.paytype === "HOURLY"
              ? <div>
                  <span>Wage</span>
                  <br />
                  <span>{`$${props.value.salary.toLocaleString("en-US", {minimumFractionDigits: 2})}`}</span>
                </div>

              : <span>N/A</span>
            }
          </div>,
        width: 120,
        sortMethod: (a, b) => {
          return a.salary - b.salary;
        }
      },
      {
        Header: () => <div><strong>Actions</strong></div>,
        accessor: 'job',
        width: 125,
        Cell: props =>
          <div>
            <a
              className="btn btn-info"
              role="button"
              href={`/jobs/${props.value.id}`}
            >
              Details
            </a>
          </div>,
        sortable: false
      }
    ]

    return (
      <div id="view-job-postings">
        <h1>Job Postings</h1>
        <div id="filter-job-postings">
          <form onSubmit={this.filterPostings}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3" toggle><strong>Filters</strong></Panel.Title>
              </Panel.Heading>
              <Panel.Collapse>
              <div className="panel-form">

                <Row>
                  <Col md={6}>
                    <FormGroup controlId="title">
                      <ControlLabel>Title Keywords</ControlLabel>
                        <CreatableSelect
                          components={{DropdownIndicator: null}}
                          inputValue={this.state.inputTitle}
                          isClearable
                          isMulti
                          menuIsOpen={false}
                          onChange={this.handleTitleCreate}
                          onInputChange={this.handleInputChange}
                          onKeyDown={this.handleKeyDown}
                          onBlur={this.handleBlur}
                          placeholder="Enter Keywords"
                          value={this.state.title}
                        />
                    </FormGroup>
                  </Col>

                  <Col md={6}>
                    {/* Organization name field goes here*/}
                  </Col>
                </Row>

                <Row>
                  <Col md={2}>
                    <FormGroup controlId="deadline">
                    <ControlLabel>Deadline Before</ControlLabel>
                      <InputGroup>
                        <DatePicker
                          className="btn btn-default dropdown-toggle component-field"
                          readOnly
                          placeholderText="Select Date"
                          dateFormat="DD-MM-YYYY"
                          selected={this.state.filters.deadline.date}
                          onChange={(date) => this.setDeadline(date)}
                        />
                      </InputGroup>
                    </FormGroup>
                  </Col>

                  <Col md={2}>
                    <FormGroup controlId="country" className="location-selector">
                      <ControlLabel>Country</ControlLabel>
                      <CountryDropdown
                        classes="btn btn-default dropdown-toggle component-field"
                        value={this.state.filters.location.country}
                        onChange={(val) => this.selectCountry(val)} />
                    </FormGroup>
                  </Col>

                  <Col md={2}>
                    <FormGroup controlId="region" className="location-selector">
                      <ControlLabel>Region</ControlLabel>
                      <RegionDropdown
                        classes="btn btn-default dropdown-toggle component-field"
                        disableWhenEmpty={true}
                        country={this.state.filters.location.country}
                        value={this.state.filters.location.region}
                        onChange={(val) => this.selectRegion(val)} />
                    </FormGroup>
                  </Col>

                  <Col md={2}>
                    <FormGroup controlId="city">
                      <ControlLabel>City</ControlLabel>
                      <FormControl
                        className="text-field"
                        autoFocus
                        type="text"
                        placeholder="City"
                        value={this.state.filters.location.city}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                  </Col>

                  <Col md={4}>
                    <FormGroup controlId="type">
                      <ControlLabel>Type of Position</ControlLabel>
                      <br />
                      <Radio
                        inline
                        checked={this.state.filters.type === ''}
                        onChange={() => this.setType('')}
                      >
                        Any
                      </Radio>{' '}
                      <Radio
                        inline
                        checked={this.state.filters.type ==='FULLTIME'}
                        onChange={() => this.setType('FULLTIME')}
                      >
                        Full-Time
                      </Radio>{' '}
                      <Radio
                        inline
                        checked={this.state.filters.type ==='PARTTIME'}
                        onChange={() => this.setType('PARTTIME')}
                      >
                        Part-Time
                      </Radio>{' '}
                    </FormGroup>
                  </Col>
                </Row>


                <Row>
                  <Col md={2}>
                    <FormGroup controlId="salary">
                      <ControlLabel>Minimum Salary</ControlLabel>
                      <NumericInput
                        className="form-control"
                        placeholder="$/yr"
                        value={this.state.filters.salary}
                        min={0}
                        precision={2}
                        step={5000}
                        onChange={this.setSalary}/>
                    </FormGroup>
                  </Col>

                  <Col md={2}>
                    <FormGroup controlId="wage">
                      <ControlLabel>Minimum Wage</ControlLabel>
                      <NumericInput
                        className="form-control"
                        placeholder="$/hr"
                        value={this.state.filters.wage}
                        precision={2}
                        min={0}
                        onChange={this.setWage}/>
                    </FormGroup>
                  </Col>

                  <Col md={2}>
                    <FormGroup controlId="openings">
                      <ControlLabel>Minimum Openings</ControlLabel>
                      <NumericInput
                        className="form-control"
                        placeholder="Openings"
                        value={this.state.filters.openings}
                        min={0}
                        onChange={this.setOpenings}/>
                    </FormGroup>
                  </Col>


                  <Col md={2}>
                    <FormGroup controlId="duration">
                      <ControlLabel>Minimum Duration</ControlLabel>
                      <NumericInput
                        className="form-control"
                        placeholder="Months"
                        value={this.state.filters.duration}
                        min={0}
                        onChange={this.setDuration}/>
                    </FormGroup>
                  </Col>

                  <Col md={2}>
                    <Button
                      className="filter-button"
                      block
                      bsSize="large"
                      onClick={this.resetFilters}
                    >
                    Reset Filters
                    </Button>
                  </Col>

                  <Col md={2}>
                    <Button
                      className="filter-button"
                      type="submit"
                      block
                      bsSize="large"
                      bsStyle="primary"
                    >
                    Apply Filters
                    </Button>
                  </Col>
                </Row>

                </div>
              </Panel.Collapse>

            </Panel>
          </form>
        </div>

        <ReactTable
          id="job-postings-table"
          columns={columns}
          data={postings}
          minRows={5}
          showPagination={false}
          style={{
            borderRadius: "5px",
            overflow: "hidden",
            padding: "5px",
            textAlign: "center"
          }}
        />
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

const JOB_POSTINGS_QUERY = gql`
  query JobPostingsQuery($where: JobPostingWhereInput) {
    jobpostings(where: $where, orderBy: deadline_ASC) {
      id
      activated
      title
      type
      deadline
      duration
      openings
      paytype
      salary
      businessprofile {
        id
        name
      }
      location {
        city
        region
        country
      }
    }
  }
`

export default compose(
  graphql(JOB_POSTINGS_QUERY, {
    name: 'jobPostingsQuery',
    options: props => ({
      variables: {
          where: {
            deadline_gte: new Date(Date.now())
          }
        },
    }),
  }),
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
  withRouter,
  withApollo
) (JobPostingsTable);
