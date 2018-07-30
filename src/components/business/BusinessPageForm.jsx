import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AUTH_TOKEN } from '../../constants';
import BusinessApprovalRequestForm from './BusinessApprovalRequestForm';

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
        {/* TODO: If the business user is not approved render the business approval form */}
        <BusinessApprovalRequestForm />
        {/* Else render the profile form reusuable part -- shared with user*/}

        {/* Also render the profile form nonreusable part -- unique to business user*/}
      </div>
    );
  }
}

export default BusinessPageForm;
