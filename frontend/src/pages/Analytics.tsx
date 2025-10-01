import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Zap,
  Target,
  Award,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

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

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, selectedFramework]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - in real app, this would come from API
      const mockData: AnalyticsData = {
        policyEvaluations: [
          { date: '2024-01-01', total: 150, passed: 120, failed: 30 },
          { date: '2024-01-02', total: 180, passed: 160, failed: 20 },
          { date: '2024-01-03', total: 200, passed: 170, failed: 30 },
          { date: '2024-01-04', total: 220, passed: 190, failed: 30 },
          { date: '2024-01-05', total: 190, passed: 165, failed: 25 },
          { date: '2024-01-06', total: 210, passed: 180, failed: 30 },
          { date: '2024-01-07', total: 240, passed: 200, failed: 40 },
        ],
        complianceTrends: [
          { framework: 'SOC 2', current: 92, previous: 88, trend: 'up' },
          { framework: 'ISO 27001', current: 87, previous: 90, trend: 'down' },
          { framework: 'GDPR', current: 95, previous: 93, trend: 'up' },
          { framework: 'HIPAA', current: 89, previous: 89, trend: 'stable' },
        ],
        topViolations: [
          { policy: 'Kubernetes Security Policy', violations: 45, severity: 'critical' },
          { policy: 'Data Encryption Policy', violations: 32, severity: 'high' },
          { policy: 'Access Control Policy', violations: 28, severity: 'medium' },
          { policy: 'Network Security Policy', violations: 15, severity: 'low' },
        ],
        performanceMetrics: {
          averageEvaluationTime: 1.2,
          totalEvaluations: 1250,
          successRate: 85.5,
          errorRate: 2.3,
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = () => {
    // Export analytics data
    const csvData = data ? JSON.stringify(data, null, 2) : '';
    const blob = new Blob([csvData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-niyama-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-niyama-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-niyama-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-niyama-black mb-2">Error Loading Analytics</h2>
          <p className="text-niyama-gray-600 mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-accent">
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
                  <div className="w-16 h-16 bg-niyama-accent flex items-center justify-center shadow-brutal">
                    <BarChart3 className="w-8 h-8 text-niyama-black" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-niyama-black text-display">
                      Policy Analytics
                    </h1>
                    <p className="text-body text-niyama-gray-600 mt-1">
                      Deep insights into policy performance and compliance trends
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2">
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                    className="input"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                  <select 
                    value={selectedFramework}
                    onChange={(e) => setSelectedFramework(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Frameworks</option>
                    <option value="soc2">SOC 2</option>
                    <option value="iso27001">ISO 27001</option>
                    <option value="gdpr">GDPR</option>
                    <option value="hipaa">HIPAA</option>
                  </select>
                </div>
                <button onClick={handleRefresh} className="btn-secondary btn-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh
                </button>
                <button onClick={handleExport} className="btn-accent btn-lg flex items-center justify-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Performance Metrics */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                    <Target className="w-4 h-4 text-niyama-black" />
                  </div>
                  <h3 className="text-lg font-bold text-niyama-black">Performance</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-niyama-gray-600">Success Rate</span>
                    <span className="text-lg font-bold text-niyama-black">{data?.performanceMetrics.successRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-niyama-gray-600">Avg. Time</span>
                    <span className="text-lg font-bold text-niyama-black">{data?.performanceMetrics.averageEvaluationTime}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-niyama-gray-600">Total Evaluations</span>
                    <span className="text-lg font-bold text-niyama-black">{data?.performanceMetrics.totalEvaluations.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-niyama-gray-600">Error Rate</span>
                    <span className="text-lg font-bold text-niyama-error">{data?.performanceMetrics.errorRate}%</span>
                  </div>
                </div>
              </div>

              {/* Top Violations */}
              <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal">
                <div className="bg-niyama-black border-b-2 border-niyama-black p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <AlertTriangle className="w-4 h-4 text-niyama-black" />
                    </div>
                    <h3 className="text-lg font-bold text-niyama-white">Top Violations</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {data?.topViolations.map((violation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-2 border-niyama-black bg-niyama-gray-100">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-niyama-black truncate">{violation.policy}</p>
                        <p className="text-xs text-niyama-gray-600">{violation.violations} violations</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ml-2 ${
                        violation.severity === 'critical' ? 'bg-niyama-error' :
                        violation.severity === 'high' ? 'bg-niyama-error' :
                        violation.severity === 'medium' ? 'bg-niyama-warning' :
                        'bg-niyama-accent'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts and Trends */}
            <div className="lg:col-span-3 space-y-8">
              {/* Policy Evaluations Chart */}
              <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal">
                <div className="bg-niyama-black border-b-2 border-niyama-black p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                      <Activity className="w-4 h-4 text-niyama-black" />
                    </div>
                    <h3 className="text-lg font-bold text-niyama-white">Policy Evaluations Over Time</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-64 flex items-end space-x-2">
                    {data?.policyEvaluations.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                        <div className="w-full flex flex-col space-y-1">
                          <div 
                            className="bg-niyama-accent border-2 border-niyama-black"
                            style={{ height: `${(day.passed / Math.max(...data.policyEvaluations.map(d => d.total))) * 200}px` }}
                          />
                          <div 
                            className="bg-niyama-error border-2 border-niyama-black"
                            style={{ height: `${(day.failed / Math.max(...data.policyEvaluations.map(d => d.total))) * 200}px` }}
                          />
                        </div>
                        <span className="text-xs text-niyama-gray-600">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-niyama-accent border-2 border-niyama-black"></div>
                      <span className="text-sm text-niyama-gray-600">Passed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-niyama-error border-2 border-niyama-black"></div>
                      <span className="text-sm text-niyama-gray-600">Failed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.complianceTrends.map((trend, index) => (
                  <div key={index} className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-niyama-black">{trend.framework}</h4>
                      <div className={`flex items-center space-x-1 ${
                        trend.trend === 'up' ? 'text-niyama-accent' :
                        trend.trend === 'down' ? 'text-niyama-error' :
                        'text-niyama-gray-600'
                      }`}>
                        {trend.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : trend.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                        <span className="text-sm font-bold">
                          {trend.trend === 'up' ? '+' : trend.trend === 'down' ? '-' : ''}
                          {Math.abs(trend.current - trend.previous)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-niyama-gray-600">Current</span>
                        <span className="text-2xl font-bold text-niyama-black">{trend.current}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-niyama-gray-600">Previous</span>
                        <span className="text-lg text-niyama-gray-600">{trend.previous}%</span>
                      </div>
                      <div className="w-full bg-niyama-gray-200 border-2 border-niyama-black h-2">
                        <div 
                          className="bg-niyama-accent h-full border-2 border-niyama-black"
                          style={{ width: `${trend.current}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};


