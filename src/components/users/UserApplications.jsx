import React, { Component } from 'react';
import { USER_TOKEN } from '../../constants';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from '../Loading';
import { Redirect } from 'react-router';
import ReactTable from "react-table";
import moment from 'moment';
import 'react-table/react-table.css';

class UserApplications extends Component {

  getApplications = () => {
    let applications = []

    for (let i = 0; i < this.props.userQuery.user.userprofile.applications.length; i++) {
      applications.push(this.props.userQuery.user.userprofile.applications[i]);
    }

    return applications;
  }

  isUserMe = () => {
    return this.props.match.params.username === JSON.parse(localStorage.getItem(USER_TOKEN)).username;
  }

  render() {

    if (this.props.userQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    if (this.props.userQuery.user.role !== 'BASEUSER' || !this.isUserMe()) {
      return <Redirect to='/dashboard'/>;
    }

    const columns = [
      {
        Header: () => <div><strong>Title</strong></div>,
        accessor: 'jobposting',
        Cell: props => <span>{props.value.title}</span>,
      },
      {
        Header: () => <div><strong>Company</strong></div>,
        accessor: 'jobposting',
        Cell: props => <span>{props.value.businessprofile.name}</span>
      },
      {
        id: 'updatedAt',
        Header: () => <div><strong>Submitted</strong></div>,
        width: 175,
        accessor: props => moment(props.updatedAt).format('DD/MM/YYYY h:mm a')
      },
      {
        Header: () => <div><strong>Job Details</strong></div>,
        accessor: 'jobposting',
        width: 150,
        Cell: props =>
          <a
            className="btn btn-info"
            role="button"
            onClick={ () => this.props.history.push(`/jobs/${props.value.id}`)}
          >
            View Job
          </a>
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
                      target="_blank"
                    >
                      Resume
                    </a>
                    <a
                      href={props.value[1].path}
                      className="btn btn-info application-table-button"
                      role="button"
                      target="_blank"
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
                      target="_blank"
                    >
                      Resume
                    </a>
                    <a
                      href={props.value[0].path}
                      className="btn btn-info application-table-button"
                      role="button"
                      target="_blank"
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
                target="_blank"
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
      <div className="UserApplications">
        <h2 className="form-signin-heading">Your Applications</h2>
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
      userprofile {
        id
        applications{
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
  withRouter,
  withApollo
)(UserApplications)
