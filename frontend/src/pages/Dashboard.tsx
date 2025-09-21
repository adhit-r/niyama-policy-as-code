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
  Zap,
  BarChart3,
  Settings,
  Plus
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
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-niyama-black border-t-transparent animate-spin"></div>
        </div>
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
      color: 'text-niyama-white',
      bgColor: 'bg-niyama-accent',
    },
    {
      name: 'Policy Violations',
      value: metrics?.violations || 0,
      change: '-8%',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      color: 'text-niyama-white',
      bgColor: 'bg-niyama-accent',
    },
    {
      name: 'Compliance Score',
      value: `${metrics?.complianceScore || 0}%`,
      change: '+5%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'text-niyama-white',
      bgColor: 'bg-niyama-accent',
    },
    {
      name: 'Evaluations Today',
      value: metrics?.evaluationsToday || 0,
      change: '+23%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'text-niyama-white',
      bgColor: 'bg-niyama-accent',
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-niyama-black flex items-center justify-center shadow-brutal">
              <BarChart3 className="w-6 h-6 text-niyama-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-niyama-black">
                Dashboard
              </h1>
              <p className="text-body text-niyama-gray-600 mt-1">
                Overview of your Policy as Code platform
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
              <button className="btn-secondary btn-lg flex items-center justify-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </button>
              <button className="btn-accent btn-lg flex items-center justify-center">
                <Plus className="w-5 h-5 mr-2" />
                New Policy
              </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="metric-card" style={{backgroundColor: '#ffffff'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${stat.bgColor} flex items-center justify-center shadow-brutal`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-niyama-gray-600 uppercase tracking-wide">{stat.name}</p>
                    <p className="text-2xl font-bold text-niyama-black">{stat.value}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t-2 border-niyama-black">
                <div className="flex items-center">
                  <TrendingUp className={`h-4 w-4 ${
                    stat.changeType === 'positive' ? 'text-niyama-success' : 'text-niyama-error'
                  }`} />
                  <span className={`ml-2 text-sm font-bold ${
                    stat.changeType === 'positive' ? 'text-niyama-success' : 'text-niyama-error'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="ml-2 text-sm text-niyama-gray-600">from last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-niyama-error flex items-center justify-center shadow-brutal">
                <AlertTriangle className="w-4 h-4 text-niyama-white" />
              </div>
              <div>
                <h3 className="card-title">Recent Alerts</h3>
                <p className="card-description">
                  Latest policy violations and system alerts
                </p>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {alerts?.data?.map((alert: any) => (
                <div key={alert.id} className="flex items-start space-x-3 p-4 border-2 border-niyama-black bg-niyama-white">
                  <div className={`w-8 h-8 flex items-center justify-center shadow-brutal ${
                    alert.severity === 'critical' ? 'bg-niyama-error' :
                    alert.severity === 'high' ? 'bg-niyama-error' :
                    alert.severity === 'medium' ? 'bg-niyama-warning' :
                    'bg-niyama-success'
                  }`}>
                    <AlertTriangle className="h-4 w-4 text-niyama-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-niyama-black">
                      {alert.title}
                    </p>
                    <p className="text-sm text-niyama-gray-700 truncate">
                      {alert.message}
                    </p>
                    <p className="text-xs text-niyama-gray-600 mt-1 font-mono">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-niyama-success border-2 border-niyama-black rounded mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-niyama-white" />
                  </div>
                  <h3 className="text-heading-2 font-bold text-niyama-black mb-2">No alerts</h3>
                  <p className="text-niyama-gray-600">
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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                <Zap className="w-4 h-4 text-niyama-black" />
              </div>
              <div>
                <h3 className="card-title">Quick Actions</h3>
                <p className="card-description">
                  Common tasks and shortcuts
                </p>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-6 border-2 border-niyama-black bg-niyama-white hover:bg-niyama-accent hover:text-niyama-black transition-colors shadow-brutal-sm">
                <FileText className="h-8 w-8 mb-3 text-niyama-black" />
                <span className="text-sm font-bold text-niyama-black">Create Policy</span>
              </button>
              <button className="flex flex-col items-center p-6 border-2 border-niyama-black bg-niyama-white hover:bg-niyama-success hover:text-niyama-white transition-colors shadow-brutal-sm">
                <Shield className="h-8 w-8 mb-3 text-niyama-black" />
                <span className="text-sm font-bold text-niyama-black">View Templates</span>
              </button>
              <button className="flex flex-col items-center p-6 border-2 border-niyama-black bg-niyama-white hover:bg-niyama-info hover:text-niyama-white transition-colors shadow-brutal-sm">
                <Zap className="h-8 w-8 mb-3 text-niyama-black" />
                <span className="text-sm font-bold text-niyama-black">AI Assistant</span>
              </button>
              <button className="flex flex-col items-center p-6 border-2 border-niyama-black bg-niyama-white hover:bg-niyama-warning hover:text-niyama-black transition-colors shadow-brutal-sm">
                <Users className="h-8 w-8 mb-3 text-niyama-black" />
                <span className="text-sm font-bold text-niyama-black">Team Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-niyama-success flex items-center justify-center shadow-brutal">
              <Activity className="w-4 h-4 text-niyama-white" />
            </div>
            <div>
              <h3 className="card-title">System Health</h3>
              <p className="card-description">
                Current status of all system components
              </p>
            </div>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3 p-4 border-2 border-niyama-black bg-niyama-white">
              <div className="w-10 h-10 bg-niyama-success flex items-center justify-center shadow-brutal">
                <CheckCircle className="h-5 w-5 text-niyama-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-niyama-black">API Server</p>
                <p className="text-xs text-niyama-success font-mono">HEALTHY</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border-2 border-niyama-black bg-niyama-white">
              <div className="w-10 h-10 bg-niyama-success flex items-center justify-center shadow-brutal">
                <CheckCircle className="h-5 w-5 text-niyama-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-niyama-black">Database</p>
                <p className="text-xs text-niyama-success font-mono">HEALTHY</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border-2 border-niyama-black bg-niyama-white">
              <div className="w-10 h-10 bg-niyama-success flex items-center justify-center shadow-brutal">
                <CheckCircle className="h-5 w-5 text-niyama-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-niyama-black">OPA Engine</p>
                <p className="text-xs text-niyama-success font-mono">HEALTHY</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border-2 border-niyama-black bg-niyama-white">
              <div className="w-10 h-10 bg-niyama-success flex items-center justify-center shadow-brutal">
                <CheckCircle className="h-5 w-5 text-niyama-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-niyama-black">AI Service</p>
                <p className="text-xs text-niyama-success font-mono">HEALTHY</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


