import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AUTH_TOKEN } from '../constants';
import { Button, Jumbotron } from 'react-bootstrap';

class WelcomePage extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)

    if(authToken) {
      return (
        <Redirect to='/dashboard'/>
      )
    }

    return (
      <Jumbotron>
        <div className="WelcomePage">
          <h1>Welcome to Jobs n' Stuff!</h1>
          <h3>Made for CMPT 470 by Group 1</h3>
          <Button href="/signup" bsStyle="primary">Create Account</Button>
        </div>
      </Jumbotron>
    );
  }
}

export default WelcomePage;
