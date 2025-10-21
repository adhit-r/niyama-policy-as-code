import React, { useState } from 'react';
import { 
  FileText, 
  Shield, 
  Server, 
  Database, 
  Cloud, 
  Lock,
  Eye,
  Copy,
  Download,
  Star,
  Tag
} from 'lucide-react';

interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  compliance: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: number;
  author: string;
  content: string;
  tags: string[];
}

export const PolicyTemplates: React.FC<{ onSelectTemplate: (content: string) => void }> = ({ 
  onSelectTemplate 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const templates: PolicyTemplate[] = [
    {
      id: 'container-security',
      name: 'Container Security Policy',
      description: 'Comprehensive security policy for container deployments including privilege escalation, resource limits, and registry restrictions.',
      category: 'security',
      compliance: ['SOC2', 'HIPAA'],
      difficulty: 'intermediate',
      popularity: 95,
      author: 'Niyama Security Team',
      tags: ['containers', 'kubernetes', 'security', 'docker'],
      content: `package kubernetes.security.containers

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
}`
    },
    {
      id: 'network-policy',
      name: 'Network Security Policy',
      description: 'Network segmentation and traffic control policies for microservices architecture.',
      category: 'networking',
      compliance: ['PCI-DSS', 'SOC2'],
      difficulty: 'advanced',
      popularity: 87,
      author: 'Platform Team',
      tags: ['networking', 'microservices', 'segmentation'],
      content: `package kubernetes.networking

import rego.v1

# Require network policies for all namespaces
deny contains msg if {
    input.kind == "Namespace"
    not has_network_policy(input.metadata.name)
    msg := sprintf("Namespace '%s' must have a NetworkPolicy", [input.metadata.name])
}

# Deny ingress from external sources to sensitive namespaces
sensitive_namespaces := {"production", "staging", "database"}

deny contains msg if {
    input.kind == "NetworkPolicy"
    input.metadata.namespace in sensitive_namespaces
    rule := input.spec.ingress[_]
    not rule.from
    msg := "NetworkPolicy in sensitive namespace cannot allow traffic from all sources"
}`
    },
    {
      id: 'resource-management',
      name: 'Resource Management Policy',
      description: 'CPU and memory resource limits and requests for optimal cluster utilization.',
      category: 'resources',
      compliance: ['Cost Optimization'],
      difficulty: 'beginner',
      popularity: 92,
      author: 'DevOps Team',
      tags: ['resources', 'limits', 'optimization'],
      content: `package kubernetes.resources

import rego.v1

# Require resource requests and limits
deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    not container.resources.requests
    msg := sprintf("Container '%s' must define resource requests", [container.name])
}

deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    not container.resources.limits
    msg := sprintf("Container '%s' must define resource limits", [container.name])
}

# Enforce reasonable resource ratios
deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    requests := container.resources.requests
    limits := container.resources.limits
    cpu_ratio := to_number(limits.cpu) / to_number(requests.cpu)
    cpu_ratio > 4
    msg := sprintf("Container '%s' CPU limit/request ratio too high: %v", [container.name, cpu_ratio])
}`
    },
    {
      id: 'data-protection',
      name: 'Data Protection Policy',
      description: 'Policies for handling sensitive data, encryption, and compliance requirements.',
      category: 'compliance',
      compliance: ['GDPR', 'HIPAA', 'SOX'],
      difficulty: 'advanced',
      popularity: 78,
      author: 'Compliance Team',
      tags: ['data', 'encryption', 'privacy', 'compliance'],
      content: `package kubernetes.data.protection

import rego.v1

# Require encryption for persistent volumes with sensitive data
sensitive_labels := {"data-classification": "sensitive", "pii": "true", "financial": "true"}

deny contains msg if {
    input.kind == "PersistentVolumeClaim"
    has_sensitive_label(input.metadata.labels)
    not input.spec.storageClassName in encrypted_storage_classes
    msg := "PVC with sensitive data must use encrypted storage class"
}

encrypted_storage_classes := {"encrypted-ssd", "encrypted-hdd"}

has_sensitive_label(labels) if {
    some key, value in sensitive_labels
    labels[key] == value
}`
    },
    {
      id: 'image-security',
      name: 'Image Security Policy',
      description: 'Container image scanning, vulnerability management, and registry security.',
      category: 'security',
      compliance: ['SOC2', 'ISO27001'],
      difficulty: 'intermediate',
      popularity: 89,
      author: 'Security Team',
      tags: ['images', 'scanning', 'vulnerabilities', 'registry'],
      content: `package kubernetes.images.security

import rego.v1

# Allow only approved registries
approved_registries := {
    "registry.company.com",
    "gcr.io/company-project",
    "docker.io/library"
}

deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    image_registry := split(container.image, "/")[0]
    not image_registry in approved_registries
    msg := sprintf("Container '%s' uses unauthorized registry '%s'", [container.name, image_registry])
}

# Deny images with known vulnerabilities
deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    has_critical_vulnerabilities(container.image)
    msg := sprintf("Container '%s' image has critical vulnerabilities", [container.name])
}

# Require image scanning annotations
deny contains msg if {
    input.kind == "Pod"
    container := input.spec.containers[_]
    not input.metadata.annotations["security.scan.status"]
    msg := "Pod must have security scan status annotation"
}`
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: FileText },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'networking', name: 'Networking', icon: Server },
    { id: 'resources', name: 'Resources', icon: Database },
    { id: 'compliance', name: 'Compliance', icon: Lock }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black shadow-brutal p-6">
        <h1 className="font-display font-bold text-3xl text-black mb-4">Policy Templates</h1>
        <p className="text-gray-700 mb-4">
          Start with pre-built policy templates designed by security experts and the community.
        </p>
        
        {/* Search */}
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-white border-2 border-black px-4 py-3 text-base focus:border-orange-500 focus:outline-none"
          />
          <button className="bg-orange-500 text-white border-2 border-black px-6 py-3 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
            Search
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Categories Sidebar */}
        <div className="w-64 bg-white border-r-2 border-black">
          <div className="bg-gray-100 border-b-2 border-black p-4">
            <h3 className="font-display font-bold text-lg text-black">Categories</h3>
          </div>
          <div className="p-4 space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 p-3 border-2 font-semibold transition-all duration-150 ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white border-black shadow-brutal'
                      : 'bg-white text-black border-black hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white border-2 border-black shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
                {/* Template Header */}
                <div className="bg-gray-100 border-b-2 border-black p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-lg text-black">{template.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-semibold">{template.popularity}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  {/* Difficulty Badge */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 ${getDifficultyColor(template.difficulty)} text-white border border-black text-xs font-semibold`}>
                      {template.difficulty.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">by {template.author}</span>
                  </div>
                </div>

                {/* Template Content */}
                <div className="p-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 border border-black text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 border border-black text-xs font-semibold">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Compliance */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-600 mb-1">COMPLIANCE:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.compliance.map((framework) => (
                        <span key={framework} className="px-2 py-1 bg-orange-500 text-white border border-black text-xs font-semibold">
                          {framework}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectTemplate(template.content)}
                      className="flex-1 bg-orange-500 text-white border-2 border-black px-3 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 text-sm flex items-center justify-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Use Template</span>
                    </button>
                    <button className="bg-white text-black border-2 border-black px-3 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 text-sm">
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl text-gray-600 mb-2">No templates found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};