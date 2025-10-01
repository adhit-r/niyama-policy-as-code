import React, { useState, useEffect } from 'react';
import { Save, Play, CheckCircle, AlertCircle, Code, FileText, Zap, Settings, Copy, Download, Upload, Eye, EyeOff, Maximize2, Minimize2, Terminal, FileCode, TestTube } from 'lucide-react';
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
  const [testInput, setTestInput] = useState('{\n  "kind": "Pod",\n  "spec": {\n    "securityContext": {\n      "runAsNonRoot": true\n    }\n  }\n}');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'test' | 'results'>('code');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    setActiveTab('results');

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(policyCode);
    setSaveMessage('Code copied to clipboard!');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([policyCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policyDetails.name || 'policy'}.${policyDetails.language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPolicyCode(e.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`min-h-screen bg-niyama-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Navigation Bar */}
      <div className="bg-niyama-white border-b-2 border-niyama-black shadow-brutal">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-niyama-black flex items-center justify-center shadow-brutal">
                <Code className="w-6 h-6 text-niyama-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-niyama-black">Policy Editor</h1>
                <p className="text-sm text-niyama-gray-600">Create and edit Policy as Code rules</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                className="btn-secondary btn-sm flex items-center"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button 
                className="btn-secondary btn-sm flex items-center"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </button>
              <button 
                className="btn-secondary btn-sm flex items-center"
                onClick={handleTestPolicy}
                disabled={isTesting}
              >
                <Play className="w-4 h-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test'}
              </button>
              <button 
                className="btn-accent btn-sm flex items-center"
                onClick={handleSavePolicy}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Code Editor - Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="bg-niyama-accent border-b-2 border-niyama-black p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-niyama-black flex items-center justify-center shadow-brutal">
                  <FileCode className="w-4 h-4 text-niyama-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-niyama-black">Policy Code</h3>
                  <p className="text-sm text-niyama-black">
                    {policyDetails.language.toUpperCase()} • {policyCode.length} characters
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleCopyCode}
                  className="btn-secondary btn-sm flex items-center"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </button>
                <button 
                  onClick={handleDownloadCode}
                  className="btn-secondary btn-sm flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
                <label className="btn-secondary btn-sm flex items-center cursor-pointer">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                  <input
                    type="file"
                    accept=".rego,.yaml,.yml,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 p-0">
            <textarea
              value={policyCode}
              onChange={(e) => setPolicyCode(e.target.value)}
              placeholder="// Enter your policy code here...\npackage kubernetes.security\n\ndefault allow = false\n\nallow {\n    input.kind == 'Pod'\n    input.spec.securityContext.runAsNonRoot == true\n}"
              className="w-full h-full bg-niyama-black text-niyama-accent p-6 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-2 focus:ring-niyama-accent"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className={`bg-niyama-white border-l-2 border-niyama-black shadow-brutal transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}>
          {/* Sidebar Header */}
          <div className="bg-niyama-black border-b-2 border-niyama-black p-4">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                    <Settings className="w-4 h-4 text-niyama-black" />
                  </div>
                  <h3 className="text-lg font-bold text-niyama-white">Details</h3>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="btn-secondary btn-sm"
              >
                {sidebarCollapsed ? '→' : '←'}
              </button>
            </div>
          </div>

          {!sidebarCollapsed && (
            <div className="p-6 space-y-6">
              {/* Policy Details */}
              <div className="space-y-4">
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
                  <label className="form-label">Language</label>
                  <select 
                    className="input"
                    value={policyDetails.language}
                    onChange={(e) => setPolicyDetails({...policyDetails, language: e.target.value})}
                  >
                    <option value="rego">REGO</option>
                    <option value="yaml">YAML</option>
                    <option value="json">JSON</option>
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
          )}
        </div>
      </div>

      {/* Bottom Panel - Test Input and Results */}
      <div className="bg-niyama-white border-t-2 border-niyama-black shadow-brutal">
        {/* Tab Navigation */}
        <div className="bg-niyama-black border-b-2 border-niyama-black">
          <div className="flex">
            <button
              onClick={() => setActiveTab('test')}
              className={`px-6 py-4 font-bold border-r-2 border-niyama-black flex items-center ${
                activeTab === 'test' 
                  ? 'bg-niyama-accent text-niyama-black' 
                  : 'bg-niyama-black text-niyama-white hover:bg-niyama-gray-800'
              }`}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test Input
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-4 font-bold border-r-2 border-niyama-black flex items-center ${
                activeTab === 'results' 
                  ? 'bg-niyama-accent text-niyama-black' 
                  : 'bg-niyama-black text-niyama-white hover:bg-niyama-gray-800'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Test Results
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'test' && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                  <TestTube className="w-4 h-4 text-niyama-black" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-niyama-black">Test Input</h3>
                  <p className="text-sm text-niyama-gray-600">
                    Enter JSON input to test your policy
                  </p>
                </div>
              </div>
              <div className="border-2 border-niyama-black">
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full h-32 bg-niyama-black text-niyama-accent p-4 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-2 focus:ring-niyama-accent"
                  placeholder='{\n  "kind": "Pod",\n  "spec": {\n    "securityContext": {\n      "runAsNonRoot": true\n    }\n  }\n}'
                />
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
                  <CheckCircle className="w-4 h-4 text-niyama-black" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-niyama-black">Test Results</h3>
                  <p className="text-sm text-niyama-gray-600">
                    Policy evaluation results will appear here
                  </p>
                </div>
              </div>
              {testResult ? (
                <div className="space-y-4">
                  <div className={`flex items-center space-x-3 p-4 border-2 ${
                    testResult.decision === 'allow' 
                      ? 'bg-niyama-accent border-niyama-black text-niyama-black' :
                    testResult.decision === 'deny' 
                      ? 'bg-niyama-error border-niyama-black text-niyama-white' :
                      'bg-niyama-warning border-niyama-black text-niyama-black'
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
                  <div className="bg-niyama-gray-100 border-2 border-niyama-black p-4">
                    <pre className="text-sm text-niyama-gray-800 whitespace-pre-wrap font-mono">
                      {testResult.reason}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-niyama-gray-200 border-2 border-niyama-black mx-auto mb-4 flex items-center justify-center">
                    <Play className="w-6 h-6 text-niyama-black" />
                  </div>
                  <p className="text-niyama-gray-600 font-medium">
                    Click "Test Policy" to see results
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`fixed top-6 right-6 p-6 border-2 border-niyama-black shadow-brutal z-50 ${
          saveMessage.includes('Error') 
            ? 'bg-niyama-error text-niyama-white' 
            : 'bg-niyama-accent text-niyama-black'
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