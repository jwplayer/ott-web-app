import React, { Component } from 'react';
import { getI18n, I18nextProvider } from 'react-i18next';

import type { Config } from '#types/Config';
import Router from '#src/components/Router/Router';
import Root from '#src/components/Root/Root';
import ConfigProvider from '#src/providers/ConfigProvider';
import QueryProvider from '#src/providers/QueryProvider';
import { restoreWatchHistory } from '#src/stores/WatchHistoryStore';
import { initializeFavorites } from '#src/stores/FavoritesStore';
import { initializeAccount } from '#src/stores/AccountStore';
import '#src/i18n/config';
import '#src/styles/main.scss';

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

  async initializeServices(config: Config) {
    if (config.options.enableContinueWatching) {
      await restoreWatchHistory();
    }

    await initializeFavorites();

    if (config.cleengId) {
      await initializeAccount();
    }
  }

  configLoadingHandler = (isLoading: boolean) => {
    console.info(`Loading config: ${isLoading}`);
  };

  configErrorHandler = (error: Error) => {
    this.setState({ error });
    console.info('Error while loading the config.json:', error);
  };

  configValidationCompletedHandler = async (config: Config) => {
    await this.initializeServices(config);
  };

  render() {
    return (
      <I18nextProvider i18n={getI18n()}>
        <QueryProvider>
          <ConfigProvider
            configLocation={window.configLocation || '/config.json'}
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
