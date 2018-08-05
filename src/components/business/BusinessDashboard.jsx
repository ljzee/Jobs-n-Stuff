import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql, compose, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { Label } from 'react-bootstrap';
import Loading from '../Loading';
import ReactTable from 'react-table';
import moment from 'moment';
import { monthNames, dateDiffInDays } from '../../constants';

class BusinessDashboard extends Component {

  getPostings = () => {
    let postings = [];

    this.props.activePostingsQuery.me.businessprofile.jobpostings.forEach(result => {
      let posting = {};

      posting.id           = result.id
      posting.title        = result.title
      posting.activated    = result.activated
      posting.applications = result.applications

      let date = new Date(result.deadline);

      posting.deadline = {
        day: monthNames[date.getMonth()] + " " +
            date.getDate().toString() + ", " +
            date.getFullYear().toString(),

        daysUntil: dateDiffInDays(new Date(Date.now()), date)
      }

      postings.push(posting);
    })

    return postings;
  }

  getDrafts = () => {
    let postings = [];

    this.props.draftsQuery.me.businessprofile.jobpostings.forEach(result => {
      postings.push(result);
    })

    return postings;
  }

  render() {
    if (this.props.activePostingsQuery.loading || this.props.draftsQuery.loading) {
      return <Loading />;
    }

    const columns = [
      {
        Header: () => <div><strong>Job Title</strong></div>,
        accessor: 'title'
      },
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
        id: 'activated',
        Header: () => <div><strong>Status</strong></div>,
        width: 125,
        accessor: props =>
        <div>
          {props.activated
            ? <Label bsStyle="success">Active</Label>
            : <Label bsStyle="warning">Pending</Label>
          }
        </div>
      },
      {
        id: 'applications',
        Header: () => <div><strong>Applications</strong></div>,
        width: 115,
        accessor: props =>
        <span>{props.applications.length}</span>
      },
      {
        Header: () => <div><strong>Actions</strong></div>,
        width: 200,
        accessor: 'id',
        Cell: props =>
        <a
          className="btn btn-info"
          role="button"
          href={`/job-applications/${props.value}`}
        >
          View Applications
        </a>
      },
    ];

    const draftsColumns = [
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
        Header: () => <div><strong>Actions</strong></div>,
        accessor: 'id',
        width: 125,
        Cell: props =>
          <a
            className="btn btn-info"
            role="button"
            href={`/manage-postings/${this.props.activePostingsQuery.me.username}/${props.value}`}
          >
            View
          </a>
      }
    ];

    return (
      <div id="business-dashboard">
        <h2>Your Active Job Postings</h2>
        <ReactTable
          columns={columns}
          data={this.getPostings()}
          minRows={5}
          showPagination={false}
          style={{
            borderRadius: "5px",
            overflow: "hidden",
            padding: "5px",
            textAlign: "center"
          }}
          defaultSorted={[
            {
              id: "deadline",
              asc: true
            }
          ]}
        />

        <h2>Your Drafts</h2>
        <ReactTable
          columns={draftsColumns}
          data={this.getDrafts()}
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

const ACTIVE_POSTINGS_QUERY = gql`
  query ActivePostingsQuery($where: JobPostingWhereInput) {
    me {
      id
      username
      businessprofile {
        jobpostings(where: $where) {
          id
          title
          deadline
          updatedAt
          activated
          applications {
            id
          }
        }
      }
    }
  }
`

const DRAFTS_QUERY = gql`
  query DraftsQuery {
    me {
      businessprofile {
        jobpostings(where: { activated: false } ) {
          id
          title
          updatedAt
          activated
        }
      }
    }
  }
`

export default compose(
  graphql(ACTIVE_POSTINGS_QUERY, {
    name: 'activePostingsQuery',
    options: props => ({
      variables: {
        where: {
          activated: true,
          deadline_gte: new Date(Date.now())
        }
      },
    }),
  }),
  graphql(DRAFTS_QUERY, {
    name: 'draftsQuery',
  }),
  withRouter,
  withApollo
) (BusinessDashboard);
