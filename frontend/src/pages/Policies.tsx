import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export const Policies: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display font-semibold text-charcoal-800">
            Policies
          </h1>
          <p className="mt-2 text-body text-slate-600">
            Manage your Policy as Code rules and configurations
          </p>
        </div>
        <Link
          to="/policies/new"
          className="btn-primary btn-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Policies</p>
                <p className="text-2xl font-bold text-charcoal-800">24</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-danger-100">
                <AlertTriangle className="h-6 w-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Violations</p>
                <p className="text-2xl font-bold text-charcoal-800">3</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-charcoal-800">87%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Policy Library</h3>
          <p className="card-description">
            All your organization's policies
          </p>
        </div>
        <div className="card-content">
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-charcoal-800">No policies yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Get started by creating your first policy or importing from templates.
            </p>
            <div className="mt-6">
              <Link
                to="/policies/new"
                className="btn-primary btn-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




