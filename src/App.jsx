import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import AuthenticatedRoute from './components/util/AuthenticatedRoute';

import Header from './components/header/Header';
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import CreateEvent from './components/CreateEvent';
import Login from './components/Login';
import Signup from './components/Signup';
import ManagePostings from './components/business/ManagePostings';
import JobPostingsTable from './components/JobPostingsTable';
import ChangePassword from './components/ChangePassword'
import Job from './components/Job';
import ManageUsers from './components/admin/ManageUsers';
import Documents from './components/Documents';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ValidateEmail from './components/ValidateEmail';
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
              <AuthenticatedRoute exact path='/create-event' component={CreateEvent} />
              <AuthenticatedRoute exact path='/change-password/:username' component={ChangePassword} />
              <AuthenticatedRoute exact path='/jobs/:jobid' component={Job} />
              <AuthenticatedRoute exact path='/jobs/' component={JobPostingsTable} />
              <AuthenticatedRoute exact path='/manage-users' component={ManageUsers} />
              <AuthenticatedRoute exact path='/documents/:username' component={Documents} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
