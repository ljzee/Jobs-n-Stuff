import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import AuthenticatedRoute from './components/Util/AuthenticatedRoute';

import Header from './components/header/Header';
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import CreateEvent from './components/CreateEvent';
import Login from './components/Login';
import Signup from './components/Signup';
import UploadFile from './components/UploadFile';
import ManagePostings from './components/business/ManagePostings';
import CreateJobPosting from './components/business/CreateJobPosting';
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
              <AuthenticatedRoute exact path='/dashboard' component={Dashboard} />
              <AuthenticatedRoute exact path='/manage-postings' component={ManagePostings} />
              <AuthenticatedRoute exact path='/create-posting' component={CreateJobPosting} />
              <Route exact path='/profile/:username' component={Profile} />
              <Route exact path='/create-event' component={CreateEvent} />
              <Route exact path='/upload-file' component={UploadFile} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
