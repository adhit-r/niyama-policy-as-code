import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  Target,
  Download,
  RefreshCw
} from 'lucide-react';
import { useQuery } from 'react-query';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import ErrorBoundary from '../components/ui/ErrorBoundary';

interface AnalyticsData {
  policyEvaluations: {
    date: string;
    total: number;
    passed: number;
    failed: number;
  }[];
  complianceTrends: {
    framework: string;
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  topViolations: {
    policy: string;
    violations: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }[];
  performanceMetrics: {
    averageEvaluationTime: number;
    totalEvaluations: number;
    successRate: number;
    errorRate: number;
  };
}

const fetchAnalyticsData = async (timeRange: string, selectedFramework: string): Promise<AnalyticsData> => {
  const response = await fetch(
    `http://localhost:8000/api/v1/monitoring/metrics?timeRange=${timeRange}&framework=${selectedFramework}`,
    {
      headers: {
        'Content-Type': 'application/json',
        // Add auth header if needed: 'Authorization': `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');

  const { data, isLoading, error, refetch } = useQuery(
    ['analytics', timeRange, selectedFramework],
    () => fetchAnalyticsData(timeRange, selectedFramework),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchInterval: 300000, // 5 minutes
      onError: (err) => {
        console.error('Analytics fetch error:', err);
      },
    }
  );

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = async () => {
    if (!data) return;
    
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `niyama-analytics-${timeRange}-${selectedFramework}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      // Show toast notification
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-niyama-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-niyama-gray-100 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="w-16 h-16 text-niyama-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-niyama-black mb-2">Error Loading Analytics</h2>
          <p className="text-niyama-gray-600 mb-6">Failed to fetch data from backend. Please check if the server is running.</p>
          <button onClick={handleRefresh} className="btn-accent px-6 py-2">
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
                  <div className="w-16 h-16 bg-niyama-accent flex items-center justify-center shadow-brutal rounded">
                    <BarChart3 className="w-8 h-8 text-niyama-black" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-niyama-black">Policy Analytics Dashboard</h1>
                    <p className="text-niyama-gray-600 mt-1">Real-time insights into policy performance and compliance metrics</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2">
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                    className="border-2 border-niyama-black bg-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-niyama-accent"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                  <select 
                    value={selectedFramework}
                    onChange={(e) => setSelectedFramework(e.target.value)}
                    className="border-2 border-niyama-black bg-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-niyama-accent"
                  >
                    <option value="all">All Frameworks</option>
                    <option value="soc2">SOC 2</option>
                    <option value="iso27001">ISO 27001</option>
                    <option value="gdpr">GDPR</option>
                    <option value="hipaa">HIPAA</option>
                  </select>
                </div>
                <button onClick={handleRefresh} className="btn-secondary px-6 py-2 flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
                <button onClick={handleExport} className="btn-accent px-6 py-2 flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Performance Metrics Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Success Rate Card */}
              <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6 rounded">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal rounded">
                    <Target className="w-4 h-4 text-niyama-black" />
                  </div>
                  <h3 className="text-lg font-bold text-niyama-black">Key Metrics</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-niyama-gray-600">Overall Success Rate</span>
                    <span className="text-2xl font-bold text-niyama-accent">{data?.performanceMetrics.successRate?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-niyama-gray-600">Avg Evaluation Time</span>
                    <span className="text-lg font-bold text-niyama-black">{data?.performanceMetrics.averageEvaluationTime?.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-niyama-gray-600">Total Evaluations</span>
                    <span className="text-lg font-bold text-niyama-black">{data?.performanceMetrics.totalEvaluations?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-niyama-gray-600">Error Rate</span>
                    <span className="text-lg font-bold text-niyama-error">{data?.performanceMetrics.errorRate?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Top Violations Card */}
              <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal rounded">
                <div className="bg-niyama-black border-b-2 border-niyama-black p-4 rounded-t">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal rounded">
                      <AlertTriangle className="w-4 h-4 text-niyama-black" />
                    </div>
                    <h3 className="text-lg font-bold text-niyama-white">Active Violations</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {data?.topViolations.slice(0, 5).map((violation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-2 border-niyama-black bg-niyama-gray-100 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-niyama-black truncate max-w-[150px]" title={violation.policy}>
                          {violation.policy}
                        </p>
                        <p className="text-xs text-niyama-gray-600">{violation.violations} occurrences</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        violation.severity === 'critical' ? 'bg-niyama-error text-white' :
                        violation.severity === 'high' ? 'bg-niyama-error/10 text-niyama-error' :
                        violation.severity === 'medium' ? 'bg-niyama-warning/10 text-niyama-warning' :
                        'bg-niyama-accent/10 text-niyama-accent'
                      }`}>
                        {violation.severity}
                      </span>
                    </div>
                  ))}
                  {data?.topViolations.length === 0 && (
                    <p className="text-center text-niyama-gray-500 py-4">No violations detected</p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Charts Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* Policy Evaluations Trend Chart */}
              <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal rounded">
                <div className="bg-niyama-black border-b-2 border-niyama-black p-4 rounded-t">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal rounded">
                      <Activity className="w-4 h-4 text-niyama-black" />
                    </div>
                    <h3 className="text-lg font-bold text-niyama-white">Policy Evaluation Trends</h3>
                  </div>
                </div>
                <div className="p-6">
                  {!data?.policyEvaluations || data.policyEvaluations.length === 0 ? (
                    <div className="text-center py-12">
                      <BarChart3 className="w-12 h-12 text-niyama-gray-400 mx-auto mb-4" />
                      <p className="text-niyama-gray-500">No evaluation data available for the selected period</p>
                    </div>
                  ) : (
                    <>
                      <div className="h-80 flex items-end space-x-1 bg-niyama-gray-50 p-4 rounded border-2 border-niyama-black">
                        {data.policyEvaluations.map((day, index) => {
                          const maxTotal = Math.max(...data.policyEvaluations.map(d => d.total));
                          const barWidth = 100 / data.policyEvaluations.length;
                          const passedHeight = (day.passed / maxTotal) * 100;
                          const failedHeight = (day.failed / maxTotal) * 100;

                          return (
                            <div key={index} className="flex flex-col items-center space-y-1" style={{ width: `${barWidth}%` }}>
                              <div className="w-full flex flex-col space-y-0.5">
                                <div 
                                  className="bg-niyama-accent border border-niyama-accent/50 rounded-t-sm flex-1"
                                  style={{ height: `${Math.max(passedHeight, 10)}%` }}
                                  title={`${day.passed} passed`}
                                />
                                <div 
                                  className="bg-niyama-error border border-niyama-error/50 rounded-b-sm"
                                  style={{ height: `${Math.max(failedHeight, 5)}%` }}
                                  title={`${day.failed} failed`}
                                />
                              </div>
                              <span className="text-xs text-niyama-gray-600 whitespace-nowrap">
                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-xs text-niyama-gray-600">{day.total}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-center space-x-8 mt-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-2 bg-niyama-accent border border-niyama-accent/50"></div>
                          <span className="text-niyama-gray-600">Passed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-2 bg-niyama-error border border-niyama-error/50"></div>
                          <span className="text-niyama-gray-600">Failed</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Compliance Framework Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.complianceTrends && data.complianceTrends.length > 0 ? (
                  data.complianceTrends.map((trend, index) => (
                    <div key={index} className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6 rounded">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-niyama-black">{trend.framework}</h4>
                        <div className={`flex items-center space-x-1 p-1 rounded ${
                          trend.trend === 'up' ? 'bg-niyama-accent/10 text-niyama-accent' :
                          trend.trend === 'down' ? 'bg-niyama-error/10 text-niyama-error' :
                          'bg-niyama-gray-100 text-niyama-gray-600'
                        }`}>
                          {trend.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : trend.trend === 'down' ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <Activity className="w-4 h-4" />
                          )}
                          <span className="text-sm font-semibold">
                            {(trend.trend === 'up' ? '+' : trend.trend === 'down' ? '-' : '') + Math.abs(trend.current - trend.previous)}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-niyama-gray-700">Current Score</span>
                          <span className="text-3xl font-bold text-niyama-black">{trend.current}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-niyama-gray-600">
                          <span>Previous: {trend.previous}%</span>
                          <span>Change: {(trend.trend === 'up' ? '+' : trend.trend === 'down' ? '-' : '') + Math.abs(trend.current - trend.previous)}%</span>
                        </div>
                        <div className="w-full bg-niyama-gray-200 border-2 border-niyama-black rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full border-2 border-niyama-accent transition-all duration-300 ${
                              trend.current >= 90 ? 'bg-niyama-accent' :
                              trend.current >= 70 ? 'bg-niyama-warning' : 'bg-niyama-error'
                            }`}
                            style={{ width: `${trend.current}%` }}
                          />
                        </div>
                        <div className="text-xs text-niyama-gray-500">
                          {trend.current >= 90 ? 'Excellent compliance' : trend.current >= 70 ? 'Good compliance' : 'Needs attention'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 bg-niyama-white border-2 border-niyama-black shadow-brutal p-12 rounded text-center">
                    <TrendingUp className="w-12 h-12 text-niyama-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-niyama-gray-600 mb-2">No Compliance Data</h3>
                    <p className="text-niyama-gray-500">Configure compliance frameworks in settings to see trends</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
