import React, { Component } from 'react'
import { Nav, Navbar, NavItem } from 'react-bootstrap'
import { withRouter } from 'react-router'
import { AUTH_TOKEN } from '../constants'

class Header extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)
    return (
      <header>
          {authToken
            ? this.loggedInNavBar()
            : this.newUserNavBar()}
      </header>
    )
  }

  loggedInNavBar() {
    return (
      <Navbar inverse staticTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/dashboard">Dashboard</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight>
          <NavItem eventKey={1} href="/profile">Profile</NavItem>
          <NavItem eventKey={2} href="/create-event">Create Event</NavItem>
          <NavItem eventKey={3} href="/"
            onClick={() => {
              localStorage.removeItem(AUTH_TOKEN)
              this.props.history.push(`/`)
            }}
          >
            Logout
          </NavItem>
        </Nav>
      </Navbar>
    )
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
    )
  }
}

export default withRouter(Header)
