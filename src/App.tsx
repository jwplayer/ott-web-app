import React from 'react';

import Slider from './containers/Slider'
import QueryProvider from './providers/QueryProvider';


import './styles/main.scss';

function App() {
  return (
    <QueryProvider>
      <div className="App">
        <Slider />
      </div>
    </QueryProvider>
  );
}

export default App;
