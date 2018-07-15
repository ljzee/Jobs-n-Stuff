import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class ManagePostings extends Component {
  render() {
    return (
      <React.Fragment>
        <Link to="/create-posting">Create Posting</Link>
        <div>
          Need to add component for displaying existing components...
        </div>
      </React.Fragment>
    );
  }
}

export default ManagePostings;
