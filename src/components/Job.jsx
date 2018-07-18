import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Job.css';
import {Panel, Button} from 'react-bootstrap';

class Job extends Component{

  render(){
    return(
      <div className="Job">
        <h1>Graphic Designer</h1>
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
          <p>Part Time</p>
          <Link to="Google.ca">Website</Link>
          <div id="deadline">
            <p>
              <strong>Deadline: </strong>July 18, 2018 (in 1 day)
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
                <strong>Description: </strong>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                <strong>Duration: </strong> 5 months
              </p>
              <p>
                <strong>Openings: </strong> 10
              </p>
              <p>
                <strong>Salary: </strong> $15/Hr
              </p>
            </Panel.Body>
          </Panel>
          </div>
          <footer>
            <p>Added: July 17, 2018</p>
          </footer>
        <div className="contactdetailspanel">
        <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3">Contact Details</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
             <p>
               <strong>Contact Person: </strong>
             </p>
             <p>Google maps api go here</p>
            </Panel.Body>
          </Panel>
        </div>
      </div>
    )
  }

}



export default Job;
