import React from 'react';
import ReactDOM from 'react-dom';
import 'wicg-inert';
import { registerSW } from 'virtual:pwa-register';

import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));

registerSW();
