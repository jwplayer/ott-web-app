import React, { Component } from 'react';
import { I18nextProvider, getI18n } from 'react-i18next';
import type { Config } from 'types/Config';

import Router from './components/Router/Router';
import Root from './components/Root/Root';
import ConfigProvider from './providers/ConfigProvider';
import QueryProvider from './providers/QueryProvider';
import './i18n/config';
import './styles/main.scss';
import { restoreWatchHistory } from './stores/WatchHistoryStore';
import { initializeFavorites } from './stores/FavoritesStore';
import { initializeAccount } from './stores/AccountStore';

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
      restoreWatchHistory();
    }

    initializeFavorites();

    if (config.cleengId) {
      initializeAccount();
    }
  }

  configLoadingHandler = (isLoading: boolean) => {
    console.info(`Loading config: ${isLoading}`);
  };

  configErrorHandler = (error: Error) => {
    this.setState({ error });
    console.info('Error while loading the config.json:', error);
  };

  configValidationCompletedHandler = (config: Config) => {
    this.initializeServices(config);
  };

  render() {
    return (
      <I18nextProvider i18n={getI18n()}>
        <QueryProvider>
          <ConfigProvider
            configLocation={window.configLocation || './config.json'}
            onLoading={this.configLoadingHandler}
            onValidationError={this.configErrorHandler}
            onValidationCompleted={this.configValidationCompletedHandler}
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
