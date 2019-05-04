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
        <Jumbotron  className="WelcomeJumbotron">
          <div>
            <h4 className="JumbotronMessage">The best time to start was yesterday, the next best time is now.</h4>
            <Button className="JumbotronButton" href="/signup" bsStyle="primary">Start Here</Button>
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
