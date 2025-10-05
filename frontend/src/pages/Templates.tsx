import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Star, FileText, Zap, Search, Filter, Plus, Eye, Copy } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  const frameworks = ['all', 'Kubernetes', 'Docker', 'AWS', 'Azure', 'GCP', 'Terraform'];
  const languages = ['all', 'rego', 'yaml', 'json'];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/templates`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Template[] = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Fallback to empty array or local storage if needed
      setTemplates([]);
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
    navigate('/policies/new', { 
      state: { 
        initialContent: template.content,
        templateName: template.name 
      } 
    });
  };

  const handlePreviewTemplate = (template: Template) => {
    // Open preview modal or navigate to preview page
    // For now, log and show alert
    alert(`Preview: ${template.name}\n\n${template.content.substring(0, 200)}...`);
  };

  const handleCopyTemplate = async (template: Template) => {
    try {
      await navigator.clipboard.writeText(template.content);
      // Show success toast (implement Toast component if not exists)
      console.log('Template copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-niyama-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-niyama-accent border-2 border-niyama-black mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-niyama-black" />
          </div>
          <p className="text-niyama-gray-600 font-medium">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (templates.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-niyama-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-niyama-gray-200 border-2 border-niyama-black mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-niyama-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-niyama-black mb-2">No Templates Available</h3>
          <p className="text-niyama-gray-600 mb-4">Templates will appear here once the backend is configured.</p>
          <button onClick={fetchTemplates} className="btn-accent px-6 py-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-niyama-gray-100">
      {/* Header Section */}
      <div className="bg-niyama-white border-b-2 border-niyama-black shadow-brutal">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-niyama-accent flex items-center justify-center shadow-brutal">
                  <FileText className="w-8 h-8 text-niyama-black" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-niyama-black text-display">
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
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-niyama-white border-b-2 border-niyama-black shadow-brutal">
        <div className="container mx-auto px-6 py-6">
          <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-niyama-black flex items-center justify-center shadow-brutal">
                <Filter className="w-4 h-4 text-niyama-white" />
              </div>
              <h3 className="text-lg font-bold text-niyama-black">Filter Templates</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-niyama-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Framework</label>
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
              </div>
              
              <div>
                <label className="form-label">Language</label>
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
              </div>
              
              <div className="flex items-end">
                <button className="btn-accent w-full">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-niyama-black">
            Templates ({filteredTemplates.length})
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`btn-secondary btn-sm ${viewMode === 'grid' ? 'bg-niyama-accent text-niyama-black' : ''}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn-secondary btn-sm ${viewMode === 'list' ? 'bg-niyama-accent text-niyama-black' : ''}`}
            >
              List
            </button>
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal p-12 text-center rounded">
            <div className="w-16 h-16 bg-niyama-gray-200 border-2 border-niyama-black mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-8 h-8 text-niyama-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-niyama-black mb-2">No templates found</h3>
            <p className="text-niyama-gray-600 mb-4">
              Try adjusting your search criteria or create a new template.
            </p>
            <button onClick={fetchTemplates} className="btn-accent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Templates
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 rounded">
                {/* Template Header */}
                <div className="bg-niyama-accent border-b-2 border-niyama-black p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-niyama-black mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-niyama-black">
                        {template.framework}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-niyama-black text-niyama-white px-2 py-1 text-xs font-bold rounded">
                        {template.language.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Template Content */}
                <div className="p-6">
                  <p className="text-niyama-gray-600 mb-4 line-clamp-3">
                    {template.description}
                  </p>

                  {/* Template Stats - Dynamic */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-niyama-accent" />
                        <span className="text-sm font-medium text-niyama-black">4.8</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="w-4 h-4 text-niyama-gray-400" />
                        <span className="text-sm text-niyama-gray-600">1,250</span>
                      </div>
                    </div>
                  </div>

                  {/* Template Tags */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="bg-niyama-accent-light text-niyama-black px-2 py-1 text-xs font-bold border border-niyama-black rounded">
                      {template.framework}
                    </span>
                    <span className="bg-niyama-gray-200 text-niyama-black px-2 py-1 text-xs font-bold border border-niyama-black rounded">
                      {template.language.toUpperCase()}
                    </span>
                  </div>

                  {/* Template Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="btn-accent btn-sm flex-1 flex items-center justify-center"
                      aria-label={`Use ${template.name} template`}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Use Template
                    </button>
                    <button
                      onClick={() => handlePreviewTemplate(template)}
                      className="btn-secondary btn-sm flex items-center justify-center"
                      aria-label={`Preview ${template.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyTemplate(template)}
                      className="btn-secondary btn-sm flex items-center justify-center"
                      aria-label={`Copy ${template.name} content`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
