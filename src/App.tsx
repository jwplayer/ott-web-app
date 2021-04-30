import React from 'react';

import Slider from './containers/Slider';
import ConfigProvider from './providers/configProvider';

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
      <div className="App">
        <Slider />
      </div>
    </ConfigProvider>
  );
}

export default App;
