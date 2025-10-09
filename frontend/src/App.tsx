import { Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Policies } from './pages/Policies';
import { PolicyEditor } from './pages/PolicyEditor';
import { Templates } from './pages/Templates';
import { Compliance } from './pages/Compliance';
import { Monitoring } from './pages/Monitoring';
import { Settings } from './pages/Settings';
import { Analytics } from './pages/Analytics';
import { NotFound } from './pages/NotFound';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Get Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';

// For development, we'll use a placeholder key if none is provided
if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.warn('⚠️ Using placeholder Clerk key for development. Set VITE_CLERK_PUBLISHABLE_KEY for production.');
}

function App() {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkPubKey}>
        <ThemeProvider>
          <ClerkLoading>
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <Routes>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="policies" element={<Policies />} />
                        <Route path="policies/:id/edit" element={<PolicyEditor />} />
                        <Route path="policies/new" element={<PolicyEditor />} />
                        <Route path="templates" element={<Templates />} />
                        <Route path="compliance" element={<Compliance />} />
                        <Route path="monitoring" element={<Monitoring />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ClerkLoaded>
        </ThemeProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;
