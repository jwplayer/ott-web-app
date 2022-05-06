import React from 'react';
import ReactDOM from 'react-dom';
import 'wicg-inert';

import registerServiceWorker from './registerServiceWorker';
import App from './App';
import { overrideConfig } from './utils/configOverride';

overrideConfig();

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();
