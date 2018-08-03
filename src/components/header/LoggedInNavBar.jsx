import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import gql from 'graphql-tag';
import Loading from '../Loading';

class LoggedInNavBar extends Component {

  renderAdminNavigationItems = () => {
    if (this.props.userQuery.user.role === 'ADMIN') {
      return (
        <React.Fragment>
          <NavItem eventKey={2} href="/manage-users">Manage Users</NavItem>
        </React.Fragment>)
    }

    return null;
  }


  renderBusinessNavigationItems = () => {
    if (this.props.userQuery.user.activated && this.props.userQuery.user.role === 'BUSINESS') {
      return (
        <React.Fragment>
          <NavItem eventKey={1} href={`/manage-postings/${this.props.username}`}>Manage Postings</NavItem>
          <NavItem eventKey={2} href={`/profile/${this.props.username}`}>Profile</NavItem>
        </React.Fragment>)
    } else if (!this.props.userQuery.user.activated && this.props.userQuery.user.role === 'BUSINESS') {
      return (
        <React.Fragment>
          <NavItem eventKey={1} href={`/profile/${this.props.username}`}>Profile</NavItem>
        </React.Fragment>)
    }

    return null;
  }

  renderUserNavigationItems = () => {
    if (this.props.userQuery.user.activated && this.props.userQuery.user.role === 'BASEUSER') {
      return (
        <React.Fragment>
          <NavItem eventKey={1} href={`/documents/${this.props.username}`}>Documents</NavItem>
          <NavItem eventKey={2} href={`/jobs`}>Job Postings</NavItem>
          <NavItem eventKey={3} href={`/applications/${this.props.username}`}>Applications</NavItem>
          <NavItem eventKey={4} href={`/profile/${this.props.username}`}>Profile</NavItem>
        </React.Fragment>)
    } else if (!this.props.userQuery.user.activated && this.props.userQuery.user.role === 'BASEUSER') {
      return (
        <React.Fragment>
          <NavItem eventKey={1} href={`/profile/${this.props.username}`}>Profile</NavItem>
        </React.Fragment>)
    }

    return null;
  }

  render () {

    if (this.props.userQuery.loading) {
      return <Loading />;
    }

    return (
      <Navbar inverse staticTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a id="brand" href="/dashboard">Jobs n' Stuff</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight>
          {this.renderAdminNavigationItems()}
          {this.renderBusinessNavigationItems()}
          {this.renderUserNavigationItems()}
          <NavItem eventKey={4} onClick={this.props.onClick}>
            Logout
          </NavItem>
        </Nav>
      </Navbar>
    )
  }
}

const USER_QUERY = gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      role
      activated
    }
  }
`

export default graphql(USER_QUERY, {
  name: 'userQuery',
  options: props => ({
    variables: {
        where: {
          username: props.username
        }
      },
  }),
})(LoggedInNavBar);
