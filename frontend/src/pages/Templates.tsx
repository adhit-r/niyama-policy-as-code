import React from 'react';
import { Download, Star, Tag } from 'lucide-react';

export const Templates: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display font-semibold text-charcoal-800">
          Policy Templates
        </h1>
        <p className="mt-2 text-body text-slate-600">
          Pre-built policy templates for common use cases
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: 'RBAC - Admin Only',
            description: 'Restrict admin access to specific users',
            category: 'RBAC',
            rating: 4.8,
            downloads: 1250,
            tags: ['kubernetes', 'rbac', 'security'],
          },
          {
            name: 'Resource Limits',
            description: 'Enforce resource limits on containers',
            category: 'Resource Management',
            rating: 4.6,
            downloads: 980,
            tags: ['kubernetes', 'resources', 'containers'],
          },
          {
            name: 'Network Policy',
            description: 'Require network policies for namespaces',
            category: 'Network',
            rating: 4.7,
            downloads: 750,
            tags: ['kubernetes', 'network', 'security'],
          },
          {
            name: 'Image Scanning',
            description: 'Block containers with known vulnerabilities',
            category: 'Security',
            rating: 4.9,
            downloads: 2100,
            tags: ['security', 'vulnerabilities', 'containers'],
          },
          {
            name: 'Data Encryption',
            description: 'Ensure all data is encrypted at rest',
            category: 'Data Governance',
            rating: 4.5,
            downloads: 650,
            tags: ['encryption', 'data', 'compliance'],
          },
          {
            name: 'Audit Logging',
            description: 'Require audit logging for all operations',
            category: 'Compliance',
            rating: 4.4,
            downloads: 420,
            tags: ['audit', 'logging', 'compliance'],
          },
        ].map((template) => (
          <div key={template.name} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="card-content">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-charcoal-800">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {template.description}
                  </p>
                  <div className="mt-3 flex items-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      {template.rating}
                    </div>
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {template.downloads}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 btn-outline btn-sm">
                  Preview
                </button>
                <button className="flex-1 btn-primary btn-sm">
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

