import React from 'react';

import QueryProvider from './providers/QueryProvider';
import ConfigProvider from './providers/configProvider';
import Home from './screens/Home/Home';

import './styles/main.scss';

function App() {
  return (
    <ConfigProvider
      configLocation={window.configLocation}
      onLoading={(isLoading: boolean) =>
        console.info(`Loading config: ${isLoading}`)
      }
      onValidationError={(error: Error) => console.error(`Config ${error}`)}
    >
      <QueryProvider>
        <div className="App">
          <Home />
        </div>
      </QueryProvider>
    </ConfigProvider>
  );
}

export default App;
