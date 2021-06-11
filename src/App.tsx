import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider, getI18n } from 'react-i18next';

import Root from './components/Root/Root';
import ConfigProvider from './providers/ConfigProvider';
import QueryProvider from './providers/QueryProvider';
import UIStateProvider from './providers/uiStateProvider';
import './i18n/config';
import './styles/main.scss';
import { loadWatchHistory } from './store/WatchHistoryStore';
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

  componentDidMount() {
    loadWatchHistory();
  }

  render() {
    return (
      <I18nextProvider i18n={getI18n()}>
        <QueryProvider>
          <ConfigProvider
            configLocation={window.configLocation}
            onLoading={(isLoading: boolean) => console.info(`Loading config: ${isLoading}`)}
            onValidationError={(error: Error) => console.error(`Config ${error}`)}
          >
            <Router>
              <UIStateProvider>
                <Root error={this.state.error} />
              </UIStateProvider>
            </Router>
          </ConfigProvider>
        </QueryProvider>
      </I18nextProvider>
    );
  }
}

export default App;
