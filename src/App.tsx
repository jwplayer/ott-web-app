import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Root from './components/Root/Root';
import './styles/main.scss';

interface State {
  error: Error | null;
}

class App extends Component<State> {
  public state: State = {
    error: null,
  };

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    return (
      <Router>
        <Root error={this.state.error} />
      </Router>
    );
  }
}

export default App;
