import React, { Component } from 'react';
import { USER_TOKEN, applications_columns } from '../../constants';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import Loading from '../Loading';
import { Redirect } from 'react-router';
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

    return (
      <div className="UserApplications">
        <h2 className="form-signin-heading">Your Applications</h2>
        <br />
        <ReactTable
          className="-striped"
          data={this.getApplications()}
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
