import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-simple';

console.log('🚀 Starting Niyama Frontend...');
console.log('Environment:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_API_URL);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);