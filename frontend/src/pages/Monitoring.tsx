import React from 'react';
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export const Monitoring: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display font-semibold text-charcoal-800">
          Monitoring
        </h1>
        <p className="mt-2 text-body text-slate-600">
          Real-time monitoring of policy enforcement and system health
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">System Uptime</p>
                <p className="text-2xl font-bold text-charcoal-800">99.9%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Policy Evaluations</p>
                <p className="text-2xl font-bold text-charcoal-800">1.2M</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-100">
                <AlertTriangle className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Alerts</p>
                <p className="text-2xl font-bold text-charcoal-800">7</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-enforcement-100">
                <TrendingUp className="h-6 w-6 text-enforcement-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Response Time</p>
                <p className="text-2xl font-bold text-charcoal-800">45ms</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">System Health</h3>
            <p className="card-description">
              Current status of all system components
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {[
                { name: 'API Server', status: 'healthy', uptime: '99.9%' },
                { name: 'Database', status: 'healthy', uptime: '99.8%' },
                { name: 'OPA Engine', status: 'healthy', uptime: '99.9%' },
                { name: 'AI Service', status: 'degraded', uptime: '98.5%' },
                { name: 'Monitoring', status: 'healthy', uptime: '99.9%' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      service.status === 'healthy' ? 'bg-success-100' :
                      service.status === 'degraded' ? 'bg-warning-100' :
                      'bg-danger-100'
                    }`}>
                      <div className={`h-2 w-2 rounded-full ${
                        service.status === 'healthy' ? 'bg-success-500' :
                        service.status === 'degraded' ? 'bg-warning-500' :
                        'bg-danger-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal-800">
                        {service.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Uptime: {service.uptime}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    service.status === 'healthy' ? 'bg-success-100 text-success-800' :
                    service.status === 'degraded' ? 'bg-warning-100 text-warning-800' :
                    'bg-danger-100 text-danger-800'
                  }`}>
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Alerts</h3>
            <p className="card-description">
              Latest system alerts and notifications
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {[
                {
                  title: 'High CPU usage detected',
                  type: 'performance',
                  severity: 'medium',
                  time: '2 minutes ago',
                },
                {
                  title: 'Policy evaluation timeout',
                  type: 'system',
                  severity: 'high',
                  time: '15 minutes ago',
                },
                {
                  title: 'Database connection pool exhausted',
                  type: 'system',
                  severity: 'critical',
                  time: '1 hour ago',
                },
                {
                  title: 'AI service rate limit exceeded',
                  type: 'ai',
                  severity: 'low',
                  time: '2 hours ago',
                },
              ].map((alert, index) => (
                <div key={index} className="flex items-start space-x-3">
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
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-xs text-slate-500">
                        {alert.type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {alert.time}
                      </span>
                    </div>
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

