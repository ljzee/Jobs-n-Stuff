import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Job.css';
import {Panel, Button} from 'react-bootstrap';
import gql from 'graphql-tag';
import Loading from './Loading';
import { graphql, compose } from 'react-apollo';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-dom';


class Job extends Component{

  render(){


    if (this.props.jobQuery.loading) {
      return <Loading />;
    }

    if (this.props.jobQuery.error) {
      //console.log(this.props.jobQuery.error.message);
      return <div>Error</div>;
    }

    if (this.props.jobQuery.jobPosting === null){
      return <h1>Sorry, this job doesn't exist.</h1>
    }

    return(
      <div className="Job">
        <h1>{this.props.jobQuery.jobPosting.title}</h1>
        <Button
          type="submit"
          bsSize="large"
          className="pull-right applybutton"
          bsStyle="success"
          onClick={ () => {
          }}
        >
          Apply
        </Button>
        <Button
          type="submit"
          bsSize="large"
          className="pull-right bookmarkbutton"
          bsStyle="primary"
          onClick={ () => {
          }}
        >
          Bookmark
        </Button>
        <div className="predescription">
          <p>123 Company Street, Burnaby, BC, Canada</p>
          <p>{this.props.jobQuery.jobPosting.type}</p>
          <Link to="Google.ca">Website</Link>
          <div id="deadline">
            <p>
              <strong>Deadline: </strong>{this.props.jobQuery.jobPosting.deadline === null
                                          ?'N/A':this.props.jobQuery.jobPosting.deadline.slice(0,10)}
            </p>
          </div>
        </div>
        <div className="jobdetailspanel">
          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">Job Details</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <p>
                <strong>Company: </strong>
              </p>
              <p>
                <strong>Description: </strong>{this.props.jobQuery.jobPosting.description === null
                                              ?'N/A':this.props.jobQuery.jobPosting.description}
              </p>
              <p>
                <strong>Duration: </strong>{this.props.jobQuery.jobPosting.duration}
              </p>
              <p>
                <strong>Openings: </strong>{this.props.jobQuery.jobPosting.openings === null
                                           ?'N/A':this.props.jobQuery.jobPosting.openings}
              </p>
              <p>
                <strong>Salary: </strong> {this.props.jobQuery.jobPosting.salary === null
                                          ?'N/A':'$' + this.props.jobQuery.jobPosting.salary + '/Hr'}
              </p>
            </Panel.Body>
          </Panel>
          </div>
          <footer>
            <p><strong>Added: </strong>{this.props.jobQuery.jobPosting.createdAt.slice(0,10)}</p>
          </footer>
        <div className="contactdetailspanel">
        <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">Contact Details</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
             <p>
               <strong>Contact Person: </strong>{this.props.jobQuery.jobPosting.contactname === null
                                                ?'N/A':this.props.jobQuery.jobPosting.contactname}
             </p>
             <p>Google maps api go here</p>
            </Panel.Body>
          </Panel>
        </div>
      </div>
    )
  }

}




const JOB_QUERY = gql`
  query JobQuery($where: JobPostingWhereUniqueInput!) {
    jobPosting(where: $where) {
      id
      title
      type
      duration
      createdAt
      updatedAt
      openings
      description
      contactname
      salary
      deadline
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
  withRouter,
  withApollo
)(Job)
