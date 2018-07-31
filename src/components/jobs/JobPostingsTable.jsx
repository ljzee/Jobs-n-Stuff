import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { Button, Col, ControlLabel, FormControl, FormGroup, Grid, InputGroup, Label, Panel, Radio, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import NumericInput from 'react-numeric-input';
import ReactTable from 'react-table';
import Loading from '../Loading';
import '../../styles/JobPostingsTable.css'

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


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
    filters: {
      deadline: '',
      title: '',
      type: '',
      salary: '',
      wage: '',
      location: {
        country: '',
        region: ''
      },
      duration: '',
      openings: ''
    }
  }

  handleChange = (e) => {
    let state = this.state;
    state.filters[e.target.id] = e.target.value;

    this.setState(state);
  }

  setDeadline = (val) => {
    let state = this.state;
    state.filters.deadline = val;

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

  selectCountry= (val) => {
    let state = this.state;
    state.filters.location.country = val;
    state.filters.location.region = '';

    this.setState(state);
  }

  selectRegion= (val) => {
    let state = this.state
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
          city:    result.location.city,
          region:  result.location.region,
          country: result.location.country
        }

        posting.type     = result.type;
        posting.duration = result.duration;
        posting.openings = result.openings;
        posting.salary   = result.salary;

        postings.push(posting);
      }
    });

    return postings;
  }

  filterPostings = async (e) => {
    e.preventDefault();

    let deadline = this.state.filters.deadline;
    if (deadline !== '') {
      deadline = addDays(deadline, 1);
    } else {
      deadline = addDays(new Date(Date.now()), 101);
    }
    const title    = this.state.filters.title;
    const type     = this.state.filters.type;

    let typeQuery;
    if (type === 'FULLTIME') {
      typeQuery = 'FULLTIME';

    } else if (type === 'PARTTIME') {
      typeQuery = 'PARTTIME';

    } else {
      typeQuery = ['FULLTIME', 'PARTTIME'];
    }

    let salary = this.state.filters.salary;
    if (salary === null || salary === '') {
      salary = 0;
    }

    let wage = this.state.filters.wage;
    if (wage === null || wage === '') {
      wage = 0;
    }

    let duration = this.state.filters.duration;
    if (duration === null || duration === '') {
      duration = 0;
    }

    let openings = this.state.filters.openings;
    if (openings === null || openings === '') {
      openings = 0;
    }

    const country = this.state.filters.location.country;
    const region = this.state.filters.location.region;

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

    this.props.jobPostingsQuery.refetch({
      where: {
        deadline_lte: deadline,
        AND: [{
          OR: [{
            title_contains: title.charAt(0).toUpperCase() + title.slice(1)
          }, {
            title_contains: title.charAt(0).toLowerCase() + title.slice(1)
          }]
        }, {
          OR: [{
            OR: [{
              paytype: "SALARY",
              salary_gte: salary
            }, {
              paytype: "SALARY",
              salary: null
            }]
          }, {
            OR: [{
              paytype: "HOURLY",
              salary_gte: wage
            }, {
              paytype: "HOURLY",
              salary: null
            }],
          }]
        }],

        type_in: typeQuery,
        location: locationQuery,

        OR: [{
          duration_gte: duration
        }, {
          duration: null
        }],

        OR: [{
          openings_gte: openings
        }, {
          openings: null
        }]
      }
    });
  }

  render() {
    if (this.props.jobPostingsQuery.loading) {
      return <Loading />
    }

    if (this.props.jobPostingsQuery.error) {
      return <h3>Error</h3>
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
        width: 150
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
        width: 200
      },
      {
        Header: () => <div><strong>Type</strong></div>,
        accessor: 'type',
        Cell: props =>
          <div>
            {props.value === 'FULLTIME'
              ? <span>Full-time</span>
              : <span>Part-time</span>
            }
          </div>,
        width: 100
      },
      {
        Header: () => <div><strong>Location</strong></div>,
        accessor: 'location',
        Cell: props =>
          <div>
            <span>{props.value.city}, {props.value.region},</span>
            <br />
            <span>{props.value.country}</span>
          </div>,
        width: 220
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
        Header: () => <div><strong>Openings</strong></div>,
        accessor: 'openings',
        Cell: props =>
          <div className="center-content-div ">
            {props.value
              ? <span>{props.value}</span>
              : <span>N/A</span>
            }
          </div>,
        width: 100
      },
      {
        Header: () => <div><strong>Salary/Wage</strong></div>,
        accessor: 'salary',
        Cell: props =>
          <div className="center-content-div ">
            {props.value
              ? <span>{`$ ${props.value.toLocaleString("en-US", {minimumFractionDigits: 2})}`}</span>
              : <span>N/A</span>
            }
          </div>,
        width: 120
      },
      {
        Header: () => <div><strong>Actions</strong></div>,
        accessor: 'job',
        Cell: props =>
          <div className="center-content-div ">
            <a
              className="btn btn-info job-details-button"
              role="button"
              href={`/jobs/${props.value.id}`}
            >
              Details
            </a>
          </div>
      }
    ]

    return (
      <div id="view-job-postings">
        <h1>Job Postings</h1>

        <div id="filter-job-postings">
          <form onSubmit={this.filterPostings}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3">Filters</Panel.Title>
              </Panel.Heading>

              <div className="panel-form">
                <Grid>
                  <Row>
                    <Col md={3}>
                      <FormGroup controlId="title">
                        <ControlLabel>Keywords</ControlLabel>
                        <FormControl
                          id="keyword-field"
                          autoFocus
                          type="text"
                          placeholder="Keywords"
                          value={this.state.filters.title}
                          onChange={this.handleChange}
                        />
                      </FormGroup>
                    </Col>

                    <Col md={2}>
                      <FormGroup controlId="deadline">
                      <ControlLabel>Latest Deadline</ControlLabel>
                        <InputGroup>
                          <DatePicker
                            id="date-picker"
                            className="btn btn-default dropdown-toggle"
                            readOnly
                            dateFormat="DD-MM-YYYY"
                            selected={this.state.filters.deadline}
                            onChange={(date) => this.setDeadline(date)}
                          />
                        </InputGroup>
                      </FormGroup>
                    </Col>


                    <Col md={4}>
                      <FormGroup controlId="country" className="location-selector">
                        <ControlLabel>Country</ControlLabel>
                        <CountryDropdown
                          id="country-dropdown"
                          classes="btn btn-default dropdown-toggle"
                          value={this.state.filters.location.country}
                          onChange={(val) => this.selectCountry(val)} />
                      </FormGroup>
                    </Col>

                    <Col md={3}>
                      <FormGroup controlId="region" className="location-selector">
                        <ControlLabel>Region</ControlLabel>
                        <RegionDropdown
                          id="region-dropdown"
                          classes="btn btn-default dropdown-toggle"
                          disableWhenEmpty={true}
                          country={this.state.filters.location.country}
                          value={this.state.filters.location.region}
                          onChange={(val) => this.selectRegion(val)} />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={3}>
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

                    <Col md={2}>
                      <FormGroup controlId="salary">
                        <ControlLabel>Minimum Salary</ControlLabel>
                        <NumericInput
                          className="form-control"
                          value={this.state.filters.salary}
                          min={0}
                          step={5000}
                          onChange={this.setSalary}/>
                      </FormGroup>
                    </Col>

                    <Col md={2}>
                      <FormGroup controlId="wage">
                        <ControlLabel>Minimum Wage</ControlLabel>
                        <NumericInput
                          className="form-control"
                          value={this.state.filters.wage}
                          min={0}
                          onChange={this.setWage}/>
                      </FormGroup>
                    </Col>

                    <Col md={2}>
                      <FormGroup controlId="openings">
                        <ControlLabel>Minimum Openings</ControlLabel>
                        <NumericInput
                          className="form-control"
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
                          value={this.state.filters.duration}
                          min={0}
                          onChange={this.setDuration}/>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={2} mdPush={9}>
                      <Button
                        type="submit"
                        block
                        bsSize="large"
                        bsStyle="primary"
                        className="job-posting-submit-button pull-right"
                      >
                      Apply Filters
                      </Button>
                    </Col>
                  </Row>

                </Grid>
              </div>

            </Panel>
          </form>
        </div>

        <ReactTable
          id="job-postings-table"
          columns={columns}
          data={postings}
          minRows={5}
          showPagination={false}
        />
      </div>
    );
  }
}

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
  }),
  withRouter,
  withApollo
) (JobPostingsTable);
