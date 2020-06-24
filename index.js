import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import config from './config';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App 
    apiKey={config.API_KEY}
    sessionId={config.SESSION_ID}
    token={config.TOKEN}
    />, document.querySelector('#root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
