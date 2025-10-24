import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Save, 
  GitBranch, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Settings,
  Download,
  Upload,
  Copy,
  Share2
} from 'lucide-react';
import { PolicyMetadataTab, PolicyHistoryTab, CollaborationTab } from './OrganizationalFeatures';

interface PolicyEditorProps {
  policyId?: string;
  initialContent?: string;
  readOnly?: boolean;
  organizationMode?: boolean;
}

interface PolicyMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  lastModified: string;
  status: 'draft' | 'review' | 'approved' | 'deprecated';
  tags: string[];
  compliance: string[];
  reviewers: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    line: number;
    column: number;
    message: string;
  }>;
}

export const PolicyEditor: React.FC<PolicyEditorProps> = ({
  policyId,
  initialContent = '',
  readOnly = false,
  organizationMode = true
}) => {
  const [content, setContent] = useState(initialContent);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'metadata' | 'history' | 'collaboration'>('editor');
  
  const editorRef = useRef<any>(null);

  // Mock policy metadata - in real app, fetch from API
  const [metadata, setMetadata] = useState<PolicyMetadata>({
    id: policyId || 'new-policy',
    name: 'Container Security Policy',
    description: 'Enforces security best practices for container deployments',
    version: '1.2.0',
    author: 'security-team@company.com',
    lastModified: '2024-01-15T10:30:00Z',
    status: 'approved',
    tags: ['security', 'containers', 'kubernetes'],
    compliance: ['SOC2', 'HIPAA', 'PCI-DSS'],
    reviewers: ['john.doe@company.com', 'jane.smith@company.com']
  });

  // Sample OPA/Rego policy content
  const samplePolicy = `package kubernetes.security.containers

import rego.v1

# Deny containers running as root
deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    container.securityContext.runAsUser == 0
    msg := sprintf("Container '%s' is running as root user", [container.name])
}

# Require security context
deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    not container.securityContext
    msg := sprintf("Container '%s' must define securityContext", [container.name])
}

# Deny privileged containers
deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    container.securityContext.privileged == true
    msg := sprintf("Container '%s' cannot run in privileged mode", [container.name])
}

# Require resource limits
deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    not container.resources.limits
    msg := sprintf("Container '%s' must define resource limits", [container.name])
}

# Allow only approved registries
allowed_registries := {
    "registry.company.com",
    "gcr.io/company-project",
    "docker.io/library"
}

deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    image_registry := split(container.image, "/")[0]
    not image_registry in allowed_registries
    msg := sprintf("Container '%s' uses unauthorized registry '%s'", [container.name, image_registry])
}`;

  useEffect(() => {
    // Check for template content in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const templateContent = urlParams.get('template');
    
    if (templateContent) {
      setContent(decodeURIComponent(templateContent));
    } else if (!content && !readOnly) {
      setContent(samplePolicy);
    }
  }, [content, readOnly]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure Rego language support
    monaco.languages.register({ id: 'rego' });
    
    // Define Rego syntax highlighting
    monaco.languages.setMonarchTokensProvider('rego', {
      tokenizer: {
        root: [
          [/package\b/, 'keyword'],
          [/import\b/, 'keyword'],
          [/default\b/, 'keyword'],
          [/if\b/, 'keyword'],
          [/else\b/, 'keyword'],
          [/not\b/, 'keyword'],
          [/some\b/, 'keyword'],
          [/every\b/, 'keyword'],
          [/in\b/, 'keyword'],
          [/contains\b/, 'keyword'],
          [/deny\b/, 'keyword.control'],
          [/allow\b/, 'keyword.control'],
          [/violation\b/, 'keyword.control'],
          [/warn\b/, 'keyword.control'],
          [/#.*$/, 'comment'],
          [/".*?"/, 'string'],
          [/\d+/, 'number'],
          [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier'],
        ]
      }
    });

    // Set theme
    monaco.editor.defineTheme('niyama-theme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '#ff6b35', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: '#000000', fontStyle: 'bold' },
        { token: 'comment', foreground: '#6b7280', fontStyle: 'italic' },
        { token: 'string', foreground: '#059669' },
        { token: 'number', foreground: '#dc2626' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#f3f4f6',
        'editor.selectionBackground': '#fef3c7',
      }
    });

    monaco.editor.setTheme('niyama-theme');
  };

  const validatePolicy = async () => {
    setIsValidating(true);
    
    // Simulate API call to validate policy
    setTimeout(() => {
      const mockValidation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [
          {
            line: 15,
            column: 5,
            message: 'Consider using more specific resource limit values'
          }
        ]
      };
      
      setValidation(mockValidation);
      setIsValidating(false);
    }, 1500);
  };

  const savePolicy = async () => {
    setIsSaving(true);
    
    // Simulate API call to save policy
    setTimeout(() => {
      console.log('Policy saved:', { content, metadata });
      setIsSaving(false);
    }, 1000);
  };

  const testPolicy = () => {
    console.log('Testing policy with sample data...');
    // In real app, send to OPA for testing
  };

  const TabButton = ({ tab, label, icon: Icon }: { tab: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center space-x-2 px-4 py-2 border-2 font-semibold transition-all duration-150 ${
        activeTab === tab
          ? 'bg-orange-500 text-white border-black shadow-brutal'
          : 'bg-white text-black border-black hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black shadow-brutal p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-black mb-2">
              {metadata.name}
            </h1>
            <p className="text-gray-700">{metadata.description}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Badge */}
            <div className={`px-3 py-1 border-2 border-black font-semibold text-sm ${
              metadata.status === 'approved' ? 'bg-green-500 text-white' :
              metadata.status === 'review' ? 'bg-yellow-500 text-black' :
              metadata.status === 'draft' ? 'bg-gray-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {metadata.status.toUpperCase()}
            </div>
            
            {/* Version */}
            <div className="px-3 py-1 bg-white border-2 border-black font-semibold text-sm">
              v{metadata.version}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={validatePolicy}
            disabled={isValidating}
            className="bg-white text-black border-2 border-black px-4 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center space-x-2"
          >
            {isValidating ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin"></div>
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>Validate</span>
          </button>

          <button
            onClick={testPolicy}
            className="bg-white text-black border-2 border-black px-4 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Test</span>
          </button>

          <button
            onClick={savePolicy}
            disabled={isSaving || readOnly}
            className="bg-orange-500 text-white border-2 border-black px-6 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center space-x-2"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save</span>
          </button>

          {organizationMode && (
            <>
              <button className="bg-white text-black border-2 border-black px-4 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button className="bg-white text-black border-2 border-black px-4 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center space-x-2">
                <GitBranch className="w-4 h-4" />
                <span>Branch</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b-2 border-black">
        <div className="flex space-x-1 p-2">
          <TabButton tab="editor" label="Policy Editor" icon={Settings} />
          {organizationMode && (
            <>
              <TabButton tab="metadata" label="Metadata" icon={Eye} />
              <TabButton tab="history" label="History" icon={Clock} />
              <TabButton tab="collaboration" label="Collaboration" icon={Users} />
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {activeTab === 'editor' && (
          <>
            {/* Editor */}
            <div className="flex-1 bg-white border-r-2 border-black">
              <Editor
                height="100%"
                language="rego"
                value={content}
                onChange={(value) => setContent(value || '')}
                onMount={handleEditorDidMount}
                options={{
                  readOnly,
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  rulers: [80, 120],
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Validation Panel */}
            <div className="w-80 bg-white border-l-2 border-black">
              <div className="bg-gray-100 border-b-2 border-black p-4">
                <h3 className="font-display font-bold text-lg text-black">Validation Results</h3>
              </div>
              
              <div className="p-4 space-y-4">
                {validation ? (
                  <>
                    {/* Status */}
                    <div className={`flex items-center space-x-2 p-3 border-2 border-black ${
                      validation.isValid ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {validation.isValid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold">
                        {validation.isValid ? 'Policy is valid' : 'Policy has errors'}
                      </span>
                    </div>

                    {/* Errors */}
                    {validation.errors.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-600 mb-2">Errors:</h4>
                        {validation.errors.map((error, index) => (
                          <div key={index} className="p-2 bg-red-50 border border-red-200 text-sm">
                            <div className="font-semibold">Line {error.line}:{error.column}</div>
                            <div>{error.message}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Warnings */}
                    {validation.warnings.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-yellow-600 mb-2">Warnings:</h4>
                        {validation.warnings.map((warning, index) => (
                          <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 text-sm">
                            <div className="font-semibold">Line {warning.line}:{warning.column}</div>
                            <div>{warning.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p>Click "Validate" to check your policy</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Other tabs content */}
        {activeTab === 'metadata' && organizationMode && (
          <div className="flex-1 bg-gray-50 overflow-y-auto">
            <PolicyMetadataTab />
          </div>
        )}

        {activeTab === 'history' && organizationMode && (
          <div className="flex-1 bg-gray-50 overflow-y-auto">
            <PolicyHistoryTab />
          </div>
        )}

        {activeTab === 'collaboration' && organizationMode && (
          <div className="flex-1 bg-gray-50 overflow-y-auto">
            <CollaborationTab />
          </div>
        )}
      </div>
    </div>
  );
};