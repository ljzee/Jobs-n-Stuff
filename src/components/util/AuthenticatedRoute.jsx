import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { AUTH_TOKEN } from '../../constants';

const AuthenticatedRoute = ({ component: Component, ...rest}) => {
  return (
    <Route
      {...rest}
      render = {(props) => (
        localStorage.getItem(AUTH_TOKEN) ?
          <Component {...props} />
          :
          <Redirect to="/login" />
      )}
    />
  );
};

export default AuthenticatedRoute;
