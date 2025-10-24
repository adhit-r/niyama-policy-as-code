import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Clock, Server, Shield, Loader2, RefreshCw, Filter, Download, Eye, GitBranch } from 'lucide-react';

interface ResourceDrift {
  resource_id: string;
  resource_type: string;
  resource_name: string;
  region: string;
  drift_type: 'added' | 'removed' | 'modified' | 'configuration';
  severity: 'critical' | 'high' | 'medium' | 'low';
  changes: Array<{
    path: string;
    operation: 'added' | 'removed' | 'modified';
    old_value: any;
    new_value: any;
  }>;
  baseline_state: Record<string, any>;
  current_state: Record<string, any>;
  detected_at: string;
  impact: string;
  recommendation: string;
}

interface DriftResult {
  drift_id: string;
  provider: string;
  baseline_id: string;
  current_id: string;
  drifts: ResourceDrift[];
  summary: {
    total_drifts: number;
    drift_types: Record<string, number>;
    severity_counts: Record<string, number>;
    resource_types: Record<string, number>;
    regions: Record<string, number>;
    critical_drifts: number;
    high_drifts: number;
  };
  started_at: string;
  completed_at: string;
  duration_ms: number;
}

export const DriftDetection: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('aws');
  const [isDetecting, setIsDetecting] = useState(false);
  const [driftResult, setDriftResult] = useState<DriftResult | null>(null);
  const [driftHistory, setDriftHistory] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    region: '',
    severity: '',
    drift_type: '',
    resource_type: ''
  });

  const providers = [
    { id: 'aws', name: 'Amazon Web Services', icon: '☁️', color: 'bg-orange-100 text-orange-800' },
    { id: 'azure', name: 'Microsoft Azure', icon: '🔷', color: 'bg-blue-100 text-blue-800' },
    { id: 'gcp', name: 'Google Cloud Platform', icon: '🔵', color: 'bg-green-100 text-green-800' },
    { id: 'kubernetes', name: 'Kubernetes', icon: '⚙️', color: 'bg-purple-100 text-purple-800' }
  ];

  const driftTypes = [
    { type: 'added', name: 'Added', icon: '➕', color: 'bg-green-100 text-green-800' },
    { type: 'removed', name: 'Removed', icon: '➖', color: 'bg-red-100 text-red-800' },
    { type: 'modified', name: 'Modified', icon: '🔄', color: 'bg-yellow-100 text-yellow-800' },
    { type: 'configuration', name: 'Configuration', icon: '⚙️', color: 'bg-blue-100 text-blue-800' }
  ];

  useEffect(() => {
    loadDriftHistory();
  }, []);

  const loadDriftHistory = async () => {
    try {
      const response = await fetch('/api/v1/drift/history');
      const data = await response.json();
      setDriftHistory(data.drifts || []);
    } catch (error) {
      console.error('Failed to load drift history:', error);
    }
  };

  const detectDrift = async () => {
    setIsDetecting(true);
    try {
      const response = await fetch('/api/v1/drift/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          regions: filters.region ? [filters.region] : [],
          resource_type: filters.resource_type || undefined,
          filters: {}
        })
      });

      const result = await response.json();
      setDriftResult(result);
    } catch (error) {
      console.error('Drift detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getDriftTypeIcon = (type: string) => {
    const driftType = driftTypes.find(dt => dt.type === type);
    if (driftType) {
      return <span className="text-lg">{driftType.icon}</span>;
    }
    return <span className="text-lg">🔄</span>;
  };

  const getDriftTypeColor = (type: string) => {
    const driftType = driftTypes.find(dt => dt.type === type);
    return driftType?.color || 'bg-gray-100 text-gray-800';
  };

  const filteredDrifts = driftResult?.drifts.filter(drift => {
    if (filters.region && drift.region !== filters.region) return false;
    if (filters.severity && drift.severity !== filters.severity) return false;
    if (filters.drift_type && drift.drift_type !== filters.drift_type) return false;
    if (filters.resource_type && drift.resource_type !== filters.resource_type) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display font-semibold text-niyama-black">
          Drift Detection
        </h1>
        <p className="mt-2 text-body text-niyama-gray-600">
          Monitor configuration drift and detect unauthorized changes
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Detection Controls */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Detection Configuration</h3>
            <p className="card-description">
              Configure drift detection parameters
            </p>
          </div>
          <div className="card-content space-y-4">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cloud Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`p-3 text-left border-2 rounded-lg transition-colors ${
                      selectedProvider === provider.id
                        ? 'border-niyama-black bg-niyama-accent-light'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{provider.icon}</span>
                      <span className="text-sm font-medium">{provider.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  value={filters.region}
                  onChange={(e) => setFilters({...filters, region: e.target.value})}
                  placeholder="e.g., us-east-1"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-niyama-black focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({...filters, severity: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-niyama-black focus:outline-none"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drift Type
                </label>
                <select
                  value={filters.drift_type}
                  onChange={(e) => setFilters({...filters, drift_type: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-niyama-black focus:outline-none"
                >
                  <option value="">All Types</option>
                  {driftTypes.map((dt) => (
                    <option key={dt.type} value={dt.type}>{dt.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detect Button */}
            <button
              onClick={detectDrift}
              disabled={isDetecting}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-niyama-accent border-2 border-niyama-black rounded hover:bg-niyama-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Detecting Drift...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Detect Drift
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Drift Detection Results</h3>
              <p className="card-description">
                Configuration changes and drift analysis
              </p>
            </div>
            <div className="card-content">
              {!driftResult ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Run drift detection to see results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-red-50 border-2 border-red-200 rounded">
                      <div className="text-2xl font-bold text-red-800">
                        {driftResult.summary.critical_drifts}
                      </div>
                      <div className="text-sm text-red-600">Critical</div>
                    </div>
                    <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded">
                      <div className="text-2xl font-bold text-orange-800">
                        {driftResult.summary.high_drifts}
                      </div>
                      <div className="text-sm text-orange-600">High</div>
                    </div>
                    <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded">
                      <div className="text-2xl font-bold text-blue-800">
                        {driftResult.summary.total_drifts}
                      </div>
                      <div className="text-sm text-blue-600">Total Drifts</div>
                    </div>
                    <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded">
                      <div className="text-2xl font-bold text-purple-800">
                        {driftResult.duration_ms}ms
                      </div>
                      <div className="text-sm text-purple-600">Duration</div>
                    </div>
                  </div>

                  {/* Drift List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Detected Drifts ({filteredDrifts.length})
                      </h4>
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        <Download className="h-4 w-4 inline mr-1" />
                        Export Report
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredDrifts.map((drift, index) => (
                        <div
                          key={index}
                          className={`p-4 border-2 rounded-lg ${getSeverityColor(drift.severity)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getSeverityIcon(drift.severity)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getDriftTypeColor(drift.drift_type)}`}>
                                    {getDriftTypeIcon(drift.drift_type)} {drift.drift_type.toUpperCase()}
                                  </span>
                                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(drift.severity)}`}>
                                    {drift.severity.toUpperCase()}
                                  </span>
                                </div>
                                
                                <h5 className="font-medium text-gray-900 mb-1">
                                  {drift.resource_name} ({drift.resource_type})
                                </h5>
                                
                                <div className="text-sm text-gray-600 mb-2">
                                  {drift.region} • {drift.resource_id}
                                </div>

                                <div className="text-sm text-gray-700 mb-2">
                                  {drift.impact}
                                </div>

                                {drift.changes.length > 0 && (
                                  <div className="mt-2">
                                    <h6 className="text-sm font-medium text-gray-900 mb-1">Changes:</h6>
                                    <div className="space-y-1">
                                      {drift.changes.slice(0, 3).map((change, changeIndex) => (
                                        <div key={changeIndex} className="text-xs bg-gray-100 p-2 rounded border">
                                          <span className="font-medium">{change.path}</span>: 
                                          <span className="text-red-600"> {JSON.stringify(change.old_value)}</span> → 
                                          <span className="text-green-600"> {JSON.stringify(change.new_value)}</span>
                                        </div>
                                      ))}
                                      {drift.changes.length > 3 && (
                                        <div className="text-xs text-gray-500">
                                          +{drift.changes.length - 3} more changes
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-2 text-xs text-gray-600">
                                  <strong>Recommendation:</strong> {drift.recommendation}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drift History */}
      {driftHistory.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Drift Detection History</h3>
            <p className="card-description">
              Previous drift detection runs and results
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              {driftHistory.map((drift) => (
                <div
                  key={drift.drift_id}
                  className="flex items-center justify-between p-3 border-2 border-gray-200 rounded hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-niyama-accent-light border-2 border-niyama-black rounded flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-niyama-black" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {drift.provider.toUpperCase()} Drift Detection
                      </div>
                      <div className="text-sm text-gray-600">
                        {drift.total_drifts} drifts • {drift.critical} critical • {drift.high} high
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(drift.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

