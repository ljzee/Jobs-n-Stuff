import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AUTH_TOKEN } from '../constants';

class CreateEvent extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)

    if(!authToken) {
      return (
        <Redirect to='login'/>
      )
    }

    return (
      <div className="CreateEvent">
        <h1>This is the page where company can create event</h1>
      </div>
    );
  }
}

export default CreateEvent;
