import React from 'react';
import ReactDOM from 'react-dom';

import 'wicg-inert';

import registerServiceWorker from './registerServiceWorker';
import App from './App';
import { isDevCompileTimeConstant } from './utils/common';

// This code is only used for (integration) testing and will be optimized away in production builds
if (isDevCompileTimeConstant) {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const configFile = urlSearchParams.get('c') || window.sessionStorage.getItem('config-file-override');

  // Use session storage to cache any config location override set from the url parameter so it can be restored
  // on subsequent navigation if the query string gets lost, but it doesn't persist if you close the tab
  if (configFile) {
    window.sessionStorage.setItem('config-file-override', configFile);
  }

  window.configLocation = configFile ? `/test-data/config.${configFile}.json` : '/config.json';
}

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
