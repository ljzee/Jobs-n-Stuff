import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { Nav, Navbar, NavItem } from 'react-bootstrap';

import USER_ROLE from '../../queries/user_role';


class LoggedInNavBar extends Component {

  renderBusinessNavigationItems = () => {
    if (!this.props.userRole.loading && this.props.userRole.user.role === 'BUSINESS') {
      return <NavItem eventKey={5} href={`/manage-postings`}>Manage Postings</NavItem>
    }
    return null;
  }

  render () {
    return (
      <Navbar inverse staticTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/dashboard">Dashboard</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight>
          {this.renderBusinessNavigationItems()}
          <NavItem eventKey={1} href={`/profile/${this.props.username}`}>Profile</NavItem>
          <NavItem eventKey={2} href="/create-event">Create Event</NavItem>
          <NavItem eventKey={3} href="/upload-file">Upload File</NavItem>
          <NavItem eventKey={4} onClick={this.props.onClick}>
            Logout
          </NavItem>
        </Nav>
      </Navbar>
    )
  }
}

export default graphql(USER_ROLE, {
  name: 'userRole',
  options: props => ({
    variables: {
        where: {
          id: props.userid
        }
      },
  }),
})(LoggedInNavBar);
