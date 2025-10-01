import React from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-niyama-black mb-2 text-display">
          Settings
        </h1>
        <p className="text-niyama-gray-600 text-body">
          Manage your account and organization settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <nav className="space-y-2">
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
                  className={`w-full flex items-center px-4 py-3 text-sm font-bold border-2 border-niyama-black transition-all duration-150 ${
                    item.current
                      ? 'bg-niyama-accent text-niyama-black shadow-brutal'
                      : 'bg-niyama-white text-niyama-gray-700 hover:bg-niyama-gray-100 hover:text-niyama-black'
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
          <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal">
            <div className="bg-niyama-gray-100 border-b-2 border-niyama-black p-6">
              <h3 className="text-xl font-bold text-niyama-black text-heading">Profile Settings</h3>
              <p className="text-niyama-gray-600 text-body mt-1">
                Update your personal information and preferences
              </p>
            </div>
            <div className="p-6">
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






