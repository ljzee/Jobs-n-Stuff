import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AUTH_TOKEN } from '../constants';
import { Button, Jumbotron } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as actions from '../store/actions/index';
import { Alert } from 'react-bootstrap';


class WelcomePage extends Component {

  componentWillUnmount = () => {
    this.props.onUnmount();
  }

  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)

    if(authToken) {
      return (
        <Redirect to='/dashboard'/>
      )
    }

    return (
      <React.Fragment>
        {this.props.showEmailSentAlert &&
          <Alert bsStyle="success">
            A password reset email has been sent. Please check your inbox.
          </Alert>
        }
        <Jumbotron>
          <div className="WelcomePage">
            <h1>Welcome to Jobs n' Stuff!</h1>
            <h3>Made for CMPT 470 by Group 1</h3>
            <Button href="/signup" bsStyle="primary">Create Account</Button>
          </div>
        </Jumbotron>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    showEmailSentAlert: state.auth.showPasswordResetEmailAlert,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    onUnmount: () => dispatch(actions.passwordResetAlertShown),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(WelcomePage);
