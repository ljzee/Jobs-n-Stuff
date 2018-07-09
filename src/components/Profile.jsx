import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AUTH_TOKEN } from '../constants';

class Profile extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)

    if(!authToken) {
      return (
        <Redirect to='login'/>
      )
    }

    return (
      <div className="Profile">
        <h1>This page will have all of the users profile information</h1>
      </div>
    );
  }
}

export default Profile;
