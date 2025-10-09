
// Minimal test component to isolate the issue
function App() {
    console.log('🚀 App component rendering...');
    console.log('Environment:', import.meta.env.MODE);
    console.log('API URL:', import.meta.env.VITE_API_URL);
    console.log('Clerk Key:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'Present' : 'Missing');

    return (
        <div style={{
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '10px',
                marginBottom: '30px',
                textAlign: 'center'
            }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>🎉 Niyama Frontend</h1>
                <p style={{ margin: '0', fontSize: '1.2em', opacity: '0.9' }}>
                    React app is loading successfully!
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>🔧 Environment</h3>
                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
                        <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</p>
                        <p><strong>Clerk Key:</strong> {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? '✅ Set' : '❌ Not set'}</p>
                        <p><strong>Dev:</strong> {import.meta.env.DEV ? '✅ Yes' : '❌ No'}</p>
                    </div>
                </div>

                <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>🌐 API Test</h3>
                    <button
                        onClick={async () => {
                            try {
                                console.log('Testing API connection...');
                                const response = await fetch('/api/v1/health');
                                const data = await response.json();
                                console.log('✅ API Response:', data);
                                alert('✅ API working! Check console for details.');
                            } catch (error) {
                                console.error('❌ API Error:', error);
                                alert('❌ API Error: ' + error.message);
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '12px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}
                    >
                        Test Backend Connection
                    </button>
                </div>
            </div>

            <div style={{
                background: '#d4edda',
                border: '1px solid #c3e6cb',
                color: '#155724',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 10px 0' }}>✅ Success Indicators</h3>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li>React is rendering components</li>
                    <li>Vite dev server is working</li>
                    <li>Environment variables are loading</li>
                    <li>JavaScript execution is normal</li>
                </ul>
            </div>

            <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                color: '#856404',
                padding: '20px',
                borderRadius: '8px'
            }}>
                <h3 style={{ margin: '0 0 10px 0' }}>🔍 Next Steps</h3>
                <p style={{ margin: '0' }}>
                    If you can see this page, the basic React setup is working.
                    The issue is likely in one of the complex components (Clerk, Layout, etc.).
                </p>
            </div>
        </div>
    );
}

export default App;