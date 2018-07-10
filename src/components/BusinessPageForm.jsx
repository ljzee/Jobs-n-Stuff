import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AUTH_TOKEN } from '../constants';

class BusinessPageForm extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)

    if(!authToken) {
      return (
        <Redirect to='login'/>
      )
    }

    return (
      <div className="BusinessPageForm">
        <h1>This is a business profile</h1>
      </div>
    );
  }
}

export default BusinessPageForm;
