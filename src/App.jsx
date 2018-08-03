import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import AuthenticatedRoute from './components/util/AuthenticatedRoute';

import Header from './components/header/Header';
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Login from './components/authentication/Login';
import Signup from './components/authentication/Signup';
import ManagePostings from './components/business/ManagePostings';
import ChangePassword from './components/authentication/ChangePassword'
import JobPostingsTable from './components/jobs/JobPostingsTable';
import Job from './components/jobs/Job';
import BusinessJob from './components/jobs/BusinessJob';
import ManageUsers from './components/admin/ManageUsers';
import Documents from './components/users/Documents';
import ForgotPassword from './components/authentication/ForgotPassword';
import ResetPassword from './components/authentication/ResetPassword';
import ValidateEmail from './components/authentication/ValidateEmail';
import JobApplications from './components/jobs/JobApplications';
import UserApplications from './components/users/UserApplications';
import './styles/App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Header />
          <div className="container">
            <Switch>
              <Route exact path='/' component={WelcomePage} />
              <Route exact path='/login' component={Login} />
              <Route exact path='/signup' component={Signup} />
              <Route exact path='/forgot-password' component={ForgotPassword} />
              <Route exact path='/reset-password/:resetpasstoken' component={ResetPassword} />
              <Route exact path='/validate-email/:emailtoken' component={ValidateEmail} />
              <AuthenticatedRoute exact path='/dashboard' component={Dashboard} />
              <AuthenticatedRoute exact path='/manage-postings/:username' component={ManagePostings} />
              <AuthenticatedRoute exact path='/profile/:username' component={Profile} />
              <AuthenticatedRoute exact path='/manage-postings/:username/:jobid' component={BusinessJob} />
              <AuthenticatedRoute exact path='/change-password/:username' component={ChangePassword} />
              <AuthenticatedRoute exact path='/jobs/:jobid' component={Job} />
              <AuthenticatedRoute exact path='/jobs/' component={JobPostingsTable} />
              <AuthenticatedRoute exact path='/manage-users' component={ManageUsers} />
              <AuthenticatedRoute exact path='/documents/:username' component={Documents} />
              <AuthenticatedRoute exact path='/job-applications/:jobid' component={JobApplications} />
              <AuthenticatedRoute exact path='/applications/:username' component={UserApplications} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
