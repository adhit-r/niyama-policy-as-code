import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Policies } from './pages/Policies';
import { PolicyEditor } from './pages/PolicyEditor';
import { Templates } from './pages/Templates';
import { Compliance } from './pages/Compliance';
import { Monitoring } from './pages/Monitoring';
import { UserManagement } from './pages/UserManagement';
import { Settings } from './pages/Settings';
import { Analytics } from './pages/Analytics';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
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
                    <Route path="users" element={<UserManagement />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
