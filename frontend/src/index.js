// import React from 'react';
// import ReactDOM from 'react-dom';
// import { Provider } from 'react-redux';
// import store from './store';
// import App from './App';
// import './index.css';
// import { GoogleOAuthProvider } from '@react-oauth/google';


// ReactDOM.render(
//   <Provider store={store}>
//     <App />
//   </Provider>,
//   document.getElementById('root')
// );


import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = '221641798990-tjggsbal6ffkec13snt89l2hgmad4eo5.apps.googleusercontent.com'

ReactDOM.render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </Provider>,
  document.getElementById('root')
);
