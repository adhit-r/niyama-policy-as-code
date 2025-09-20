import React from 'react';
import { useQuery } from 'react-query';
import { api } from '../services/api';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Activity,
  Users,
  FileText,
  Zap
} from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading } = useQuery(
    'dashboard-metrics',
    () => api.getMetrics(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const { data: alerts, isLoading: alertsLoading } = useQuery(
    'dashboard-alerts',
    () => api.getAlerts({ limit: 5 }),
    {
      refetchInterval: 60000, // Refresh every minute
    }
  );

  if (metricsLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Active Policies',
      value: metrics?.activePolicies || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: Shield,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      name: 'Policy Violations',
      value: metrics?.violations || 0,
      change: '-8%',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100',
    },
    {
      name: 'Compliance Score',
      value: `${metrics?.complianceScore || 0}%`,
      change: '+5%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      name: 'Evaluations Today',
      value: metrics?.evaluationsToday || 0,
      change: '+23%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'text-enforcement-600',
      bgColor: 'bg-enforcement-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display font-semibold text-charcoal-800">
          Dashboard
        </h1>
        <p className="mt-2 text-body text-slate-600">
          Overview of your Policy as Code platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="metric-card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-charcoal-800">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <TrendingUp className={`h-4 w-4 ${
                    stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                  }`} />
                  <span className={`ml-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="ml-1 text-sm text-slate-500">from last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Alerts</h3>
            <p className="card-description">
              Latest policy violations and system alerts
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {alerts?.data?.map((alert: any) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    alert.severity === 'critical' ? 'bg-danger-100' :
                    alert.severity === 'high' ? 'bg-danger-100' :
                    alert.severity === 'medium' ? 'bg-warning-100' :
                    'bg-success-100'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      alert.severity === 'critical' ? 'text-danger-600' :
                      alert.severity === 'high' ? 'text-danger-600' :
                      alert.severity === 'medium' ? 'text-warning-600' :
                      'text-success-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-800">
                      {alert.title}
                    </p>
                    <p className="text-sm text-slate-600 truncate">
                      {alert.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-6">
                  <CheckCircle className="mx-auto h-12 w-12 text-success-400" />
                  <h3 className="mt-2 text-sm font-medium text-charcoal-800">No alerts</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    All systems are running smoothly
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
            <p className="card-description">
              Common tasks and shortcuts
            </p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <FileText className="h-8 w-8 text-primary-600 mb-2" />
                <span className="text-sm font-medium text-charcoal-800">Create Policy</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Shield className="h-8 w-8 text-success-600 mb-2" />
                <span className="text-sm font-medium text-charcoal-800">View Templates</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Zap className="h-8 w-8 text-ai-600 mb-2" />
                <span className="text-sm font-medium text-charcoal-800">AI Assistant</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Users className="h-8 w-8 text-enforcement-600 mb-2" />
                <span className="text-sm font-medium text-charcoal-800">Team Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">System Health</h3>
          <p className="card-description">
            Current status of all system components
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-success-100">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-800">API Server</p>
                <p className="text-xs text-success-600">Healthy</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-success-100">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-800">Database</p>
                <p className="text-xs text-success-600">Healthy</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-success-100">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-800">OPA Engine</p>
                <p className="text-xs text-success-600">Healthy</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-success-100">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal-800">AI Service</p>
                <p className="text-xs text-success-600">Healthy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

