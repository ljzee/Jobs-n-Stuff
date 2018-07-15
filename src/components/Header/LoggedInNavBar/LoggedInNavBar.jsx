import React from 'react';
import { Nav, Navbar, NavItem } from 'react-bootstrap';

const LoggedInNavBar = ({ username, onClick }) => (
  <Navbar inverse staticTop>
    <Navbar.Header>
      <Navbar.Brand>
        <a href="/dashboard">Dashboard</a>
      </Navbar.Brand>
    </Navbar.Header>
    <Nav pullRight>
      <NavItem eventKey={1} href={`/profile/${username}`}>Profile</NavItem>
      <NavItem eventKey={2} href="/create-event">Create Event</NavItem>
      <NavItem eventKey={3} onClick={onClick}>
        Logout
      </NavItem>
    </Nav>
  </Navbar>
);

export default LoggedInNavBar;
