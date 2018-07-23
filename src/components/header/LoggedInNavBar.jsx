import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { Nav, Navbar, NavItem } from 'react-bootstrap';

import USER_ROLE from '../../queries/user_role';


class LoggedInNavBar extends Component {

  renderAdminNavigationItems = () => {
    if (!this.props.userRole.loading && this.props.userRole.user.role === 'ADMIN') {
      return (
        <React.Fragment>
          <NavItem eventKey={4} href={"/manage-postings"}>Manage Postings</NavItem>
          <NavItem eventKey={5} href="/manage-users">Manage Users</NavItem>
        </React.Fragment>)
    }

    return null;
  }


  renderBusinessNavigationItems = () => {
    if (!this.props.userRole.loading && this.props.userRole.user.role === 'BUSINESS') {
      return (
        <React.Fragment>
          <NavItem eventKey={4} href={`/manage-postings`}>Manage Postings</NavItem>
          <NavItem eventKey={5} href="/create-event">Create Event</NavItem>
        </React.Fragment>)
    }

    return null;
  }

  renderUserNavigationItems = () => {
    if (!this.props.userRole.loading && this.props.userRole.user.role === 'BASEUSER') {
      return (
        <React.Fragment>
          <NavItem eventKey={4} href={`/documents/${this.props.username}`}>Documents</NavItem>
        </React.Fragment>)
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
          {this.renderAdminNavigationItems()}
          {this.renderBusinessNavigationItems()}
          {this.renderUserNavigationItems()}
          <NavItem eventKey={1} href={`/profile/${this.props.username}`}>Profile</NavItem>
          <NavItem eventKey={2} onClick={this.props.onClick}>
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
          username: props.username
        }
      },
  }),
})(LoggedInNavBar);
