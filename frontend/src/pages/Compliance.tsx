import React from 'react';
import { CheckSquare, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

export const Compliance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display font-semibold text-charcoal-800">
          Compliance
        </h1>
        <p className="mt-2 text-body text-slate-600">
          Monitor and manage compliance across multiple frameworks
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100">
                <CheckSquare className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">SOC 2 Score</p>
                <p className="text-2xl font-bold text-charcoal-800">92%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">ISO 27001</p>
                <p className="text-2xl font-bold text-charcoal-800">87%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-100">
                <TrendingUp className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">HIPAA</p>
                <p className="text-2xl font-bold text-charcoal-800">78%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="p-3 rounded-lg bg-danger-100">
              <AlertTriangle className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">GDPR</p>
              <p className="text-2xl font-bold text-charcoal-800">65%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Compliance Frameworks</h3>
            <p className="card-description">
              Track progress across different compliance standards
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {[
                { name: 'SOC 2 Type II', score: 92, status: 'compliant' },
                { name: 'ISO 27001', score: 87, status: 'compliant' },
                { name: 'HIPAA', score: 78, status: 'partial' },
                { name: 'GDPR', score: 65, status: 'non-compliant' },
                { name: 'PCI DSS', score: 45, status: 'non-compliant' },
              ].map((framework) => (
                <div key={framework.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-charcoal-800">
                      {framework.name}
                    </p>
                    <div className="mt-1 w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          framework.status === 'compliant' ? 'bg-success-500' :
                          framework.status === 'partial' ? 'bg-warning-500' :
                          'bg-danger-500'
                        }`}
                        style={{ width: `${framework.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-charcoal-800">
                      {framework.score}%
                    </p>
                    <p className={`text-xs ${
                      framework.status === 'compliant' ? 'text-success-600' :
                      framework.status === 'partial' ? 'text-warning-600' :
                      'text-danger-600'
                    }`}>
                      {framework.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Findings</h3>
            <p className="card-description">
              Latest compliance issues and recommendations
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {[
                {
                  title: 'Missing encryption for sensitive data',
                  framework: 'SOC 2',
                  severity: 'high',
                  status: 'open',
                },
                {
                  title: 'Insufficient access logging',
                  framework: 'ISO 27001',
                  severity: 'medium',
                  status: 'acknowledged',
                },
                {
                  title: 'Data retention policy not implemented',
                  framework: 'GDPR',
                  severity: 'critical',
                  status: 'open',
                },
              ].map((finding, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    finding.severity === 'critical' ? 'bg-danger-100' :
                    finding.severity === 'high' ? 'bg-danger-100' :
                    finding.severity === 'medium' ? 'bg-warning-100' :
                    'bg-success-100'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      finding.severity === 'critical' ? 'text-danger-600' :
                      finding.severity === 'high' ? 'text-danger-600' :
                      finding.severity === 'medium' ? 'text-warning-600' :
                      'text-success-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-800">
                      {finding.title}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-xs text-slate-500">
                        {finding.framework}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        finding.status === 'open' ? 'bg-danger-100 text-danger-800' :
                        finding.status === 'acknowledged' ? 'bg-warning-100 text-warning-800' :
                        'bg-success-100 text-success-800'
                      }`}>
                        {finding.status}
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





