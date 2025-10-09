import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-fixed';
import './index.css'; // Include the CSS

console.log('🚀 Starting Fixed Niyama App...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);