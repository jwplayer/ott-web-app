import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Root from './components/Root/Root';
import './styles/main.scss';
import ConfigProvider from './providers/configProvider';

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
      <ConfigProvider
        configLocation={window.configLocation}
        onLoading={(isLoading: boolean) =>
          console.info(`Loading config: ${isLoading}`)
        }
        onValidationError={(error: Error) => console.error(`Config ${error}`)}
      >
        <Router>
          <Root error={this.state.error} />
        </Router>
      </ConfigProvider>
    );
  }
}

export default App;
