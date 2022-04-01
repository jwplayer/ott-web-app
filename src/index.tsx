import React from 'react';
import ReactDOM from 'react-dom';

import 'wicg-inert';

import registerServiceWorker from './registerServiceWorker';
import App from './App';
import { overrideConfig } from './utils/configOverride';

overrideConfig();

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
