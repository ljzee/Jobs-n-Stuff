import React, { Component } from 'react';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { AUTH_TOKEN, USER_TOKEN } from '../constants';
import LogoutModal from './LogoutModal';

class Header extends Component {
  constructor() {
    super()
    this.state = {
      showSignout: false,
    }

    this.openLogout = this.openLogout.bind(this);
    this.closeLogout = this.closeLogout.bind(this);
    this.logout = this.logout.bind(this);
  }

  openLogout() {
    this.setState({ showSignout: true });
  }

  closeLogout() {
    this.setState({ showSignout: false });
  }

  logout() {
    localStorage.removeItem(AUTH_TOKEN);
    localStorage.removeItem(USER_TOKEN);
    this.setState({ showSignout: false });
    this.props.history.push(`/`);
  }

  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN);
    const userToken = JSON.parse(localStorage.getItem(USER_TOKEN));
    return (
      <React.Fragment>
        <header>
            {(authToken && userToken)
              ? this.loggedInNavBar(userToken)
              : this.newUserNavBar()}
        </header>

        <LogoutModal
          show={this.state.showSignout}
          open={this.openLogout}
          close={this.closeLogout}
          logout={this.logout}
        />
      </React.Fragment>
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
          <NavItem eventKey={1} href={"/profile/" + userToken.username}>Profile</NavItem>
          <NavItem eventKey={2} href="/create-event">Create Event</NavItem>
          <NavItem eventKey={3} href="/upload-file">Upload File</NavItem>
          <NavItem eventKey={4} onClick={this.openLogout}>
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
