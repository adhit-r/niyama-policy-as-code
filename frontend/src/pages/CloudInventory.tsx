import React, { useState, useEffect } from 'react';
import { Cloud, Server, Database, Shield, Loader2, RefreshCw, Filter, Download } from 'lucide-react';

interface CloudResource {
  id: string;
  type: string;
  name: string;
  region: string;
  provider: string;
  status: string;
  tags: Record<string, string>;
  properties: Record<string, any>;
  created_at: string;
  last_modified: string;
}

interface ScanResult {
  scan_id: string;
  provider: string;
  resources: CloudResource[];
  summary: {
    total_resources: number;
    resource_types: Record<string, number>;
    regions: Record<string, number>;
    status_counts: Record<string, number>;
    tag_counts: Record<string, number>;
  };
  started_at: string;
  completed_at: string;
  duration_ms: number;
}

export const CloudInventory: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('aws');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    region: '',
    type: '',
    status: '',
    tag: ''
  });

  const providers = [
    { id: 'aws', name: 'Amazon Web Services', icon: '☁️', color: 'bg-orange-100 text-orange-800' },
    { id: 'azure', name: 'Microsoft Azure', icon: '🔷', color: 'bg-blue-100 text-blue-800' },
    { id: 'gcp', name: 'Google Cloud Platform', icon: '🔵', color: 'bg-green-100 text-green-800' },
    { id: 'kubernetes', name: 'Kubernetes', icon: '⚙️', color: 'bg-purple-100 text-purple-800' }
  ];

  const resourceTypes = [
    { type: 'ec2-instance', name: 'EC2 Instance', icon: Server },
    { type: 'rds-instance', name: 'RDS Database', icon: Database },
    { type: 'security-group', name: 'Security Group', icon: Shield },
    { type: 's3-bucket', name: 'S3 Bucket', icon: Cloud },
    { type: 'pod', name: 'Pod', icon: Server },
    { type: 'deployment', name: 'Deployment', icon: Server },
  ];

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      const response = await fetch('/api/v1/scanner/scans');
      const data = await response.json();
      setScanHistory(data.scans || []);
    } catch (error) {
      console.error('Failed to load scan history:', error);
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/v1/scanner/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          regions: filters.region ? [filters.region] : [],
          filters: {
            type: filters.type || undefined,
            status: filters.status || undefined,
          },
          tags: filters.tag ? { [filters.tag.split('=')[0]]: filters.tag.split('=')[1] } : {}
        })
      });

      const result = await response.json();
      setScanResult(result);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getResourceIcon = (type: string) => {
    const resourceType = resourceTypes.find(rt => rt.type === type);
    if (resourceType) {
      const Icon = resourceType.icon;
      return <Icon className="h-5 w-5" />;
    }
    return <Server className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'stopped':
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
      case 'starting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredResources = scanResult?.resources.filter(resource => {
    if (filters.region && resource.region !== filters.region) return false;
    if (filters.type && resource.type !== filters.type) return false;
    if (filters.status && resource.status !== filters.status) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display font-semibold text-niyama-black">
          Cloud Inventory
        </h1>
        <p className="mt-2 text-body text-niyama-gray-600">
          Discover and manage your cloud resources across multiple providers
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Provider Selection & Scan Controls */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Scan Configuration</h3>
            <p className="card-description">
              Select provider and configure scan parameters
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
                  Resource Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-niyama-black focus:outline-none"
                >
                  <option value="">All Types</option>
                  {resourceTypes.map((rt) => (
                    <option key={rt.type} value={rt.type}>{rt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-niyama-black focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="running">Running</option>
                  <option value="stopped">Stopped</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Scan Button */}
            <button
              onClick={startScan}
              disabled={isScanning}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-niyama-accent border-2 border-niyama-black rounded hover:bg-niyama-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Scan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scan Results */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Scan Results</h3>
              <p className="card-description">
                Discovered resources and their properties
              </p>
            </div>
            <div className="card-content">
              {!scanResult ? (
                <div className="text-center py-8">
                  <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Start a scan to discover resources</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded">
                      <div className="text-2xl font-bold text-blue-800">
                        {scanResult.summary.total_resources}
                      </div>
                      <div className="text-sm text-blue-600">Total Resources</div>
                    </div>
                    <div className="p-3 bg-green-50 border-2 border-green-200 rounded">
                      <div className="text-2xl font-bold text-green-800">
                        {Object.keys(scanResult.summary.resource_types).length}
                      </div>
                      <div className="text-sm text-green-600">Resource Types</div>
                    </div>
                    <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded">
                      <div className="text-2xl font-bold text-purple-800">
                        {Object.keys(scanResult.summary.regions).length}
                      </div>
                      <div className="text-sm text-purple-600">Regions</div>
                    </div>
                    <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded">
                      <div className="text-2xl font-bold text-orange-800">
                        {scanResult.duration_ms}ms
                      </div>
                      <div className="text-sm text-orange-600">Scan Duration</div>
                    </div>
                  </div>

                  {/* Resource List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        Resources ({filteredResources.length})
                      </h4>
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        <Download className="h-4 w-4 inline mr-1" />
                        Export CSV
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredResources.map((resource) => (
                        <div
                          key={resource.id}
                          className="p-3 border-2 border-gray-200 rounded hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getResourceIcon(resource.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="font-medium text-gray-900 truncate">
                                    {resource.name}
                                  </h5>
                                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(resource.status)}`}>
                                    {resource.status}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {resource.type} • {resource.region} • {resource.provider}
                                </div>
                                {Object.keys(resource.tags).length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {Object.entries(resource.tags).slice(0, 3).map(([key, value]) => (
                                      <span
                                        key={key}
                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border"
                                      >
                                        {key}={value}
                                      </span>
                                    ))}
                                    {Object.keys(resource.tags).length > 3 && (
                                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border">
                                        +{Object.keys(resource.tags).length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
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

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Scans</h3>
            <p className="card-description">
              History of cloud resource scans
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              {scanHistory.map((scan) => (
                <div
                  key={scan.scan_id}
                  className="flex items-center justify-between p-3 border-2 border-gray-200 rounded hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-niyama-accent-light border-2 border-niyama-black rounded flex items-center justify-center">
                      <Cloud className="h-4 w-4 text-niyama-black" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {scan.provider.toUpperCase()} Scan
                      </div>
                      <div className="text-sm text-gray-600">
                        {scan.resources} resources • {scan.duration_ms}ms
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(scan.created_at).toLocaleDateString()}
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

