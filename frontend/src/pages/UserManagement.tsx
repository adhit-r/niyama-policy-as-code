import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '../services/api';
import { AdminOnly } from '../components/RoleGuard';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck,
  UserX,
  Search
} from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
// import { UserRole } from '../types';

export const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  // const [showAddUser] = useState(false);

  const { data: users, isLoading, refetch } = useQuery(
    'users',
    () => api.getUsers(),
    {
      enabled: true,
    }
  );

  const filteredUsers = users?.data?.filter((user: any) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId);
        refetch();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.updateUser(userId, { isActive: !isActive });
      refetch();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AdminOnly fallback={
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-niyama-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-niyama-gray-700">Access Denied</h3>
        <p className="text-niyama-gray-500">You need admin privileges to manage users.</p>
      </div>
    }>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-niyama-black flex items-center justify-center shadow-brutal">
                <Users className="w-6 h-6 text-niyama-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-niyama-black text-display">
                  User Management
                </h1>
                <p className="text-body text-niyama-gray-600 mt-1">
                  Manage users and their permissions
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {/* setShowAddUser(true) */}}
            className="btn-primary btn-lg flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-content">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-niyama-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="compliance">Compliance</option>
                  <option value="developer">Developer</option>
                  <option value="auditor">Auditor</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-niyama-black">
              Users ({filteredUsers?.length || 0})
            </h3>
          </div>
          
          <div className="card-content p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-niyama-gray-100 border-b-2 border-niyama-black">
                  <tr>
                    <th className="text-left p-4 font-semibold text-niyama-black">User</th>
                    <th className="text-left p-4 font-semibold text-niyama-black">Role</th>
                    <th className="text-left p-4 font-semibold text-niyama-black">Status</th>
                    <th className="text-left p-4 font-semibold text-niyama-black">Last Login</th>
                    <th className="text-left p-4 font-semibold text-niyama-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers?.map((user: any) => (
                    <tr key={user.id} className="border-b border-niyama-gray-200 hover:bg-niyama-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-niyama-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-niyama-black">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-niyama-black">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-niyama-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-niyama-accent text-niyama-white' :
                          user.role === 'compliance' ? 'bg-niyama-info text-niyama-white' :
                          user.role === 'developer' ? 'bg-niyama-success text-niyama-white' :
                          user.role === 'auditor' ? 'bg-niyama-warning text-niyama-white' :
                          'bg-niyama-gray-200 text-niyama-gray-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive 
                              ? 'bg-niyama-success text-niyama-white' 
                              : 'bg-niyama-error text-niyama-white'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      
                      <td className="p-4 text-sm text-niyama-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button className="btn-secondary btn-sm">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn-secondary btn-sm text-niyama-error hover:bg-niyama-error hover:text-niyama-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
};

