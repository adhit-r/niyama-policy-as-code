import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { ViolationFeedback } from '../components/ViolationFeedback';

interface ValidationResult {
  status: 'pass' | 'fail' | 'warning';
  violations: Array<{
    policy_id: number;
    policy_name: string;
    file: string;
    resource_name: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    remediation: string;
    line?: number;
  }>;
  summary: {
    total_files: number;
    total_violations: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scan_id: string;
}

export const ValidationPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['yaml', 'yml'].includes(ext || '')) return 'kubernetes';
    if (['tf', 'tfvars'].includes(ext || '')) return 'terraform';
    if (['json'].includes(ext || '')) return 'cloudformation';
    return 'kubernetes'; // default
  };

  const validateFiles = async () => {
    if (files.length === 0) return;

    setIsValidating(true);
    try {
      const fileData = await Promise.all(
        files.map(async (file) => ({
          path: file.name,
          type: getFileType(file.name),
          content: await file.text()
        }))
      );

      const response = await fetch('/api/v1/validate/iac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: fileData,
          repo_url: 'local-validation',
          commit_sha: 'local'
        })
      });

      const validationResult = await response.json();
      setResult(validationResult);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'fail':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'fail':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display font-semibold text-niyama-black">
          Policy Validation
        </h1>
        <p className="mt-2 text-body text-niyama-gray-600">
          Upload IaC files to validate against your organization's policies
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* File Upload Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upload Files</h3>
            <p className="card-description">
              Drag and drop or select IaC files to validate
            </p>
          </div>
          <div className="card-content">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports Kubernetes YAML, Terraform, and CloudFormation files
              </p>
              <input
                type="file"
                multiple
                accept=".yaml,.yml,.tf,.tfvars,.json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border-2 border-blue-700 rounded hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Selected Files ({files.length})
                </h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 border-2 border-gray-200 rounded"
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-900">{file.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({getFileType(file.name)})
                        </span>
                      </div>
                      <button
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={validateFiles}
                disabled={files.length === 0 || isValidating}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-niyama-accent border-2 border-niyama-black rounded hover:bg-niyama-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validate Files
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Validation Results</h3>
            <p className="card-description">
              Policy violations and suggested fixes
            </p>
          </div>
          <div className="card-content">
            {!result ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Upload files to see validation results</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Summary */}
                <div className={`p-4 border-2 rounded-lg ${getStatusColor(result.status)}`}>
                  <div className="flex items-center">
                    {getStatusIcon(result.status)}
                    <div className="ml-3">
                      <h4 className="font-medium">
                        {result.status === 'pass' && 'All Good!'}
                        {result.status === 'fail' && 'Policy Violations Found'}
                        {result.status === 'warning' && 'Warnings Found'}
                      </h4>
                      <p className="text-sm">
                        {result.summary.total_violations} violations across {result.summary.total_files} files
                      </p>
                    </div>
                  </div>
                </div>

                {/* Violation Summary */}
                {result.summary.total_violations > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {result.summary.critical > 0 && (
                      <div className="p-3 bg-red-50 border-2 border-red-200 rounded">
                        <div className="text-sm font-medium text-red-800">
                          {result.summary.critical} Critical
                        </div>
                      </div>
                    )}
                    {result.summary.high > 0 && (
                      <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded">
                        <div className="text-sm font-medium text-orange-800">
                          {result.summary.high} High
                        </div>
                      </div>
                    )}
                    {result.summary.medium > 0 && (
                      <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded">
                        <div className="text-sm font-medium text-yellow-800">
                          {result.summary.medium} Medium
                        </div>
                      </div>
                    )}
                    {result.summary.low > 0 && (
                      <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded">
                        <div className="text-sm font-medium text-blue-800">
                          {result.summary.low} Low
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Violations */}
                <ViolationFeedback
                  violations={result.violations}
                  onFixApplied={(index) => {
                    console.log('Fix applied for violation:', index);
                  }}
                  onDismiss={(index) => {
                    console.log('Dismissed violation:', index);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

