import React, { Component } from 'react';
import { USER_TOKEN, applications_columns } from '../../constants';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { Button, Modal, HelpBlock } from 'react-bootstrap';
import Loading from '../Loading';
import { Redirect } from 'react-router';
import moment from 'moment';
import ReactTable from "react-table";
import 'react-table/react-table.css';

class UserApplications extends Component {

  state = {
    showCancelModal: false,
    cancelAppId: '',
    cancelAppTitle: ''
  }

  openCancelModal = (id, title) => {
    let state = this.state;
    state.showCancelModal = true;
    state.cancelAppId = id;
    state.cancelAppTitle = title;
    this.setState(state);
  }

  closeCancelModal = () => {
    let state = this.state;
    state.showCancelModal = false;
    state.cancelAppId = '';
    state.cancelAppTitle = '';
    this.setState(state);
  }

  getCurrentApplications = () => {
    let applications = []

    for (let i = 0; i < this.props.userQuery.user.userprofile.applications.length; i++) {
      const application = this.props.userQuery.user.userprofile.applications[i];
      if (moment(application.jobposting.deadline).diff(moment()) > 0) {
        applications.push(this.props.userQuery.user.userprofile.applications[i]);
      }
    }

    return applications;
  }

  getPastApplications = () => {
    let applications = []

    for (let i = 0; i < this.props.userQuery.user.userprofile.applications.length; i++) {
      const application = this.props.userQuery.user.userprofile.applications[i];
      if (moment(application.jobposting.deadline).diff(moment()) <= 0) {
        applications.push(this.props.userQuery.user.userprofile.applications[i]);
      }
    }

    return applications;
  }

  isUserMe = () => {
    return this.props.match.params.username === JSON.parse(localStorage.getItem(USER_TOKEN)).username;
  }

  cancelApplication = async () => {
    await this.props.cancelApplication({
      variables: {
        id: this.state.cancelAppId
      },
    });
    this.props.userQuery.refetch();
    this.setState({showCancelModal: false})
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
        width: 175,
        Cell: props => <span>{props.value.businessprofile.name}</span>
      },
      {
        id: 'updatedAt',
        Header: () => <div><strong>Submitted</strong></div>,
        width: 160,
        accessor: props => moment(props.updatedAt).format('DD/MM/YYYY h:mm a')
      },
      {
        Header: () => <div><strong>Job Details</strong></div>,
        accessor: 'jobposting',
        width: 110,
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
      },
      {
        Header: () => <div><strong>Cancel Application</strong></div>,
        accessor: 'id',
        width: 160,
        Cell: props =>
        <div className="center-content-div">
          <Button
            bsStyle="danger"
            role="button"
            onClick={ () => this.openCancelModal(props.value, props.original.jobposting.title)}
          >
            Cancel
          </Button>
        </div>
      }
    ]

    return (
      <div className="UserApplications">
        <h2 className="form-signin-heading">Current Applications</h2>
        <HelpBlock>
          The application deadline has not passed for these jobs.
          You may cancel your application if you no longer wish to be considered for the position.
        </HelpBlock>
        <ReactTable
          className="-striped"
          data={this.getCurrentApplications()}
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
        <h2 className="form-signin-heading">Past Applications</h2>
        <HelpBlock>
          The application deadline has passed for these jobs.
          You are no longer able to cancel your application.
        </HelpBlock>
        <ReactTable
          className="-striped"
          data={this.getPastApplications()}
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
        {this.state.showCancelModal &&
          <Modal id="delete-file-modal" show={this.state.showCancelModal} onHide={this.closeCancelModal}>
            <Modal.Header>
              <Modal.Title>Cancel Application</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to cancel your application for the following job?</p>
              <p>{this.state.cancelAppTitle}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button bsSize="large" bsStyle="danger" onClick={this.cancelApplication}>Yes</Button>
              <Button bsSize="large" onClick={this.closeCancelModal}>Cancel</Button>
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
            deadline
            businessprofile {
              name
            }
          }
        }
      }
    }
  }
`

const CANCEL_APPLICATION = gql`
  mutation CancelApplication($id: ID!) {
    cancelApplication(id: $id) {
      id
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
  graphql(CANCEL_APPLICATION, {
    name: 'cancelApplication'
  }),
  withRouter,
  withApollo
)(UserApplications)
