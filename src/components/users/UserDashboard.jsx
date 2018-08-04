import React, { Component } from 'react';
import { Redirect } from 'react-router';
import gql from 'graphql-tag';
import { graphql, compose, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Loading from '../Loading';
import ReactTable from 'react-table';
import { USER_TOKEN, monthNames, dateDiffInDays, jobposting_columns, applications_columns } from '../../constants';

class UserDashboard extends Component {

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


    return (
      <div id="user-dashboard">
        <h2>Newest Job Postings</h2>
        <ReactTable
          columns={jobposting_columns}
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
