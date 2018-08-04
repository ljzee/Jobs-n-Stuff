import React, { Component } from 'react';
import { Redirect } from 'react-router';
import gql from 'graphql-tag';
import { graphql, compose, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from '../Loading';
import ReactTable from 'react-table';
import { Label } from 'react-bootstrap';
import { USER_TOKEN, monthNames, dateDiffInDays, applications_columns } from '../../constants';

class UserDashboard extends Component {

  userApplied = (posting) => {
    for (let i = 0; i < this.props.userQuery.user.userprofile.applications.length; i++) {
      const application = this.props.userQuery.user.userprofile.applications[i];
      if (application.jobposting.id === posting.job.id) {
        return true;
      }
    }

    return false;
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

  getApplications = () => {
    let applications = []

    for (let i = 0; i < this.props.userQuery.user.userprofile.applications.length; i++) {
      applications.push(this.props.userQuery.user.userprofile.applications[i]);
    }

    return applications;
  }


  render() {
    if (this.props.userQuery.loading || this.props.jobPostingsQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    const postings = this.getPostings();
    const applications = this.getApplications();

    const columns = [
      {
        Header: () => <div><strong>Deadline</strong></div>,
        accessor: 'deadline',
        width: 150,
        sortMethod: (a, b) => {
          return a.daysUntil -  b.daysUntil;
        },
        Cell: props =>
          <div>
            {this.userApplied(props.original)
              ? <Label bsStyle="success">Applied</Label>
              :
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
                  </div>
            }
          </div>
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
          return a.city > b.city ? 1 : -1;
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
              ? <span>{`$${props.value.salary.toLocaleString("en-US", {minimumFractionDigits: 2})}`}</span>

              : props.value.salary && props.value.paytype === "HOURLY"
              ? <span>{`$${props.value.salary.toLocaleString("en-US", {minimumFractionDigits: 2})}`}/hr</span>

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
    ];

    return (
      <div id="user-dashboard">
        <h2>Newest Job Postings</h2>
        <ReactTable
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

        <h2>Your Most Recent Applications</h2>
        <ReactTable
          className="-striped"
          data={applications}
          columns={applications_columns}
          minRows={5}
          showPagination={false}
          noDataText='No applications found'
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
      </div>
    );
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      role
      admindeactivated
      userprofile {
        applications(first: 5){
          id
          createdAt
          files {
            path
            filename
            filetype
          }
          jobposting {
            id
            title
            businessprofile {
              name
            }
          }
        }
      }
    }
  }
`

const JOB_POSTINGS_QUERY = gql`
  query JobPostingsQuery($where: JobPostingWhereInput) {
    jobpostings(orderBy: updatedAt_DESC, first: 5, where: $where) {
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
  withRouter,
  withApollo
)(UserDashboard)
