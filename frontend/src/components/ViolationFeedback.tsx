import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, ExternalLink, Copy, ChevronDown, ChevronRight } from 'lucide-react';

interface PolicyViolation {
  policy_id: number;
  policy_name: string;
  file: string;
  resource_name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  remediation: string;
  line?: number;
}

interface ViolationFeedbackProps {
  violations: PolicyViolation[];
  onFixApplied?: (violationId: number) => void;
  onDismiss?: (violationId: number) => void;
}

export const ViolationFeedback: React.FC<ViolationFeedbackProps> = ({
  violations,
  onFixApplied,
  onDismiss
}) => {
  const [expandedViolations, setExpandedViolations] = useState<Set<number>>(new Set());
  const [copiedMessages, setCopiedMessages] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedViolations(newExpanded);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessages(prev => new Set([...prev, index]));
      setTimeout(() => {
        setCopiedMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
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

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (violations.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-green-50 border-2 border-green-200 rounded-lg">
        <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-green-800">All Good!</h3>
          <p className="text-green-600">No policy violations found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Policy Violations ({violations.length})
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setExpandedViolations(new Set(violations.map((_, i) => i)))}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedViolations(new Set())}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Collapse All
          </button>
        </div>
      </div>

      {violations.map((violation, index) => (
        <div
          key={index}
          className={`border-2 rounded-lg p-4 ${getSeverityColor(violation.severity)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getSeverityIcon(violation.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityBadgeColor(violation.severity)}`}>
                    {violation.severity.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {violation.policy_name}
                  </span>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-1">
                  {violation.resource_name} in {violation.file}
                  {violation.line && (
                    <span className="text-sm text-gray-500 ml-2">(line {violation.line})</span>
                  )}
                </h4>
                
                <p className="text-sm text-gray-700 mb-3">
                  {violation.message}
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    {expandedViolations.has(index) ? (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-1" />
                    )}
                    {expandedViolations.has(index) ? 'Hide' : 'Show'} Details
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(violation.message, index)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {copiedMessages.has(index) ? 'Copied!' : 'Copy Message'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {expandedViolations.has(index) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Suggested Fix:</h5>
                  <div className="bg-gray-50 border-2 border-gray-200 rounded p-3">
                    <p className="text-sm text-gray-700">{violation.remediation}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onFixApplied?.(index)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 border-2 border-green-700 rounded hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Fixed
                  </button>
                  
                  <button
                    onClick={() => onDismiss?.(index)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border-2 border-gray-300 rounded hover:bg-gray-200 transition-colors"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Dismiss
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(violation.remediation, index)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border-2 border-gray-300 rounded hover:bg-gray-200 transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Fix
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

