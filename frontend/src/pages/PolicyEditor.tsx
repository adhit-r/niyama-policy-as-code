import React, { useState, useEffect } from 'react';
import { Save, Play, CheckCircle, AlertCircle, Code, FileText, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface PolicyDetails {
  name: string;
  description: string;
  category: string;
  severity: string;
  language: string;
  tags: string[];
  accessLevel: string;
}

interface TestResult {
  decision: string;
  reason: string;
  details?: any;
}

export const PolicyEditor: React.FC = () => {
  const [policyCode, setPolicyCode] = useState('');
  const [policyDetails, setPolicyDetails] = useState<PolicyDetails>({
    name: '',
    description: '',
    category: 'Security',
    severity: 'Medium',
    language: 'rego',
    tags: [],
    accessLevel: 'private'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testInput, setTestInput] = useState('{\n  "action": "read",\n  "resource": "document",\n  "user": "testuser"\n}');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if we have template data from navigation
    if (location.state?.initialContent) {
      setPolicyCode(location.state.initialContent);
    }
  }, [location.state]);

  const handleSavePolicy = async () => {
    if (!policyDetails.name.trim()) {
      alert('Please enter a policy name');
      return;
    }

    if (!policyCode.trim()) {
      alert('Please enter policy code');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/policies/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: policyDetails.name,
          description: policyDetails.description,
          content: policyCode,
          language: policyDetails.language,
          category: policyDetails.category,
          tags: policyDetails.tags,
          status: 'draft',
          access_level: policyDetails.accessLevel,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSaveMessage('Policy saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to save policy');
      }
    } catch (error) {
      console.error('Error saving policy:', error);
      setSaveMessage(`Error: ${error instanceof Error ? error.message : 'Failed to save policy'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPolicy = async () => {
    if (!policyCode.trim()) {
      alert('Please enter policy code to test');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      let parsedTestInput;
      try {
        parsedTestInput = JSON.parse(testInput);
      } catch (e) {
        throw new Error('Invalid JSON in test input');
      }

      const response = await fetch('http://localhost:8000/api/v1/policies/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policy_id: 1, // Mock policy ID for testing
          test_input: parsedTestInput,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult({
          decision: result.evaluation.decision,
          reason: result.evaluation.output,
          details: result.evaluation
        });
      } else {
        throw new Error(result.error || 'Failed to test policy');
      }
    } catch (error) {
      console.error('Error testing policy:', error);
      setTestResult({
        decision: 'error',
        reason: error instanceof Error ? error.message : 'Failed to test policy'
      });
    } finally {
      setIsTesting(false);
    }
  };


  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-niyama-black flex items-center justify-center shadow-brutal">
              <Code className="w-6 h-6 text-niyama-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-niyama-black">
                Policy Editor
              </h1>
              <p className="text-body text-niyama-gray-600 mt-1">
                Create and edit Policy as Code rules with brutalist precision
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
                 <button 
                   className="btn-secondary btn-lg flex items-center justify-center"
                   onClick={handleTestPolicy}
                   disabled={isTesting}
                 >
                   <Play className="w-5 h-5 mr-2" />
                   {isTesting ? 'Testing...' : 'Test Policy'}
                 </button>
                 <button 
                   className="btn-accent btn-lg flex items-center justify-center"
                   onClick={handleSavePolicy}
                   disabled={isSaving}
                 >
                   <Save className="w-5 h-5 mr-2" />
                   {isSaving ? 'Saving...' : 'Save Policy'}
                 </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Policy Code Editor */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                  <FileText className="w-4 h-4 text-niyama-white" />
                </div>
                <div>
                  <h3 className="card-title">Policy Code</h3>
                  <p className="card-description">
                    Write your policy in Rego, YAML, or JSON with brutalist precision
                  </p>
                </div>
              </div>
            </div>
            <div className="card-content p-0">
              <div className="policy-editor">
                <textarea
                  value={policyCode}
                  onChange={(e) => setPolicyCode(e.target.value)}
                  placeholder="// Enter your policy code here...\npackage kubernetes.security\n\ndefault allow = false\n\nallow {\n    input.kind == 'Pod'\n    input.spec.securityContext.runAsNonRoot == true\n}"
                  className="w-full h-96 bg-niyama-gray-900 text-niyama-white p-6 font-mono text-sm border-0 resize-none focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Policy Details Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-niyama-black flex items-center justify-center shadow-brutal">
                  <Zap className="w-4 h-4 text-niyama-white" />
                </div>
                <h3 className="card-title">Policy Details</h3>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-6">
                <div>
                  <label className="form-label">Policy Name</label>
                  <input 
                    className="input" 
                    placeholder="Enter policy name"
                    value={policyDetails.name}
                    onChange={(e) => setPolicyDetails({...policyDetails, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea 
                    className="input" 
                    rows={3}
                    placeholder="Describe what this policy does"
                    value={policyDetails.description}
                    onChange={(e) => setPolicyDetails({...policyDetails, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select 
                    className="input"
                    value={policyDetails.category}
                    onChange={(e) => setPolicyDetails({...policyDetails, category: e.target.value})}
                  >
                    <option>Security</option>
                    <option>Compliance</option>
                    <option>Resource Management</option>
                    <option>Network</option>
                    <option>RBAC</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Access Level</label>
                  <select 
                    className="input"
                    value={policyDetails.accessLevel}
                    onChange={(e) => setPolicyDetails({...policyDetails, accessLevel: e.target.value})}
                  >
                    <option value="private">Private</option>
                    <option value="org">Organization</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Input and Results Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Test Input */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-niyama-info flex items-center justify-center shadow-brutal">
                <Play className="w-4 h-4 text-niyama-white" />
              </div>
              <div>
                <h3 className="card-title">Test Input</h3>
                <p className="card-description">
                  Enter JSON input to test your policy
                </p>
              </div>
            </div>
          </div>
          <div className="card-content p-0">
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full h-48 bg-niyama-gray-900 text-niyama-white p-6 font-mono text-sm border-0 resize-none focus:outline-none"
              placeholder='{\n  "kind": "Pod",\n  "spec": {\n    "securityContext": {\n      "runAsNonRoot": true\n    }\n  }\n}'
            />
          </div>
        </div>

        {/* Test Results */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-niyama-success flex items-center justify-center shadow-brutal">
                <CheckCircle className="w-4 h-4 text-niyama-white" />
              </div>
              <div>
                <h3 className="card-title">Test Results</h3>
                <p className="card-description">
                  Policy evaluation results will appear here
                </p>
              </div>
            </div>
          </div>
          <div className="card-content">
            {testResult ? (
              <div className="space-y-4">
                <div className={`flex items-center space-x-3 p-4 rounded border-2 ${
                  testResult.decision === 'allow' 
                    ? 'bg-niyama-success border-niyama-success text-niyama-white' :
                  testResult.decision === 'deny' 
                    ? 'bg-niyama-error border-niyama-error text-niyama-white' :
                    'bg-niyama-warning border-niyama-warning text-niyama-white'
                }`}>
                  {testResult.decision === 'allow' ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : testResult.decision === 'deny' ? (
                    <AlertCircle className="h-6 w-6" />
                  ) : (
                    <AlertCircle className="h-6 w-6" />
                  )}
                  <span className="font-bold text-lg">
                    DECISION: {testResult.decision.toUpperCase()}
                  </span>
                </div>
                <div className="bg-niyama-gray-100 border-2 border-niyama-black p-4 rounded">
                  <pre className="text-sm text-niyama-gray-800 whitespace-pre-wrap font-mono">
                    {testResult.reason}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-niyama-gray-200 border-2 border-niyama-black rounded mx-auto mb-4 flex items-center justify-center">
                  <Play className="w-8 h-8 text-niyama-black" />
                </div>
                <p className="text-niyama-gray-600 font-medium">
                  Click "Test Policy" to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`fixed top-6 right-6 p-6 border-2 border-niyama-black shadow-brutal z-50 ${
          saveMessage.includes('Error') 
            ? 'bg-niyama-error text-niyama-white' 
            : 'bg-niyama-success text-niyama-white'
        }`}>
          <div className="flex items-center space-x-3">
            {saveMessage.includes('Error') ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <CheckCircle className="w-6 h-6" />
            )}
            <span className="font-bold">{saveMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

