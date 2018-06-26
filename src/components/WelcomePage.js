import React, { Component } from 'react';
import { Button } from 'react-bootstrap'

class WelcomePage extends Component {
  render() {
    return (
      <div className="WelcomePage">
        <h1>Welcome to Website Name</h1>
        <h3>Made for CMPT 470 by Group 1</h3>
        <Button href="/signup">Create Account</Button>
      </div>
    )
  }
}

export default WelcomePage;
