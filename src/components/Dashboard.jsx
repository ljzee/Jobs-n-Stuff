import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AUTH_TOKEN } from '../constants';

class Dashboard extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)

    if(!authToken) {
      return (
        <Redirect to='login'/>
      )
    }

    return (
      <div className="Dashboard">
        <h1>This will be a landing page for users after logging in</h1>
      </div>
    );
  }
}

export default Dashboard;
