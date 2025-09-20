import React, { useState } from 'react';
import { 
  Brain, 
  FileText, 
  CheckCircle, 
  Zap, 
  Shield,
  Code,
  Lightbulb
} from 'lucide-react';

interface BitNetAIProps {
  onPolicyGenerated?: (policy: string) => void;
  onPolicyAnalyzed?: (analysis: any) => void;
}

interface PolicyGenerationRequest {
  description: string;
  framework: string;
  language: string;
}

interface PolicyAnalysisRequest {
  policy: string;
  analysisType: string;
}

interface PolicyAnalysisResponse {
  analysis: string;
  suggestions?: string[];
  compliance?: string[];
  issues?: string[];
}

const BitNetAI: React.FC<BitNetAIProps> = ({ onPolicyGenerated, onPolicyAnalyzed }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'analyze'>('generate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [analysis, setAnalysis] = useState<PolicyAnalysisResponse | null>(null);

  // Policy Generation State
  const [generationRequest, setGenerationRequest] = useState<PolicyGenerationRequest>({
    description: '',
    framework: 'general security',
    language: 'Rego'
  });

  // Policy Analysis State
  const [analysisRequest, setAnalysisRequest] = useState<PolicyAnalysisRequest>({
    policy: '',
    analysisType: 'explain'
  });

  const frameworks = [
    'general security',
    'SOC 2',
    'HIPAA',
    'GDPR',
    'ISO 27001',
    'ISO 42001',
    'PCI DSS',
    'NIST',
    'CIS',
    'COBIT',
    'ITIL'
  ];

  const languages = [
    'Rego',
    'YAML',
    'JSON',
    'OPA',
    'Gatekeeper',
    'Kyverno'
  ];

  const analysisTypes = [
    { value: 'explain', label: 'Explain Policy', icon: Lightbulb },
    { value: 'validate', label: 'Validate Policy', icon: CheckCircle },
    { value: 'optimize', label: 'Optimize Policy', icon: Zap },
    { value: 'compliance', label: 'Check Compliance', icon: Shield }
  ];

  const generatePolicy = async () => {
    if (!generationRequest.description.trim()) {
      alert('Please enter a policy description');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/bitnet/generate-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(generationRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to generate policy');
      }

      const data = await response.json();
      setResult(data.policy);
      onPolicyGenerated?.(data.policy);
    } catch (error) {
      console.error('Error generating policy:', error);
      alert('Failed to generate policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzePolicy = async () => {
    if (!analysisRequest.policy.trim()) {
      alert('Please enter a policy to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/bitnet/analyze-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(analysisRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to analyze policy');
      }

      const data = await response.json();
      setAnalysis(data);
      onPolicyAnalyzed?.(data);
    } catch (error) {
      console.error('Error analyzing policy:', error);
      alert('Failed to analyze policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">BitNet AI Assistant</h2>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          1.58-bit LLM
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'generate'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Code className="h-4 w-4 inline mr-2" />
          Generate Policy
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analyze'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Analyze Policy
        </button>
      </div>

      {/* Policy Generation Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy Description
            </label>
            <textarea
              value={generationRequest.description}
              onChange={(e) => setGenerationRequest({
                ...generationRequest,
                description: e.target.value
              })}
              placeholder="Describe the policy you want to generate. For example: 'Ensure all containers run as non-root user'"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Framework
              </label>
              <select
                value={generationRequest.framework}
                onChange={(e) => setGenerationRequest({
                  ...generationRequest,
                  framework: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {frameworks.map(framework => (
                  <option key={framework} value={framework}>
                    {framework}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={generationRequest.language}
                onChange={(e) => setGenerationRequest({
                  ...generationRequest,
                  language: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map(language => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generatePolicy}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Policy'}
          </button>
        </div>
      )}

      {/* Policy Analysis Tab */}
      {activeTab === 'analyze' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy to Analyze
            </label>
            <textarea
              value={analysisRequest.policy}
              onChange={(e) => setAnalysisRequest({
                ...analysisRequest,
                policy: e.target.value
              })}
              placeholder="Paste your policy code here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {analysisTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setAnalysisRequest({
                      ...analysisRequest,
                      analysisType: type.value
                    })}
                    className={`p-3 border rounded-md text-left transition-colors ${
                      analysisRequest.analysisType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-4 w-4 inline mr-2" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={analyzePolicy}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Policy'}
          </button>
        </div>
      )}

      {/* Results */}
      {(result || analysis) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'generate' ? 'Generated Policy' : 'Analysis Results'}
            </h3>
            <button
              onClick={() => copyToClipboard(result || analysis?.analysis || '')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Copy
            </button>
          </div>

          {activeTab === 'generate' && result && (
            <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
              <code>{result}</code>
            </pre>
          )}

          {activeTab === 'analyze' && analysis && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Analysis</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{analysis.analysis}</p>
              </div>

              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Suggestions</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-gray-700">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.issues && analysis.issues.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-900 mb-2">Issues Found</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.issues.map((issue, index) => (
                      <li key={index} className="text-red-700">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.compliance && analysis.compliance.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-900 mb-2">Compliance Notes</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.compliance.map((note, index) => (
                      <li key={index} className="text-green-700">{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BitNetAI;
