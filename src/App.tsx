import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import Root from './components/Root/Root';
import ConfigProvider from './providers/ConfigProvider';
import QueryProvider from './providers/QueryProvider';
import UIStateProvider from './providers/uiStateProvider';
import './styles/main.scss';

interface State {
  error: Error | null;
}

class App extends Component {
  public state: State = {
    error: null,
  };

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    return (
      <QueryProvider>
        <ConfigProvider
          configLocation={window.configLocation}
          onLoading={(isLoading: boolean) => console.info(`Loading config: ${isLoading}`)}
          onValidationError={(error: Error) => console.error(`Config ${error}`)}
        >
          <UIStateProvider>
            <Router>
              <Root error={this.state.error} />
            </Router>
          </UIStateProvider>
        </ConfigProvider>
      </QueryProvider>
    );
  }
}

export default App;
