import React from 'react';
import { CheckSquare, FileText, TrendingUp, AlertTriangle, Download } from 'lucide-react';

export const Compliance: React.FC = () => {
  const handleExportEvidence = async (framework: string) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const url = `${API_URL}/api/v1/evidence/export?framework=${framework}&format=csv`;
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Download file
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${framework}-evidence-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display font-semibold text-niyama-black">
          Compliance
        </h1>
        <p className="mt-2 text-body text-niyama-gray-600">
          Monitor and manage compliance across multiple frameworks
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-niyama-accent-light border-2 border-niyama-black">
                <CheckSquare className="h-6 w-6 text-niyama-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-niyama-gray-600">SOC 2 Score</p>
                <p className="text-2xl font-bold text-niyama-black">92%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-niyama-info-light border-2 border-niyama-black">
                <FileText className="h-6 w-6 text-niyama-info" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-niyama-gray-600">ISO 27001</p>
                <p className="text-2xl font-bold text-niyama-black">87%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 bg-niyama-warning-light border-2 border-niyama-black">
                <TrendingUp className="h-6 w-6 text-niyama-warning" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-niyama-gray-600">HIPAA</p>
                <p className="text-2xl font-bold text-niyama-black">78%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="p-3 bg-niyama-error-light border-2 border-niyama-black">
              <AlertTriangle className="h-6 w-6 text-niyama-error" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-niyama-gray-600">GDPR</p>
              <p className="text-2xl font-bold text-niyama-black">65%</p>
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
                    <p className="text-sm font-medium text-niyama-black">
                      {framework.name}
                    </p>
                    <div className="mt-1 w-full bg-niyama-gray-200 border-2 border-niyama-black h-2">
                      <div
                        className={`h-2 ${
                          framework.status === 'compliant' ? 'bg-niyama-accent' :
                          framework.status === 'partial' ? 'bg-niyama-warning' :
                          'bg-niyama-error'
                        }`}
                        style={{ width: `${framework.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-niyama-black">
                      {framework.score}%
                    </p>
                    <p className={`text-xs ${
                      framework.status === 'compliant' ? 'text-niyama-success' :
                      framework.status === 'partial' ? 'text-niyama-warning' :
                      'text-niyama-error'
                    }`}>
                      {framework.status}
                    </p>
                    <button
                      onClick={() => handleExportEvidence(framework.name)}
                      className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium border-2 border-niyama-black bg-niyama-accent-light hover:bg-niyama-accent text-niyama-black transition-colors"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </button>
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
                  <div className={`p-2 border-2 border-niyama-black ${
                    finding.severity === 'critical' ? 'bg-niyama-error-light' :
                    finding.severity === 'high' ? 'bg-niyama-error-light' :
                    finding.severity === 'medium' ? 'bg-niyama-warning-light' :
                    'bg-niyama-accent-light'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      finding.severity === 'critical' ? 'text-niyama-error' :
                      finding.severity === 'high' ? 'text-niyama-error' :
                      finding.severity === 'medium' ? 'text-niyama-warning' :
                      'text-niyama-success'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-niyama-black">
                      {finding.title}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-xs text-niyama-gray-500">
                        {finding.framework}
                      </span>
                      <span className={`text-xs px-2 py-1 border-2 border-niyama-black ${
                        finding.status === 'open' ? 'bg-niyama-error-light text-niyama-error' :
                        finding.status === 'acknowledged' ? 'bg-niyama-warning-light text-niyama-warning' :
                        'bg-niyama-accent-light text-niyama-accent'
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






