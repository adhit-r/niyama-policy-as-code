import React, { useState, useEffect } from 'react';
import { Download, Star, Tag, FileText, Code, Shield, Zap, Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  description: string;
  framework: string;
  language: string;
  content: string;
}

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const navigate = useNavigate();

  const frameworks = ['all', 'Kubernetes', 'Docker', 'AWS', 'Azure', 'GCP', 'Terraform'];
  const languages = ['all', 'rego', 'yaml', 'json'];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFramework = selectedFramework === 'all' || template.framework === selectedFramework;
    const matchesLanguage = selectedLanguage === 'all' || template.language === selectedLanguage;
    
    return matchesSearch && matchesFramework && matchesLanguage;
  });

  const handleUseTemplate = (template: Template) => {
    // Navigate to policy editor with template content
    navigate('/policies/new', { 
      state: { 
        template: template,
        initialContent: template.content 
      } 
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-niyama-black border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-niyama-black flex items-center justify-center shadow-brutal">
              <FileText className="w-6 h-6 text-niyama-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-niyama-black">
                Policy Templates
              </h1>
              <p className="text-body text-niyama-gray-600 mt-1">
                Pre-built policy templates for common use cases
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
            <button className="btn-secondary btn-lg flex items-center justify-center">
              <Download className="w-5 h-5 mr-2" />
              Export All
            </button>
            <button className="btn-accent btn-lg flex items-center justify-center">
              <Plus className="w-5 h-5 mr-2" />
              Create Template
            </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-niyama-info flex items-center justify-center shadow-brutal">
              <Filter className="w-4 h-4 text-niyama-white" />
            </div>
            <h3 className="card-title">Filter Templates</h3>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-niyama-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="input"
            >
              {frameworks.map(framework => (
                <option key={framework} value={framework}>
                  {framework === 'all' ? 'All Frameworks' : framework}
                </option>
              ))}
            </select>
            
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="input"
            >
              {languages.map(language => (
                <option key={language} value={language}>
                  {language === 'all' ? 'All Languages' : language.toUpperCase()}
                </option>
              ))}
            </select>
            
            <button className="btn-primary btn-md">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="card hover:shadow-brutal-hover transition-all duration-150 ease-in-out cursor-pointer">
            <div className="card-header">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-niyama-accent flex items-center justify-center shadow-brutal">
                    {template.framework === 'Kubernetes' ? (
                      <Shield className="h-5 w-5 text-niyama-black" />
                    ) : template.framework === 'Docker' ? (
                      <Code className="h-5 w-5 text-niyama-black" />
                    ) : (
                      <FileText className="h-5 w-5 text-niyama-black" />
                    )}
                  </div>
                  <div>
                    <h3 className="card-title text-lg">{template.name}</h3>
                    <p className="text-sm text-niyama-gray-600">{template.framework}</p>
                  </div>
                </div>
                <span className="badge-primary">
                  {template.language.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="card-content">
              <p className="text-niyama-gray-700 text-sm mb-4 line-clamp-3">{template.description}</p>
              
              <div className="flex items-center justify-between text-sm text-niyama-gray-600 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  4.8
                </div>
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  1250
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-primary">
                  <Tag className="h-3 w-3 mr-1" />
                  {template.framework}
                </span>
                <span className="badge-primary">
                  <Tag className="h-3 w-3 mr-1" />
                  {template.language}
                </span>
              </div>
            </div>
            
            <div className="card-footer">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="btn-accent btn-md flex-1"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Use Template
                </button>
                <button className="btn-secondary btn-md">
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-niyama-gray-200 border-2 border-niyama-black rounded mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-niyama-black" />
          </div>
          <h3 className="text-heading-2 font-bold text-niyama-black mb-2">No templates found</h3>
          <p className="text-niyama-gray-600">Try adjusting your search criteria or create a new template.</p>
        </div>
      )}
    </div>
  );
};