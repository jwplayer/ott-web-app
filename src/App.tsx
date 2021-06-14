import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider, getI18n } from 'react-i18next';
import type { Config } from 'types/Config';

import Root from './components/Root/Root';
import ConfigProvider from './providers/ConfigProvider';
import QueryProvider from './providers/QueryProvider';
import './i18n/config';
import './styles/main.scss';
import { initializeWatchHistory } from './store/WatchHistoryStore';

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

  initializeServices(config: Config) {
    if (config.options.enableContinueWatching) {
      initializeWatchHistory();
    }
  }

  render() {
    return (
      <I18nextProvider i18n={getI18n()}>
        <QueryProvider>
          <ConfigProvider
            configLocation={window.configLocation}
            onLoading={(isLoading: boolean) => console.info(`Loading config: ${isLoading}`)}
            onValidationError={(error: Error) => console.error(`Config ${error}`)}
            onValidationCompleted={(config) => this.initializeServices(config)}
          >
            <Router>
              <Root error={this.state.error} />
            </Router>
          </ConfigProvider>
        </QueryProvider>
      </I18nextProvider>
    );
  }
}

export default App;
