import React, { Component } from 'react';
import { getI18n, I18nextProvider } from 'react-i18next';

import type { Config } from '#types/Config';
import Router from '#src/components/Router/Router';
import Root from '#src/components/Root/Root';
import ConfigProvider from '#src/providers/ConfigProvider';
import QueryProvider from '#src/providers/QueryProvider';
import { restoreWatchHistory } from '#src/stores/WatchHistoryController';
import { initializeAccount } from '#src/stores/AccountController';
import { initializeFavorites } from '#src/stores/FavoritesController';
import { logDev } from '#src/utils/common';

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
    if (config?.integrations?.cleeng?.id) {
      await initializeAccount();
    }

    // We only request favorites and continue_watching data if these features are enabled
    // We first initialize the account otherwise if we have favorites saved as externalData and in a local storage the sections may blink if data differs
    if (config?.features?.continueWatchingList) {
      await restoreWatchHistory();
    }

    if (config?.features?.favoritesList) {
      await initializeFavorites();
    }
  }

  configLoadingHandler = (isLoading: boolean) => {
    logDev(`Loading config: ${isLoading}`);
  };

  configErrorHandler = (error: Error) => {
    this.setState({ error });
    logDev('Error while loading the config.json:', error);
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
