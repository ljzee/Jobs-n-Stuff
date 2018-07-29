import React, { Component } from 'react';
import '../styles/Job.css';
import {Panel, Button, Alert} from 'react-bootstrap';
import gql from 'graphql-tag';
import Loading from './Loading';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { USER_TOKEN } from '../constants';
import { Redirect } from 'react-router';
import moment from 'moment';
import ReactHtmlParser from 'react-html-parser';

class Job extends Component{

  isBusinessUser = () => {
    return this.props.userQuery.user.role === 'BUSINESS';
  }

  isCorrectBusinessUser = () => {
    return this.props.jobQuery.jobPosting.businessprofile.id === this.props.userQuery.user.businessprofile.id;
  }

  render(){

    if (this.props.jobQuery.loading || this.props.userQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    if (this.props.jobQuery.error) {
      return <Redirect to='/dashboard'/>;
    }

    if (this.props.jobQuery.jobPosting === null){
      return <h1>Sorry, this job doesn't exist.</h1>
    }

    return(
      <div className="Job">
        {(this.isBusinessUser() && this.isCorrectBusinessUser()) &&
          <Alert bsStyle="success">
            <p>This is how a user will view your job posting.</p>
            <Button
              type="submit"
              bsSize="medium"
              bsStyle="primary"
              className="manage-postings"
              onClick={ () => this.props.history.push(`/manage-postings/${this.props.userQuery.user.username}`) }
            >
              Go back to Manage Postings
            </Button>
          </Alert>
        }
        <h1>{this.props.jobQuery.jobPosting.title}</h1>
        <h3>{this.props.jobQuery.jobPosting.businessprofile.name}</h3>
        {!this.isBusinessUser() &&
          <div>
            <Button
              type="submit"
              bsSize="large"
              className="pull-right user-buttons applybutton"
              bsStyle="success"
              onClick={ () => {
              }}
            >
              Apply
            </Button>
            <Button
              type="submit"
              bsSize="large"
              className="pull-right user-buttons bookmarkbutton"
              bsStyle="primary"
              onClick={ () => {
              }}
            >
              Bookmark
            </Button>
          </div>
        }
        <div className="predescription">
          <p>{this.props.jobQuery.jobPosting.location.city}</p>
          <p>{this.props.jobQuery.jobPosting.location.region}{', '}{this.props.jobQuery.jobPosting.location.country}</p>
        </div>
        <div className="jobdetailspanel">
          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">Job Description</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <div>{ReactHtmlParser(this.props.jobQuery.jobPosting.description)}</div>
            </Panel.Body>
          </Panel>
          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">Job Details</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <p className="deadline-text">
                <strong>Application Deadline: </strong>{moment(this.props.jobQuery.jobPosting.deadline).format("DD-MM-YYYY")}
              </p>
              {this.props.jobQuery.jobPosting.type !== null &&
                <p>
                  <strong>Position type: </strong>{(this.props.jobQuery.jobPosting.type === 'FULLTIME')? 'Full time' : 'Part time'}
                </p>
              }
              {this.props.jobQuery.jobPosting.duration !== null &&
                <p>
                  <strong>Duration: </strong>{`${this.props.jobQuery.jobPosting.duration} months`}
                </p>
              }
              {this.props.jobQuery.jobPosting.openings !== null &&
                <p>
                  <strong>Openings: </strong>{this.props.jobQuery.jobPosting.openings}
                </p>
              }
              {this.props.jobQuery.jobPosting.salary !== null &&
                <div>
                  {this.props.jobQuery.jobPosting.paytype === 'SALARY'
                    ?
                      <p>
                        <strong>Salary: </strong>{`$ ${this.props.jobQuery.jobPosting.salary.toLocaleString("en-US", {minimumFractionDigits: 2})}`}
                      </p>
                    :
                      <p>
                        <strong>Hourly wage: </strong>{`$ ${this.props.jobQuery.jobPosting.salary.toLocaleString("en-US", {minimumFractionDigits: 2})}`}
                      </p>
                  }
                </div>
              }
              {this.props.jobQuery.jobPosting.contactname !== null && this.props.jobQuery.jobPosting.contactname !== '' &&
                <p>
                  <strong>Contact: </strong>{this.props.jobQuery.jobPosting.contactname}
                </p>
              }
              <strong>Company website: </strong>
              <a
                target="_blank"
                // href={this.props.jobQuery.jobPosting.website}
                href="https://google.ca"
                className="company-website-link"
              >
                www.google.ca
                {/* {this.props.jobQuery.jobPosting.website.replace('https://', '').replace('http://')} */}
              </a>
            </Panel.Body>
          </Panel>
        </div>
        <footer>
          <p><strong>Added: </strong>{moment(this.props.jobQuery.jobPosting.updatedAt).format("DD-MM-YYYY")}</p>
        </footer>
      </div>
    )
  }

}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
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
      businessprofile {
        id
        website
        name
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
)(Job)
