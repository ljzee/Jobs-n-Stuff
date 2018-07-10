import React, { Component } from 'react';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { AUTH_TOKEN, USER_TOKEN } from '../constants';

class Header extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN);
    const userToken = JSON.parse(localStorage.getItem(USER_TOKEN));
    return (
      <header>
          {(authToken && userToken)
            ? this.loggedInNavBar(userToken)
            : this.newUserNavBar()}
      </header>
    );
  }

  loggedInNavBar(userToken) {
    return (
      <Navbar inverse staticTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/dashboard">Dashboard</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight>
          <NavItem eventKey={1} href={"/profile/" + userToken.id}>Profile</NavItem>
          <NavItem eventKey={2} href="/create-event">Create Event</NavItem>
          <NavItem eventKey={3} href="/upload-file">Upload File</NavItem>
          <NavItem eventKey={4} href="/"
            onClick={() => {
              localStorage.removeItem(AUTH_TOKEN);
              localStorage.removeItem(USER_TOKEN);
              this.props.history.push(`/`);
            }}
          >
            Logout
          </NavItem>
        </Nav>
      </Navbar>
    );
  }

  newUserNavBar() {
    return (
      <Navbar inverse staticTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/">Website Name</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight>
          <NavItem eventKey={1} href="/login">Login</NavItem>
          <NavItem eventKey={2} href="/signup">Signup</NavItem>
        </Nav>
      </Navbar>
    );
  }
}

export default withRouter(Header);
