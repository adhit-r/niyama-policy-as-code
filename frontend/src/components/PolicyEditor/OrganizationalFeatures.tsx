import React, { useState } from 'react';
import { 
  Users, 
  GitBranch, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  Bell,
  Shield,
  Award
} from 'lucide-react';

interface PolicyReview {
  id: string;
  reviewer: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  timestamp: string;
}

interface PolicyHistory {
  id: string;
  version: string;
  author: string;
  timestamp: string;
  changes: string;
  type: 'created' | 'updated' | 'approved' | 'deployed';
}

interface Collaboration {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

export const PolicyMetadataTab: React.FC = () => {
  const [metadata, setMetadata] = useState({
    name: 'Container Security Policy',
    description: 'Enforces security best practices for container deployments',
    version: '1.2.0',
    tags: ['security', 'containers', 'kubernetes'],
    compliance: ['SOC2', 'HIPAA', 'PCI-DSS'],
    severity: 'high',
    category: 'security',
    owner: 'security-team@company.com',
    reviewers: ['john.doe@company.com', 'jane.smith@company.com'],
    approvers: ['security-lead@company.com'],
    environments: ['production', 'staging'],
    clusters: ['prod-us-east', 'prod-eu-west', 'staging-dev']
  });

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white border-2 border-black shadow-brutal p-6">
          <h3 className="font-display font-bold text-xl text-black mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Policy Name</label>
              <input 
                type="text" 
                value={metadata.name}
                onChange={(e) => setMetadata({...metadata, name: e.target.value})}
                className="w-full bg-white border-2 border-black px-4 py-3 text-base focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea 
                value={metadata.description}
                onChange={(e) => setMetadata({...metadata, description: e.target.value})}
                rows={3}
                className="w-full bg-white border-2 border-black px-4 py-3 text-base focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Version</label>
              <input 
                type="text" 
                value={metadata.version}
                onChange={(e) => setMetadata({...metadata, version: e.target.value})}
                className="w-full bg-white border-2 border-black px-4 py-3 text-base focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Organizational Settings */}
        <div className="bg-white border-2 border-black shadow-brutal p-6">
          <h3 className="font-display font-bold text-xl text-black mb-4">Organizational Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Policy Owner</label>
              <input 
                type="email" 
                value={metadata.owner}
                onChange={(e) => setMetadata({...metadata, owner: e.target.value})}
                className="w-full bg-white border-2 border-black px-4 py-3 text-base focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Severity Level</label>
              <select 
                value={metadata.severity}
                onChange={(e) => setMetadata({...metadata, severity: e.target.value})}
                className="w-full bg-white border-2 border-black px-4 py-3 text-base focus:border-orange-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select 
                value={metadata.category}
                onChange={(e) => setMetadata({...metadata, category: e.target.value})}
                className="w-full bg-white border-2 border-black px-4 py-3 text-base focus:border-orange-500 focus:outline-none"
              >
                <option value="security">Security</option>
                <option value="compliance">Compliance</option>
                <option value="governance">Governance</option>
                <option value="cost">Cost Management</option>
                <option value="performance">Performance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tags and Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-black shadow-brutal p-6">
          <h3 className="font-display font-bold text-xl text-black mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {metadata.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-600 text-white border-2 border-black font-semibold text-sm">
                {tag}
              </span>
            ))}
            <button className="px-3 py-1 bg-white text-black border-2 border-black font-semibold text-sm hover:bg-gray-100">
              + Add Tag
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-black shadow-brutal p-6">
          <h3 className="font-display font-bold text-xl text-black mb-4">Compliance Frameworks</h3>
          <div className="flex flex-wrap gap-2">
            {metadata.compliance.map((framework, index) => (
              <span key={index} className="px-3 py-1 bg-orange-500 text-white border-2 border-black font-semibold text-sm flex items-center space-x-1">
                <Award className="w-3 h-3" />
                <span>{framework}</span>
              </span>
            ))}
            <button className="px-3 py-1 bg-white text-black border-2 border-black font-semibold text-sm hover:bg-gray-100">
              + Add Framework
            </button>
          </div>
        </div>
      </div>

      {/* Deployment Targets */}
      <div className="bg-white border-2 border-black shadow-brutal p-6">
        <h3 className="font-display font-bold text-xl text-black mb-4">Deployment Targets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Environments</label>
            <div className="space-y-2">
              {metadata.environments.map((env, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" checked className="w-4 h-4" />
                  <span className="font-semibold">{env}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Clusters</label>
            <div className="space-y-2">
              {metadata.clusters.map((cluster, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" checked className="w-4 h-4" />
                  <span className="font-semibold">{cluster}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PolicyHistoryTab: React.FC = () => {
  const history: PolicyHistory[] = [
    {
      id: '1',
      version: '1.2.0',
      author: 'john.doe@company.com',
      timestamp: '2024-01-15T10:30:00Z',
      changes: 'Added resource limit validation',
      type: 'updated'
    },
    {
      id: '2',
      version: '1.1.0',
      author: 'security-lead@company.com',
      timestamp: '2024-01-10T14:20:00Z',
      changes: 'Approved for production deployment',
      type: 'approved'
    },
    {
      id: '3',
      version: '1.1.0',
      author: 'jane.smith@company.com',
      timestamp: '2024-01-08T09:15:00Z',
      changes: 'Updated registry whitelist',
      type: 'updated'
    },
    {
      id: '4',
      version: '1.0.0',
      author: 'john.doe@company.com',
      timestamp: '2024-01-01T12:00:00Z',
      changes: 'Initial policy creation',
      type: 'created'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'created': return <Plus className="w-4 h-4" />;
      case 'updated': return <Edit className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'deployed': return <Shield className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'created': return 'bg-blue-500';
      case 'updated': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'deployed': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white border-2 border-black shadow-brutal">
        <div className="bg-gray-100 border-b-2 border-black p-4">
          <h3 className="font-display font-bold text-xl text-black">Policy History</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 border-2 border-black">
                <div className={`w-8 h-8 ${getTypeColor(item.type)} border-2 border-black shadow-brutal flex items-center justify-center text-white`}>
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-black">v{item.version}</span>
                    <span className="text-sm text-gray-600">by {item.author}</span>
                  </div>
                  <p className="text-gray-700 mb-1">{item.changes}</p>
                  <p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <button className="bg-white text-black border-2 border-black px-3 py-1 font-semibold text-sm shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CollaborationTab: React.FC = () => {
  const [newComment, setNewComment] = useState('');
  
  const reviews: PolicyReview[] = [
    {
      id: '1',
      reviewer: 'jane.smith@company.com',
      status: 'approved',
      comments: 'Policy looks good. Resource limits are appropriate for our workloads.',
      timestamp: '2024-01-14T16:30:00Z'
    },
    {
      id: '2',
      reviewer: 'security-lead@company.com',
      status: 'pending',
      comments: '',
      timestamp: '2024-01-15T09:00:00Z'
    }
  ];

  const collaboration: Collaboration[] = [
    {
      id: '1',
      user: 'john.doe@company.com',
      action: 'requested review',
      timestamp: '2024-01-15T10:30:00Z',
      details: 'Added @jane.smith and @security-lead for review'
    },
    {
      id: '2',
      user: 'jane.smith@company.com',
      action: 'approved',
      timestamp: '2024-01-14T16:30:00Z',
      details: 'Approved with comments'
    },
    {
      id: '3',
      user: 'john.doe@company.com',
      action: 'updated policy',
      timestamp: '2024-01-14T14:20:00Z',
      details: 'Modified resource limit validation rules'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Review Status */}
      <div className="bg-white border-2 border-black shadow-brutal">
        <div className="bg-gray-100 border-b-2 border-black p-4">
          <h3 className="font-display font-bold text-xl text-black">Review Status</h3>
        </div>
        <div className="p-6 space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex items-start space-x-4 p-4 bg-gray-50 border-2 border-black">
              <div className={`w-8 h-8 border-2 border-black shadow-brutal flex items-center justify-center ${
                review.status === 'approved' ? 'bg-green-500 text-white' :
                review.status === 'rejected' ? 'bg-red-500 text-white' :
                'bg-yellow-500 text-black'
              }`}>
                {review.status === 'approved' ? <ThumbsUp className="w-4 h-4" /> :
                 review.status === 'rejected' ? <ThumbsDown className="w-4 h-4" /> :
                 <Clock className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-black">{review.reviewer}</span>
                  <span className={`px-2 py-1 text-xs font-semibold border border-black ${
                    review.status === 'approved' ? 'bg-green-500 text-white' :
                    review.status === 'rejected' ? 'bg-red-500 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {review.status.toUpperCase()}
                  </span>
                </div>
                {review.comments && (
                  <p className="text-gray-700 mb-1">{review.comments}</p>
                )}
                <p className="text-sm text-gray-500">{new Date(review.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Comment */}
      <div className="bg-white border-2 border-black shadow-brutal">
        <div className="bg-gray-100 border-b-2 border-black p-4">
          <h3 className="font-display font-bold text-xl text-black">Add Comment</h3>
        </div>
        <div className="p-6">
          <div className="flex space-x-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your review comments..."
              rows={3}
              className="flex-1 bg-white border-2 border-black px-4 py-3 text-base focus:border-orange-500 focus:outline-none"
            />
            <div className="flex flex-col space-y-2">
              <button className="bg-green-500 text-white border-2 border-black px-4 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button className="bg-red-500 text-white border-2 border-black px-4 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center space-x-2">
                <ThumbsDown className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button className="bg-white text-black border-2 border-black px-4 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Comment</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white border-2 border-black shadow-brutal">
        <div className="bg-gray-100 border-b-2 border-black p-4">
          <h3 className="font-display font-bold text-xl text-black">Activity Feed</h3>
        </div>
        <div className="p-6 space-y-4">
          {collaboration.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 border-2 border-black">
              <div className="w-8 h-8 bg-orange-500 border-2 border-black shadow-brutal flex items-center justify-center text-white">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-black">
                  <span className="font-semibold">{activity.user}</span> {activity.action}
                </p>
                <p className="text-gray-700 text-sm">{activity.details}</p>
                <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};