import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 Niyama Frontend is Working!</h1>
      <p>If you can see this, the React app is loading correctly.</p>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Environment Check:</h3>
        <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</p>
        <p><strong>Clerk Key:</strong> {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set'}</p>
        <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>API Test:</h3>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/v1/policies');
              const data = await response.json();
              console.log('API Response:', data);
              alert('API working! Check console for details.');
            } catch (error) {
              console.error('API Error:', error);
              alert('API Error: ' + error.message);
            }
          }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test API Connection
        </button>
      </div>
    </div>
  );
}

export default App;