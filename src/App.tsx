import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Root from './components/Root/Root';
import ConfigProvider from './providers/configProvider';
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
        <ConfigProvider
          configLocation={window.configLocation}
          onLoading={(isLoading: boolean) =>
            console.info(`Loading config: ${isLoading}`)
          }
          onValidationError={(error: Error) => console.error(`Config ${error}`)}
        >
          <Root error={this.state.error} />
        </ConfigProvider>
      </Router>
    );
  }
}

export default App;
