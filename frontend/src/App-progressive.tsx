import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

// Simple test components to replace the complex ones
const SimpleSignIn = () => <div style={{padding: '40px', textAlign: 'center'}}><h2>🔐 Sign In Page</h2><p>Authentication would go here</p></div>;
const SimpleDashboard = () => <div style={{padding: '40px', textAlign: 'center'}}><h2>📊 Dashboard</h2><p>Dashboard content would go here</p></div>;
const SimpleLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
    <nav style={{ background: '#007bff', color: 'white', padding: '1rem', marginBottom: '2rem' }}>
      <h1 style={{ margin: 0 }}>🎯 Niyama Policy Platform</h1>
    </nav>
    <main style={{ padding: '0 2rem' }}>
      {children}
    </main>
  </div>
);

function App() {
  console.log('🚀 Progressive App loading...');

  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/sign-in" element={<SimpleSignIn />} />
          <Route
            path="/*"
            element={
              <SimpleLayout>
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<SimpleDashboard />} />
                  <Route path="*" element={<div style={{padding: '40px', textAlign: 'center'}}><h2>404 - Page Not Found</h2></div>} />
                </Routes>
              </SimpleLayout>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;