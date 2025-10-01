import React from 'react';
import { useQuery } from 'react-query';
import { api } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Activity,
  Users,
  FileText,
  Zap,
  BarChart3,
  Settings,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { Toast } from '../components/ui/Toast';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  
  const { 
    data: metrics, 
    isLoading: metricsLoading, 
    error: metricsError, 
    refetch: refetchMetrics,
    isFetching: metricsFetching 
  } = useQuery(
    'dashboard-metrics',
    () => api.getMetrics(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Failed to fetch metrics:', error);
      }
    }
  );

  const { 
    data: alerts, 
    isLoading: alertsLoading, 
    error: alertsError, 
    refetch: refetchAlerts,
    isFetching: alertsFetching 
  } = useQuery(
    'dashboard-alerts',
    () => api.getAlerts({ limit: 5 }),
    {
      refetchInterval: 30000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Failed to fetch alerts:', error);
      }
    }
  );

  const handleRefresh = () => {
    refetchMetrics();
    refetchAlerts();
  };

  if (metricsLoading || alertsLoading) {
    return (
      <div className="min-h-screen bg-niyama-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (metricsError || alertsError) {
    return (
      <div className="min-h-screen bg-niyama-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-niyama-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-niyama-black mb-2">Error Loading Dashboard</h2>
          <p className="text-niyama-gray-600 mb-4">
            {metricsError?.message || alertsError?.message || 'Failed to load dashboard data'}
          </p>
          <button 
            onClick={handleRefresh}
            className="btn-accent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-niyama-gray-100">
        {/* Header */}
        <div className="bg-niyama-white border-b-2 border-niyama-black shadow-brutal">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-niyama-accent flex items-center justify-center shadow-brutal">
                    <BarChart3 className="w-8 h-8 text-niyama-black" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-niyama-black text-display">
                      Dashboard
                    </h1>
                    <p className="text-body text-niyama-gray-600 mt-1">
                      Policy as Code platform overview and metrics
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleRefresh}
                  disabled={metricsFetching || alertsFetching}
                  className="btn-secondary btn-lg flex items-center justify-center"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${(metricsFetching || alertsFetching) ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="btn-accent btn-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  New Policy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Metrics Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <Shield className="w-6 h-6 text-niyama-black" />
                    </div>
                    <span className="text-2xl font-bold text-niyama-black">
                      {metrics?.totalPolicies || 0}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-niyama-black mb-1">Total Policies</h3>
                  <p className="text-niyama-gray-600">Active policy rules</p>
                </div>

                <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <CheckCircle className="w-6 h-6 text-niyama-black" />
                    </div>
                    <span className="text-2xl font-bold text-niyama-black">
                      {metrics?.compliantResources || 0}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-niyama-black mb-1">Compliant</h3>
                  <p className="text-niyama-gray-600">Resources in compliance</p>
                </div>

                <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <AlertTriangle className="w-6 h-6 text-niyama-black" />
                    </div>
                    <span className="text-2xl font-bold text-niyama-black">
                      {metrics?.violations || 0}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-niyama-black mb-1">Violations</h3>
                  <p className="text-niyama-gray-600">Policy violations</p>
                </div>

                <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <TrendingUp className="w-6 h-6 text-niyama-black" />
                    </div>
                    <span className="text-2xl font-bold text-niyama-black">
                      {metrics?.complianceScore || 0}%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-niyama-black mb-1">Compliance Score</h3>
                  <p className="text-niyama-gray-600">Overall compliance rate</p>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal">
                <div className="bg-niyama-black border-b-2 border-niyama-black p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <Activity className="w-4 h-4 text-niyama-black" />
                    </div>
                    <h3 className="text-lg font-bold text-niyama-white">Recent Alerts</h3>
                  </div>
                </div>
                <div className="p-6">
                  {alerts && alerts.length > 0 ? (
                    <div className="space-y-4">
                      {alerts.map((alert: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border-2 border-niyama-black bg-niyama-gray-100">
                          <div className={`w-3 h-3 rounded-full ${
                            alert.severity === 'high' ? 'bg-niyama-error' :
                            alert.severity === 'medium' ? 'bg-niyama-warning' :
                            'bg-niyama-accent'
                          }`} />
                          <div className="flex-1">
                            <p className="font-bold text-niyama-black">{alert.title}</p>
                            <p className="text-sm text-niyama-gray-600">{alert.description}</p>
                          </div>
                          <span className="text-xs text-niyama-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-niyama-gray-200 border-2 border-niyama-black mx-auto mb-4 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-niyama-black" />
                      </div>
                      <p className="text-niyama-gray-600 font-medium">No recent alerts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* System Status */}
              <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal">
                <div className="bg-niyama-black border-b-2 border-niyama-black p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <Wifi className="w-4 h-4 text-niyama-black" />
                    </div>
                    <h3 className="text-lg font-bold text-niyama-white">System Status</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3 p-4 border-2 border-niyama-black bg-niyama-white">
                    <div className="w-10 h-10 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <CheckCircle className="h-5 w-5 text-niyama-black" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-niyama-black">API Gateway</p>
                      <p className="text-xs text-niyama-accent font-mono">HEALTHY</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-niyama-black bg-niyama-white">
                    <div className="w-10 h-10 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <CheckCircle className="h-5 w-5 text-niyama-black" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-niyama-black">OPA Engine</p>
                      <p className="text-xs text-niyama-accent font-mono">HEALTHY</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-niyama-black bg-niyama-white">
                    <div className="w-10 h-10 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <CheckCircle className="h-5 w-5 text-niyama-black" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-niyama-black">AI Service</p>
                      <p className="text-xs text-niyama-accent font-mono">HEALTHY</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal">
                <div className="bg-niyama-black border-b-2 border-niyama-black p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <Zap className="w-4 h-4 text-niyama-black" />
                    </div>
                    <h3 className="text-lg font-bold text-niyama-white">Quick Actions</h3>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <button className="btn-accent w-full justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Policy
                  </button>
                  <button className="btn-secondary w-full justify-center">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </button>
                  <button className="btn-secondary w-full justify-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};