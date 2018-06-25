import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Header from './components/Header'
import WelcomePage from './components/WelcomePage'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import CreateEvent from './components/CreateEvent'
import Login from './components/Login'
import Signup from './components/Signup'

import './styles/App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Header />
          <div className="container">
            <Route exact path="/" component={WelcomePage} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/signup' component={Signup} />
            <Route exact path='/dashboard' component={Dashboard} />
            <Route exact path='/profile' component={Profile} />
            <Route exact path='/create-event' component={CreateEvent} />
          </div>
        </div>
      </Router>
    )
  }
}

export default App
