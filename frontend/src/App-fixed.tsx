import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

// Import only the working components first
// We'll add others back gradually

// Simple fallback components for now
const SimpleLayout = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
    <nav style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white', 
      padding: '1rem 2rem', 
      marginBottom: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🎯 Niyama Policy Platform</h1>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          Production Ready • AI Powered
        </div>
      </div>
    </nav>
    <main style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {children}
    </main>
  </div>
);

const SimpleDashboard = () => (
  <div>
    <div style={{ 
      background: 'white', 
      padding: '2rem', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    }}>
      <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>📊 Dashboard</h2>
      <p style={{ margin: '0', color: '#666', lineHeight: '1.6' }}>
        Welcome to Niyama! Your Policy as Code platform is ready for enterprise deployment.
      </p>
    </div>
    
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '1rem' 
    }}>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>🔐 Policies</h3>
        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>Manage your security policies</p>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>📋 Compliance</h3>
        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>Track compliance status</p>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>🤖 AI Assistant</h3>
        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>Generate policies with AI</p>
      </div>
    </div>
  </div>
);

const SimpleSignIn = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}>
    <div style={{ 
      background: 'white', 
      padding: '3rem', 
      borderRadius: '12px', 
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      textAlign: 'center',
      maxWidth: '400px',
      width: '100%',
      margin: '0 2rem'
    }}>
      <h2 style={{ margin: '0 0 1rem 0', color: '#333' }}>🔐 Sign In</h2>
      <p style={{ margin: '0 0 2rem 0', color: '#666' }}>
        Authentication system ready for integration
      </p>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        style={{ 
          width: '100%',
          padding: '12px 24px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          border: 'none', 
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500'
        }}
      >
        Continue to Dashboard
      </button>
    </div>
  </div>
);

function App() {
  console.log('🚀 Fixed App loading...');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SimpleSignIn />} />
        <Route
          path="/*"
          element={
            <SimpleLayout>
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<SimpleDashboard />} />
                <Route path="*" element={
                  <div style={{padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '8px'}}>
                    <h2>404 - Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </SimpleLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;