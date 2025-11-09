import React, { useState, useEffect } from 'react';
import { Save, Code, Eye, Maximize2, Minimize2, TestTube, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from '../hooks/useTranslation';
import { usePolicyEditorStore } from '../store/policyEditorStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface PolicyData {
  id: string;
  name: string;
  description: string;
  content: string;
  language: string;
  category: string;
  tags: string[];
  status: string;
}

export const PolicyEditor: React.FC = () => {
  const [splitView, setSplitView] = useState<'code' | 'preview'>('code');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testInput, setTestInput] = useState('{\n  "kind": "Pod",\n  "spec": {\n    "securityContext": {\n      "runAsNonRoot": true\n    }\n  }\n}');
  const [policyName, setPolicyName] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [policyLanguage, setPolicyLanguage] = useState('rego');
  const [policyCategory, setPolicyCategory] = useState('security');
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { t } = useTranslation();

  const { policyCode, setPolicyCode } = usePolicyEditorStore();

  // Fetch policy if editing existing
  const { data: policyData, isLoading } = useQuery(['policy', params.id], () => {
    if (params.id) {
      return fetch(`http://localhost:8000/api/v1/policies/${params.id}`).then(res => res.json());
    }
    return null;
  });

  useEffect(() => {
    if (policyData) {
      setPolicyName(policyData.name);
      setPolicyDescription(policyData.description);
      setPolicyCode(policyData.content);
      setPolicyLanguage(policyData.language);
      setPolicyCategory(policyData.category);
    }
  }, [policyData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(params.id ? '/api/v1/policies/update' : '/api/v1/policies', {
        method: params.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: policyName,
          description: policyDescription,
          content: policyCode,
          language: policyLanguage,
          category: policyCategory,
        }),
      });

      if (response.ok) {
        // Handle success
      } else {
        // Handle error
      }
    } catch (error) {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const parsedInput = JSON.parse(testInput);
      const response = await fetch('/api/v1/policies/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy: policyCode, input: parsedInput }),
      });
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      // Handle error
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className={`min-h-screen bg-white ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-medium shadow-brutal">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-charcoal">Policy Editor</h1>
            <div className="flex space-x-2">
              <button onClick={() => setSplitView('code')} className={`px-4 py-2 border-2 border-gray-medium rounded ${splitView === 'code' ? 'bg-accent text-white' : ''}`}>
                <Code className="w-4 h-4 mr-2" />
                Code
              </button>
              <button onClick={() => setSplitView('preview')} className={`px-4 py-2 border-2 border-gray-medium rounded ${splitView === 'preview' ? 'bg-accent text-white' : ''}`}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleTest} disabled={isTesting} className="btn-secondary px-4 py-2">
              <TestTube className="w-4 h-4 mr-2" />
              Test Policy
            </button>
            <button onClick={handleSave} disabled={isSaving} className="btn-accent px-4 py-2">
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            <button onClick={() => setFullscreen(!fullscreen)} className="btn-secondary p-2">
              {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className={`flex h-[calc(100vh-6rem)] ${sidebarCollapsed ? '' : 'lg:pl-80'}`}>
        {/* Sidebar - Collapsible */}
        <div className={`bg-white border-r-2 border-gray-medium w-80 h-full p-6 transition-all duration-300 ${sidebarCollapsed ? 'w-0 overflow-hidden' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-charcoal mb-2">Policy Details</h3>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">Name</label>
              <input
                type="text"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                className="w-full p-2 border-2 border-gray-medium rounded focus:ring-2 focus:ring-accent focus:border-accent"
                placeholder="Enter policy name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-1">Description</label>
              <textarea
                value={policyDescription}
                onChange={(e) => setPolicyDescription(e.target.value)}
                className="w-full p-2 border-2 border-gray-medium rounded focus:ring-2 focus:ring-accent focus:border-accent h-32"
                placeholder="Describe the policy"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-bold text-charcoal mb-1">Language</label>
                <select
                  value={policyLanguage}
                  onChange={(e) => setPolicyLanguage(e.target.value)}
                  className="w-full p-2 border-2 border-gray-medium rounded focus:ring-2 focus:ring-accent focus:border-accent"
                >
                  <option value="rego">Rego</option>
                  <option value="yaml">YAML</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-charcoal mb-1">Category</label>
                <select
                  value={policyCategory}
                  onChange={(e) => setPolicyCategory(e.target.value)}
                  className="w-full p-2 border-2 border-gray-medium rounded focus:ring-2 focus:ring-accent focus:border-accent"
                >
                  <option value="security">Security</option>
                  <option value="compliance">Compliance</option>
                  <option value="resources">Resources</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">Tag 1</span>
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">Tag 2</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {splitView === 'code' ? (
            <div className="w-full p-4">
              <div className="h-full bg-gray-900 text-white rounded border-2 border-charcoal">
                <textarea
                  value={policyCode}
                  onChange={(e) => setPolicyCode(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-transparent border-none outline-none resize-none text-white placeholder:text-gray-500"
                  placeholder="// Write your policy code here..."
                />
              </div>
            </div>
          ) : (
            <div className="w-full p-4">
              <div className="h-full bg-white border-2 border-charcoal rounded p-4 text-sm">
                {testResult ? (
                  <div className="p-4 bg-gray-50 border border-gray-medium">
                    <h3 className="font-bold text-charcoal mb-2">Test Result</h3>
                    <p className={`text-lg font-bold ${testResult.decision === 'allow' ? 'text-success' : 'text-error'}`}>
                      Decision: {testResult.decision}
                    </p>
                    <pre className="text-gray-600 mt-2 whitespace-pre-wrap">
                      {JSON.stringify(testResult.output, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">Preview will appear here after testing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
