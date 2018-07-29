import React from 'react';
import { Nav, Navbar, NavItem } from 'react-bootstrap';

const NewUserNavBar = () => (
  <Navbar inverse staticTop>
    <Navbar.Header>
      <Navbar.Brand>
        <a id="brand" href="/">Jobs n' Stuff</a>
      </Navbar.Brand>
    </Navbar.Header>
    <Nav pullRight>
      <NavItem eventKey={1} href="/login">Login</NavItem>
      <NavItem eventKey={2} href="/signup">Signup</NavItem>
    </Nav>
  </Navbar>
);

export default NewUserNavBar;
