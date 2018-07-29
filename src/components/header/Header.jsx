import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { AUTH_TOKEN, USER_TOKEN } from '../../constants';
import LogoutModal from '../LogoutModal';
import LoggedInNavBar from './LoggedInNavBar';
import NewUserNavBar from './NewUserNavBar';
import '../../styles/Header.css';

class Header extends Component {
  state = { showSignout: false };

  openLogout = () => {
    this.setState({ showSignout: true });
  }

  closeLogout = () => {
    this.setState({ showSignout: false });
  }

  logout = () => {
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
              ? <LoggedInNavBar username={userToken.username} onClick={this.openLogout} />
              : <NewUserNavBar />}
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
}

export default withRouter(Header);
