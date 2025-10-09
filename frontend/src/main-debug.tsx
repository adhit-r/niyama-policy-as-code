import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-debug';

console.log('🚀 Starting Niyama Frontend Debug Mode...');
console.log('Timestamp:', new Date().toISOString());
console.log('Environment:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_API_URL);

// Check if root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 50px;">❌ Root element not found!</h1>';
} else {
  console.log('✅ Root element found, mounting React app...');
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ React app mounted successfully!');
  } catch (error) {
    console.error('❌ Error mounting React app:', error);
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: system-ui;">
        <h1 style="color: red;">❌ React Mount Error</h1>
        <pre style="background: #f5f5f5; padding: 20px; border-radius: 5px;">${error.message}</pre>
      </div>
    `;
  }
}