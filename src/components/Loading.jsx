import React from 'react';
import Spinner from 'react-spinkit'

class Loading extends React.Component {
  render() {
    return (
      <div className="Loading">
        <Spinner name="cube-grid" />
      </div>
    );
  }
}

export default Loading;
