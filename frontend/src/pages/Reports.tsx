import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from '../hooks/useTranslation';
import { Download, Filter, Search, Calendar, FileText, ArrowLeft, Settings } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface Report {
  id: string;
  name: string;
  framework: string;
  status: string;
  generatedAt: string;
  createdBy: string;
  score: number;
}

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  const frameworks = ['all', 'SOC2', 'HIPAA', 'GDPR', 'PCI-DSS', 'ISO27001'];

  const { data: reports, isLoading, error, refetch } = useQuery('reports', () => {
    const params = new URLSearchParams({
      framework: selectedFramework !== 'all' ? selectedFramework : '',
      dateRange,
      search: searchTerm,
    });
    return fetch(`/api/v1/compliance/reports?${params}`).then(res => res.json());
  }, {
    refetchOnWindowFocus: false,
  });

  const handleExportReport = (reportId: string) => {
    // Implement export logic (PDF/CSV via backend or client-side)
    window.open(`/api/v1/compliance/reports/${reportId}/export.pdf`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredReports = reports?.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedFramework === 'all' || report.framework === selectedFramework)
  ) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Reports</h1>
          <p className="text-body-lg text-gray-medium">Generated compliance reports and audits</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-white border-2 border-charcoal text-charcoal shadow-brutal hover:shadow-brutal-lg transition-all duration-200"
          >
            Refresh
          </button>
          <button 
            className="px-4 py-2 bg-accent text-white border-2 border-accent shadow-brutal hover:shadow-brutal-lg transition-all duration-200"
            onClick={() => {/* Create new report logic */}}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-charcoal shadow-brutal p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-1">Search Reports</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-medium" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-charcoal rounded focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-1">Framework</label>
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="w-full p-2 border-2 border-charcoal rounded focus:ring-2 focus:ring-accent"
            >
              {frameworks.map(framework => (
                <option key={framework} value={framework}>
                  {framework}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 border-2 border-charcoal rounded focus:ring-2 focus:ring-accent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border-2 border-charcoal shadow-brutal">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-medium mx-auto mb-4" />
            <h3 className="text-xl font-bold text-charcoal mb-2">No Reports Found</h3>
            <p className="text-gray-medium mb-4">Generate your first compliance report</p>
            <button className="bg-accent text-white px-6 py-2 border-2 border-accent shadow-brutal hover:shadow-brutal-lg transition-all duration-200">
              Generate Report
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-medium">
                <tr>
                  <th className="text-left p-4 font-bold text-white border-b-2 border-charcoal">Report Name</th>
                  <th className="text-left p-4 font-bold text-white border-b-2 border-charcoal">Framework</th>
                  <th className="text-left p-4 font-bold text-white border-b-2 border-charcoal">Score</th>
                  <th className="text-left p-4 font-bold text-white border-b-2 border-charcoal">Generated</th>
                  <th className="text-left p-4 font-bold text-white border-b-2 border-charcoal">Created By</th>
                  <th className="text-left p-4 font-bold text-white border-b-2 border-charcoal">Status</th>
                  <th className="text-left p-4 font-bold text-white border-b-2 border-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b-2 border-charcoal hover:bg-accent-light transition-colors duration-200">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-charcoal">{report.name}</p>
                        <p className="text-gray-medium text-sm">{report.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-accent text-white px-2 py-1 text-xs font-bold rounded">
                        {report.framework}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: `${report.score}%` }} />
                      </div>
                      <span className="text-sm text-charcoal">{report.score}%</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-medium">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-charcoal">{report.createdBy}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        report.status === 'completed' ? 'bg-success text-white' :
                        report.status === 'draft' ? 'bg-warning text-black' :
                        'bg-error text-white'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleExportReport(report.id)}
                          className="px-3 py-1 bg-white border-2 border-charcoal text-charcoal text-xs font-bold hover:bg-accent text-white transition-all duration-200 shadow-brutal rounded"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </button>
                        <button className="px-3 py-1 bg-white border-2 border-charcoal text-charcoal text-xs font-bold hover:bg-accent text-white transition-all duration-200 shadow-brutal rounded">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
