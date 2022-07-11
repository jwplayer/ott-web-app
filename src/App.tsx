import React, { Component } from 'react';
import { getI18n, I18nextProvider } from 'react-i18next';

import type { Config } from '#types/Config';
import Router from '#src/components/Router/Router';
import Root from '#src/components/Root/Root';
import LoadingOverlay from '#src/components/LoadingOverlay/LoadingOverlay';
import QueryProvider from '#src/providers/QueryProvider';
import { restoreWatchHistory } from '#src/stores/WatchHistoryController';
import { initializeAccount } from '#src/stores/AccountController';
import { initializeFavorites } from '#src/stores/FavoritesController';
import { logDev } from '#src/utils/common';
import { loadAndValidateConfig } from '#src/utils/configLoad';
import { clearStoredConfig } from '#src/utils/configOverride';
import { PersonalShelf } from '#src/enum/PersonalShelf';
import '#src/i18n/config';
import '#src/styles/main.scss';

interface State {
  error: Error | null;
  isLoading: boolean;
}

class App extends Component {
  public state: State = {
    error: null,
    isLoading: false,
  };

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  async initializeServices(config: Config) {
    if (config?.integrations?.cleeng?.id) {
      await initializeAccount();
    }

    // We only request favorites and continue_watching data if there is a corresponding content item
    // We first initialize the account otherwise if we have favorites saved as externalData and in a local storage the sections may blink
    if (config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
      await restoreWatchHistory();
    }

    if (config.content.some((el) => el.type === PersonalShelf.Favorites)) {
      await initializeFavorites();
    }
  }

  configLoadingHandler = (isLoading: boolean) => {
    this.setState({ isLoading });
    logDev(`Loading config: ${isLoading}`);
  };

  configErrorHandler = (error: Error) => {
    this.setState({ error });
    this.setState({ isLoading: false });
    clearStoredConfig();
    logDev('Error while loading the config.json:', error);
  };

  configValidationCompletedHandler = async (config: Config) => {
    this.setState({ isLoading: false });
    await this.initializeServices(config);
  };

  componentDidMount() {
    loadAndValidateConfig(this.configLoadingHandler, this.configErrorHandler, this.configValidationCompletedHandler);
  }

  render() {
    const { isLoading, error } = this.state;

    if (isLoading) {
      return <LoadingOverlay />;
    }

    return (
      <I18nextProvider i18n={getI18n()}>
        <QueryProvider>
          <Router>
            <Root error={error} />
          </Router>
        </QueryProvider>
      </I18nextProvider>
    );
  }
}

export default App;
