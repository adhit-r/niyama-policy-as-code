import React, { useState } from 'react';
import { Save, Play } from 'lucide-react';
import BitNetAI from '../components/BitNetAI';

export const PolicyEditor: React.FC = () => {
  const [policyCode, setPolicyCode] = useState('');

  const handlePolicyGenerated = (policy: string) => {
    setPolicyCode(policy);
  };

  const handlePolicyAnalyzed = (analysis: any) => {
    console.log('Policy analysis:', analysis);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display font-semibold text-charcoal-800">
            Policy Editor
          </h1>
          <p className="mt-2 text-body text-slate-600">
            Create and edit Policy as Code rules with AI assistance
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary btn-md">
            <Play className="h-4 w-4 mr-2" />
            Test Policy
          </button>
          <button className="btn-primary btn-md">
            <Save className="h-4 w-4 mr-2" />
            Save Policy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Policy Code</h3>
              <p className="card-description">
                Write your policy in Rego, YAML, or JSON
              </p>
            </div>
            <div className="card-content">
              <div className="policy-editor">
                <textarea
                  value={policyCode}
                  onChange={(e) => setPolicyCode(e.target.value)}
                  placeholder="// Enter your policy code here or use the AI assistant to generate one..."
                  className="w-full h-96 bg-slate-900 text-slate-100 p-4 font-mono text-sm border-0 resize-none focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <BitNetAI 
            onPolicyGenerated={handlePolicyGenerated}
            onPolicyAnalyzed={handlePolicyAnalyzed}
          />

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Policy Details</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div>
                  <label className="form-label">Name</label>
                  <input className="input" placeholder="Enter policy name" />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea 
                    className="input" 
                    rows={3}
                    placeholder="Describe what this policy does"
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="input">
                    <option>Security</option>
                    <option>Compliance</option>
                    <option>Resource Management</option>
                    <option>Network</option>
                    <option>RBAC</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Severity</label>
                  <select className="input">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

