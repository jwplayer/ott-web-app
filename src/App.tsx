import React from 'react';

import QueryProvider from './providers/QueryProvider';
import ConfigProvider from './providers/configProvider';
import Slider from './containers/Slider';

import './styles/main.scss';

function App() {
  return (
    <QueryProvider>
      <ConfigProvider
        configLocation={window.configLocation}
        onLoading={(isLoading: boolean) =>
          console.info(`Loading config: ${isLoading}`)
        }
        onValidationError={(error: Error) => console.error(`Config ${error}`)}
      >
        <div className="App">
          <Slider />
        </div>
      </ConfigProvider>
    </QueryProvider>
  );
}

export default App;
