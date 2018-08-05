import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { USER_TOKEN } from '../../constants';
import gql from 'graphql-tag';
import { graphql, compose, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from '../Loading';
import { Redirect } from 'react-router';
import ReactTable from "react-table";
import 'react-table/react-table.css';

class JobApplications extends Component {

  getApplications = () => {
    let applications = []

    for (let i = 0; i < this.props.jobQuery.jobPosting.applications.length; i++) {
      applications.push(this.props.jobQuery.jobPosting.applications[i]);
    }

    return applications;
  }

  isCorrectBusinessUser = () => {
    return this.props.jobQuery.jobPosting.businessprofile.id === this.props.userQuery.user.businessprofile.id;
  }

  render() {

    if (this.props.userQuery.loading || this.props.jobQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error || this.props.jobQuery.error) {
      return <Redirect to='/login'/>;
    }

    if (this.props.userQuery.user.role !== 'BUSINESS' || !this.isCorrectBusinessUser()) {
      return <Redirect to='/dashboard'/>;
    }

    const columns = [
      {
        Header: () => <div><strong>Name</strong></div>,
        accessor: 'userprofile',
        width: 275,
        Cell: props =>
          <span>
            {props.value.preferredname !== ''
              ? `${props.value.preferredname} ${props.value.lastname}`
              : `${props.value.firstname} ${props.value.lastname}`
            }
          </span>
      },
      {
        Header: () => <div><strong>Email</strong></div>,
        accessor: 'userprofile',
        width: 275,
        Cell: props => <span>{props.value.user.email}</span>,
      },
      {
        Header: () => <div><strong>Phone Number</strong></div>,
        accessor: 'userprofile',
        width: 175,
        Cell: props => <span>{props.value.phonenumber}</span>
      },
      {
        Header: () => <div><strong>Documents</strong></div>,
        accessor: 'files',
        Cell: props =>
        <div className="center-content-div">
          {props.value.length === 2
            ?
              <div>
                {props.value[0].filetype === 'RESUME'
                  ?
                    <div>
                      <a
                        href={props.value[0].path}
                        className="btn btn-info application-table-button"
                        role="button"
                        download={props.value[0].filename}
                      >
                        Resume
                      </a>
                      <a
                        href={props.value[1].path}
                        className="btn btn-info application-table-button"
                        role="button"
                        download={props.value[1].filename}
                      >
                        Cover Letter
                      </a>
                    </div>
                  :
                    <div>
                      <a
                        href={props.value[1].path}
                        className="btn btn-info application-table-button"
                        role="button"
                        download={props.value[1].filename}
                      >
                        Resume
                      </a>
                      <a
                        href={props.value[0].path}
                        className="btn btn-info application-table-button"
                        role="button"
                        download={props.value[0].filename}
                      >
                        Cover Letter
                      </a>
                    </div>
                }
              </div>
            :
              <div>
                <a
                  href={props.value[0].path}
                  className="btn btn-info application-table-button"
                  role="button"
                  download={props.value[0].filename}
                >
                  Resume
                </a>
              </div>
          }
        </div>
      }
    ]

    let applications = this.getApplications();

    return (
      <div className="JobApplications">
        <Button
          type="submit"
          bsSize="lg"
          bsStyle="primary"
          className="pull-right"
          onClick={ () => this.props.history.push(`/manage-postings/${this.props.userQuery.user.username}`) }
        >
          Back to Manage Postings
        </Button>
        <h2 className="form-signin-heading">{this.props.jobQuery.jobPosting.title}</h2>
        <br />
        <ReactTable
          className="-striped"
          data={applications}
          columns={columns}
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
      username
      businessprofile {
        id
      }
    }
  }
`

const JOB_QUERY = gql`
  query JobQuery($where: JobPostingWhereUniqueInput!) {
    jobPosting(where: $where) {
      id
      title
      applications {
        id
        status
        updatedAt
        files {
          path
          filename
          filetype
        }
        userprofile {
          preferredname
          firstname
          lastname
          phonenumber
          user {
            email
          }
        }
      }
      businessprofile {
        id
      }
    }
  }
`

export default compose(
  graphql(JOB_QUERY, {
    name: 'jobQuery',
    options: props => ({
      variables: {
          where: {
            id: props.match.params.jobid
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
)(JobApplications)
