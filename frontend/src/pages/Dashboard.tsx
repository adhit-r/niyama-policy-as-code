import React from 'react';
import { useQuery } from 'react-query';
import { api } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Users,
  FileText,
  BarChart3,
  Plus,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Settings
} from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = React.useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

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
      refetchInterval: 30000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Failed to fetch metrics:', error);
      }
    }
  );

  const { 
    data: alertsData,
    isLoading: alertsLoading, 
    error: alertsError, 
    refetch: refetchAlerts,
    isFetching: alertsFetching 
  } = useQuery(
    'dashboard-alerts',
    () => api.getAlerts(5),
    {
      refetchInterval: 30000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Failed to fetch alerts:', error);
      }
    }
  );

  const alerts = alertsData || [];

  const handleRefresh = () => {
    refetchMetrics();
    refetchAlerts();
  };

  if (metricsLoading || alertsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-12 border-2 border-gray-medium">
          <div className="w-20 h-20 bg-accent border-2 border-charcoal mx-auto mb-6 flex items-center justify-center shadow-brutal rounded">
            <LoadingSpinner size="lg" />
          </div>
          <p className="text-charcoal font-medium text-body-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (metricsError || alertsError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white border-2 border-charcoal shadow-brutal p-8 max-w-md">
          <AlertTriangle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-heading-2 font-bold text-charcoal mb-2">Connection Error</h3>
          <p className="text-charcoal mb-4 text-body">Unable to load dashboard data</p>
          <button 
            onClick={handleRefresh}
            className="px-6 py-3 bg-accent text-white border border-charcoal shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold rounded-md"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-niyama-black mb-2">
            {t('dashboard.title')}
          </h1>
          <p className="text-niyama-gray-600 text-lg">
            Monitor your policy compliance and system health
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={metricsFetching || alertsFetching}
            className="flex items-center space-x-2 px-4 py-3 bg-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 text-niyama-black ${(metricsFetching || alertsFetching) ? 'animate-spin' : ''}`} />
            <span className="font-bold">Refresh</span>
          </button>
          
          <button className="flex items-center space-x-2 px-6 py-3 bg-niyama-accent text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105 font-bold">
            <Plus className="w-5 h-5" />
            <span>New Policy</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Compliance Score */}
        <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg p-6 hover:shadow-brutal-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-niyama-success border-2 border-niyama-black flex items-center justify-center shadow-brutal">
              <CheckCircle className="w-6 h-6 text-niyama-white" />
            </div>
            <div className="flex items-center text-niyama-success">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-bold">+5.2%</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-niyama-black mb-1">94.2%</h3>
          <p className="text-niyama-gray-600 font-medium">Compliance Score</p>
        </div>

        {/* Active Policies */}
        <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg p-6 hover:shadow-brutal-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-niyama-info border-2 border-niyama-black flex items-center justify-center shadow-brutal">
              <Shield className="w-6 h-6 text-niyama-white" />
            </div>
            <div className="flex items-center text-niyama-info">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-bold">+12</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-niyama-black mb-1">247</h3>
          <p className="text-niyama-gray-600 font-medium">Active Policies</p>
        </div>

        {/* Violations */}
        <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg p-6 hover:shadow-brutal-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-niyama-warning border-2 border-niyama-black flex items-center justify-center shadow-brutal">
              <AlertTriangle className="w-6 h-6 text-niyama-white" />
            </div>
            <div className="flex items-center text-niyama-error">
              <ArrowDown className="w-4 h-4 mr-1" />
              <span className="text-sm font-bold">-8</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-niyama-black mb-1">23</h3>
          <p className="text-niyama-gray-600 font-medium">Violations</p>
        </div>

        {/* System Health */}
        <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg p-6 hover:shadow-brutal-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-niyama-accent border-2 border-niyama-black flex items-center justify-center shadow-brutal">
              <Activity className="w-6 h-6 text-niyama-black" />
            </div>
            <div className="flex items-center text-niyama-success">
              <div className="w-2 h-2 bg-niyama-success rounded-full animate-pulse"></div>
              <span className="text-sm font-bold ml-2">Online</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-niyama-black mb-1">99.9%</h3>
          <p className="text-niyama-gray-600 font-medium">System Uptime</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
            <div className="bg-niyama-gray-100 border-b-4 border-niyama-black p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-niyama-black">Recent Activity</h3>
                <button className="px-4 py-2 bg-niyama-accent text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold text-sm">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  icon: Shield,
                  title: "New Policy Created",
                  description: "Container Security Policy v2.1",
                  time: "2 minutes ago",
                  status: "success"
                },
                {
                  icon: AlertTriangle,
                  title: "Policy Violation",
                  description: "Network policy missing in production",
                  time: "15 minutes ago",
                  status: "warning"
                },
                {
                  icon: CheckCircle,
                  title: "Compliance Scan Complete",
                  description: "SOC 2 compliance check passed",
                  time: "1 hour ago",
                  status: "success"
                },
                {
                  icon: Users,
                  title: "User Access Updated",
                  description: "Admin permissions granted to John Doe",
                  time: "2 hours ago",
                  status: "info"
                }
              ].map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-niyama-gray-50 border-2 border-niyama-black hover:shadow-brutal transition-all duration-200">
                    <div className={`w-10 h-10 border-2 border-niyama-black flex items-center justify-center shadow-brutal ${
                      activity.status === 'success' ? 'bg-niyama-success' :
                      activity.status === 'warning' ? 'bg-niyama-warning' :
                      activity.status === 'error' ? 'bg-niyama-error' :
                      'bg-niyama-info'
                    }`}>
                      <Icon className="w-5 h-5 text-niyama-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-niyama-black">{activity.title}</h4>
                      <p className="text-niyama-gray-600 text-sm">{activity.description}</p>
                      <p className="text-niyama-gray-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
            <div className="bg-niyama-accent border-b-4 border-niyama-black p-4">
              <h3 className="text-lg font-bold text-niyama-black">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { icon: Plus, label: "Create Policy", color: "bg-niyama-accent" },
                { icon: FileText, label: "New Template", color: "bg-niyama-info" },
                { icon: BarChart3, label: "Run Report", color: "bg-niyama-success" },
                { icon: Settings, label: "Configure", color: "bg-niyama-warning" }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <button key={index} className={`w-full flex items-center space-x-3 p-3 border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105 ${action.color}`}>
                    <Icon className="w-5 h-5 text-niyama-black" />
                    <span className="font-bold text-niyama-black">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
            <div className="bg-niyama-gray-100 border-b-4 border-niyama-black p-4">
              <h3 className="text-lg font-bold text-niyama-black">System Status</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { name: "API Server", status: "online", uptime: "99.9%" },
                { name: "Database", status: "online", uptime: "99.8%" },
                { name: "OPA Engine", status: "online", uptime: "99.9%" },
                { name: "AI Service", status: "degraded", uptime: "98.5%" },
                { name: "Monitoring", status: "online", uptime: "99.9%" }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-niyama-gray-50 border-2 border-niyama-black">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 border border-niyama-black ${
                      service.status === 'online' ? 'bg-niyama-success' :
                      service.status === 'degraded' ? 'bg-niyama-warning' :
                      'bg-niyama-error'
                    }`} />
                    <span className="font-medium text-niyama-black">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold ${
                      service.status === 'online' ? 'text-niyama-success' :
                      service.status === 'degraded' ? 'text-niyama-warning' :
                      'text-niyama-error'
                    }`}>
                      {service.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-niyama-gray-600">{service.uptime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
