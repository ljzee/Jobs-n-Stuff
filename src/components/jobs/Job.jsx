import React, { Component } from 'react';
import '../../styles/Job.css';
import {Panel, Button} from 'react-bootstrap';
import gql from 'graphql-tag';
import Loading from '../Loading';
import { graphql, compose, withApollo } from 'react-apollo';
import { withRouter, Link } from 'react-router-dom';
import { USER_TOKEN } from '../../constants';
import { Redirect } from 'react-router';
import moment from 'moment';
import ReactHtmlParser from 'react-html-parser';
import ApplyModal from './ApplyModal';

let resumeoptions = [];
let coverletteroptions = [];

class Job extends Component{

  state = {
    showApply: false
  }

  isAdminUser = () => {
    return this.props.userQuery.user.role === 'ADMIN';
  }

  isBaseUser = () => {
    return this.props.userQuery.user.role === 'BASEUSER';
  }

  userHasApplied = () => {
    if (this.props.userQuery.user.userprofile) {
      let numberOfApplications = this.props.userQuery.user.userprofile.applications.length;
      let currentjobid = this.props.match.params.jobid;

      for(let i = 0; i < numberOfApplications; i++){
        if(this.props.userQuery.user.userprofile.applications[i].jobposting.id === currentjobid){
          return true;
        }
      }
    }

    return false;
  }

  submitApplication = async (chosenResume, chosenCoverletter) => {
    const resume = chosenResume;
    const coverletter = chosenCoverletter;
    const jobpostingid = this.props.match.params.jobid
    await this.props.createApplication({
      variables: {
        jobpostingid,
        resume,
        coverletter
      },
    });
    this.props.userQuery.refetch();
    this.setState({
      showApply: false
    })
  }

  cancelApplication = async () => {
    let applicationID = null;
    for(let i = 0; i < this.props.userQuery.user.userprofile.applications.length; i++){
      if(this.props.userQuery.user.userprofile.applications[i].jobposting.id === this.props.match.params.jobid){
        applicationID = this.props.userQuery.user.userprofile.applications[i].id;
      }
    }
    await this.props.cancelApplication({
      variables: {
        id: applicationID
      },
    });
    this.props.userQuery.refetch();
  }

  openApply = () => {
    this.setState({ showApply: true });
  }

  closeApply = () => {
    this.setState({ showApply: false });
  }

  setDocuments = () => {
    let numberOfFiles = this.props.userQuery.user.files.length;
    let roptions = [];
    let coptions = [];
    roptions.push({value: null, label: 'None'});
    coptions.push({value: null, label: 'None'});
    for(let i = 0; i < numberOfFiles; i++){
      if(this.props.userQuery.user.files[i].filetype === 'RESUME'){
        roptions.push({
          value: [
              this.props.userQuery.user.files[i].filetype,
              this.props.userQuery.user.files[i].filename,
              this.props.userQuery.user.files[i].path
          ],
          label: this.props.userQuery.user.files[i].name
        });
      }
      if(this.props.userQuery.user.files[i].filetype === 'COVERLETTER'){
        coptions.push({
          value: [
            this.props.userQuery.user.files[i].filetype,
            this.props.userQuery.user.files[i].filename,
            this.props.userQuery.user.files[i].path
          ],
          label: this.props.userQuery.user.files[i].name
        });
      }
    }
    resumeoptions = roptions;
    coverletteroptions = coptions;
  }

  render(){

    if (this.props.jobQuery.loading || this.props.userQuery.loading) {
      return <Loading />;
    }

    if (this.props.userQuery.error) {
      return <Redirect to='/login'/>;
    }

    if (this.props.jobQuery.error || !this.props.userQuery.user.activated || !(this.isBaseUser() || this.isAdminUser())) {
      return <Redirect to='/dashboard'/>;
    }

    if (this.props.jobQuery.jobPosting === null){
      return <h1>Sorry, this job doesn't exist.</h1>
    }

    this.setDocuments();

    return(
      <div className="Job">
        <h1>{this.props.jobQuery.jobPosting.title}</h1>
        <h3>{this.props.jobQuery.jobPosting.businessprofile.name}</h3>
        <div>
          {this.isBaseUser()
            ? this.userHasApplied()
            ?
              <Button
                type="submit"
                bsSize="large"
                className="pull-right user-buttons applybutton"
                bsStyle="danger"
                onClick={this.cancelApplication}
              >
                Cancel Application
              </Button>
            :
              <Button
                type="submit"
                bsSize="large"
                className="pull-right user-buttons applybutton"
                bsStyle="success"
                onClick={this.openApply}
              >
                Apply
              </Button>
            : false
          }

          <Link to={`/jobs`}>
            <Button
              bsSize="large"
              className="pull-right"
            >
              Back to Postings
            </Button>
          </Link>

        </div>

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
                href={this.props.jobQuery.jobPosting.businessprofile.website}
                className="company-website-link"
              >
                {this.props.jobQuery.jobPosting.businessprofile.website.replace('https://', '').replace('http://', '')}
              </a>
            </Panel.Body>
          </Panel>
        </div>
        <footer>
          <p><strong>Added: </strong>{moment(this.props.jobQuery.jobPosting.updatedAt).format("DD-MM-YYYY")}</p>
        </footer>
        <ApplyModal
          showapply={this.state.showApply}
          openapply={this.openApply}
          closeapply={this.closeApply}

          requirecoverletter={this.props.jobQuery.jobPosting.coverletter}
          resumechoices={resumeoptions}
          coverletterchoices={coverletteroptions}

          apply={this.submitApplication}
          username={this.props.userQuery.user.username}
        />
      </div>
    )
  }

}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      role
      username
      activated
      businessprofile {
        id
      }
      userprofile {
        id
        applications{
          id
          jobposting {
            id
          }
        }
      }
      files {
        name
        id
        path
        filename
        filetype
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

const CREATE_APPLICATION = gql`
  mutation CreateApplication($jobpostingid: ID!, $resume: [String], $coverletter: [String]) {
    createApplication(jobpostingid: $jobpostingid, resume: $resume, coverletter: $coverletter) {
      application {
        id
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
  graphql(CREATE_APPLICATION, {
    name: 'createApplication'
  }),
  graphql(CANCEL_APPLICATION, {
    name: 'cancelApplication'
  }),
  withRouter,
  withApollo
)(Job)
