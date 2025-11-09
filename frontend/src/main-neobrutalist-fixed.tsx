import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-neobrutalist-fixed';
import './index.css'; // Include the Tailwind CSS with Neo-Brutal design system

console.log('🎯 Starting Neo-Brutalist Niyama App with new logo...');
console.log('Design System: Neo-Brutal with custom Niyama logo');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);