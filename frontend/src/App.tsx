import { Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Policies } from './pages/Policies';
import { PolicyEditor } from './pages/PolicyEditor';
import { Templates } from './pages/Templates';
import { Compliance } from './pages/Compliance';
import { ValidationPage } from './pages/ValidationPage';
import { CloudInventory } from './pages/CloudInventory';
import { DriftDetection } from './pages/DriftDetection';
import { Scheduler } from './pages/Scheduler';
import { Monitoring } from './pages/Monitoring';
import { Settings } from './pages/Settings';
import { Analytics } from './pages/Analytics';
import { NotFound } from './pages/NotFound';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Get Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// For development, disable Clerk if no key is provided or if it's a placeholder
const useAuth = !!clerkPubKey && 
                clerkPubKey !== 'pk_test_placeholder' && 
                clerkPubKey !== 'pk_test_your_clerk_publishable_key_here' &&
                clerkPubKey.trim() !== '';

console.log('🔧 Clerk key:', clerkPubKey);
console.log('🔧 Use auth:', useAuth);

if (!useAuth) {
  console.log('🔓 Running in development mode without authentication');
}

function App() {
  // Development mode without authentication
  if (!useAuth) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <Layout>
            <Routes>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="policies" element={<Policies />} />
              <Route path="policies/:id/edit" element={<PolicyEditor />} />
              <Route path="policies/new" element={<PolicyEditor />} />
              <Route path="templates" element={<Templates />} />
              <Route path="compliance" element={<Compliance />} />
              <Route path="validation" element={<ValidationPage />} />
              <Route path="inventory" element={<CloudInventory />} />
              <Route path="drift" element={<DriftDetection />} />
              <Route path="scheduler" element={<Scheduler />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Layout>
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Production mode with authentication
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkPubKey}>
        <ThemeProvider>
          <ToastProvider>
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
                        <Route path="validation" element={<ValidationPage />} />
                        <Route path="inventory" element={<CloudInventory />} />
                        <Route path="drift" element={<DriftDetection />} />
                        <Route path="scheduler" element={<Scheduler />} />
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
          </ToastProvider>
        </ThemeProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;
