import React from 'react';
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export const Monitoring: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-niyama-black mb-2 text-display">
          Monitoring
        </h1>
        <p className="text-niyama-gray-600 text-body">
          Real-time monitoring of policy enforcement and system health
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-niyama-accent flex items-center justify-center shadow-brutal mr-4">
              <Activity className="h-6 w-6 text-niyama-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-niyama-gray-600 uppercase tracking-wide">System Uptime</p>
              <p className="text-2xl font-bold text-niyama-black">99.9%</p>
            </div>
          </div>
        </div>

        <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-niyama-success flex items-center justify-center shadow-brutal mr-4">
              <CheckCircle className="h-6 w-6 text-niyama-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-niyama-gray-600 uppercase tracking-wide">Policy Evaluations</p>
              <p className="text-2xl font-bold text-niyama-black">1.2M</p>
            </div>
          </div>
        </div>

        <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-niyama-warning flex items-center justify-center shadow-brutal mr-4">
              <AlertTriangle className="h-6 w-6 text-niyama-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-niyama-gray-600 uppercase tracking-wide">Active Alerts</p>
              <p className="text-2xl font-bold text-niyama-black">7</p>
            </div>
          </div>
        </div>

        <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-niyama-info flex items-center justify-center shadow-brutal mr-4">
              <TrendingUp className="h-6 w-6 text-niyama-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-niyama-gray-600 uppercase tracking-wide">Response Time</p>
              <p className="text-2xl font-bold text-niyama-black">45ms</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal">
          <div className="bg-niyama-gray-100 border-b-2 border-niyama-black p-6">
            <h3 className="text-xl font-bold text-niyama-black text-heading">System Health</h3>
            <p className="text-niyama-gray-600 text-body mt-1">
              Current status of all system components
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'API Server', status: 'healthy', uptime: '99.9%' },
                { name: 'Database', status: 'healthy', uptime: '99.8%' },
                { name: 'OPA Engine', status: 'healthy', uptime: '99.9%' },
                { name: 'AI Service', status: 'degraded', uptime: '98.5%' },
                { name: 'Monitoring', status: 'healthy', uptime: '99.9%' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 border-2 border-niyama-black bg-niyama-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 border-2 border-niyama-black ${
                      service.status === 'healthy' ? 'bg-niyama-success' :
                      service.status === 'degraded' ? 'bg-niyama-warning' :
                      'bg-niyama-error'
                    }`} />
                    <div>
                      <p className="text-sm font-bold text-niyama-black uppercase tracking-wide">
                        {service.name}
                      </p>
                      <p className="text-xs text-niyama-gray-600 font-mono">
                        Uptime: {service.uptime}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 border-2 border-niyama-black font-bold uppercase tracking-wide ${
                    service.status === 'healthy' ? 'bg-niyama-success text-niyama-white' :
                    service.status === 'degraded' ? 'bg-niyama-warning text-niyama-white' :
                    'bg-niyama-error text-niyama-white'
                  }`}>
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal">
          <div className="bg-niyama-gray-100 border-b-2 border-niyama-black p-6">
            <h3 className="text-xl font-bold text-niyama-black text-heading">Recent Alerts</h3>
            <p className="text-niyama-gray-600 text-body mt-1">
              Latest system alerts and notifications
            </p>
          </div>
          <div className="p-6">
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
                <div key={index} className="flex items-start space-x-3 p-4 border-2 border-niyama-black bg-niyama-gray-100">
                  <div className={`w-8 h-8 border-2 border-niyama-black flex items-center justify-center ${
                    alert.severity === 'critical' ? 'bg-niyama-error' :
                    alert.severity === 'high' ? 'bg-niyama-error' :
                    alert.severity === 'medium' ? 'bg-niyama-warning' :
                    'bg-niyama-success'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 text-niyama-white`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-niyama-black uppercase tracking-wide">
                      {alert.title}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-xs text-niyama-gray-600 font-mono uppercase tracking-wide">
                        {alert.type}
                      </span>
                      <span className="text-xs text-niyama-gray-600 font-mono">
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






