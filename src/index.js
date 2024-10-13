
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(

  <React.StrictMode>
    <div id='Alertvalue'>
    </div>
    
    <div className="w-full h-screen flex items-center justify-center bg-zinc-900">
      <div className="chessboard w-96 h-96 bg-red-800"></div>
    </div>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
