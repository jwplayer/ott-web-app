import React from 'react';
import ReactDOM from 'react-dom';
import 'wicg-inert';
import { registerSW } from 'virtual:pwa-register';

import App from './App';

import { IS_DEMO_MODE } from '#src/utils/common';

ReactDOM.render(<App />, document.getElementById('root'));

// Only use PWA with prod and demo modes to avoid test / debug headaches with cached versions
if (import.meta.env.MODE === 'prod' || IS_DEMO_MODE) {
  registerSW();
}
