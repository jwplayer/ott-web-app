

import React from 'react';
// import ReactDOM from 'react-dom';

import App from './App';
import reportWebVitals from './reportWebVitals';

console.log('frontend works')
const ChatRoom = () => {
  // const ChatRoot = ReactDOM.createRoot(document.getElementById('root'));
  // ChatRoot.render(
  //   <React.StrictMode>
  //     <App />
  //   </React.StrictMode>
  // );
  
  return (
    <React.StrictMode>
       <App />
    </React.StrictMode>
  )
}

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();

export default ChatRoom;