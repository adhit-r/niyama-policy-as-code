import React from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display font-semibold text-charcoal-800">
          Settings
        </h1>
        <p className="mt-2 text-body text-slate-600">
          Manage your account and organization settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {[
              { name: 'Profile', icon: User, current: true },
              { name: 'Security', icon: Shield },
              { name: 'Notifications', icon: Bell },
              { name: 'Integrations', icon: Database },
              { name: 'Organization', icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Profile Settings</h3>
              <p className="card-description">
                Update your personal information and preferences
              </p>
            </div>
            <div className="card-content">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="form-label">First Name</label>
                    <input className="input" defaultValue="John" />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input className="input" defaultValue="Doe" />
                  </div>
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input className="input" type="email" defaultValue="john.doe@company.com" />
                </div>

                <div>
                  <label className="form-label">Role</label>
                  <select className="input">
                    <option>DevSecOps Engineer</option>
                    <option>Compliance Officer</option>
                    <option>Platform Engineer</option>
                    <option>Admin</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Organization</label>
                  <input className="input" defaultValue="Acme Corporation" disabled />
                </div>

                <div className="flex justify-end space-x-3">
                  <button className="btn-secondary btn-md">
                    Cancel
                  </button>
                  <button className="btn-primary btn-md">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




