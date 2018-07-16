import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AUTH_TOKEN } from '../constants';
import BusinessApprovalRequestForm from './BusinessApprovalRequestForm';

class UpdateDetails extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)

    if(!authToken) {
      return (
        <Redirect to='login'/>
      )
    }

    return (
      <div className="UpdateDetails">
        <h1>This is the page where a business can update their details for admin verification</h1>
      </div>
    );
  }
}

export default CreateEvent;
