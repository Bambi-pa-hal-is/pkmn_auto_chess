import React, { Component } from 'react';
import { sendNameToServer, ready } from './socket';

class App extends Component {
  // Event listener example, can be attached to example buttons
  exampleEvent = () => {
    // Event logic
    console.log('xd');
    // Get required and relevant data from this.props
    const { dispatch, name } = this.props;
    // dispatch can be used to change state values
    ready();
    //dispatch({ type: 'MEMES' });
    // Example: Send data to server
    //sendNameToServer(name)
  };

  render() {
    return <div>
      <button onClick={this.exampleEvent}>The button of ready</button>
      <p>State: {this.state}</p>
      <p>State: {this.props.test}</p>
    </div>;
  }
}

const mapStateToProps = state => ({
  pot: state.pot,
  name: state.name,
  names: state.names,
  snackbarIsOpen: state.snackbarIsOpen,
  mode: state.mode,
  whoDidIt: state.whoDidIt
});

// export default connect(mapStateToProps)(App);
// TODO: Add react code here to connect to the reducer (state)

export default App;
