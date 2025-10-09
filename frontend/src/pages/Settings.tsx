import React, { useState } from 'react';
import { User, Shield, Bell, Database, Users, FileText, Globe, Building2, Key, Zap, Settings as SettingsIcon } from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { AdminOnly } from '../components/RoleGuard';
import { useTranslation } from '../hooks/useTranslation';

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const { t } = useTranslation();

  const sections = [
    { id: 'profile', name: t('settings.profile'), icon: User, color: 'bg-niyama-accent' },
    { id: 'localization', name: t('settings.localization'), icon: Globe, color: 'bg-niyama-info' },
    { id: 'userManagement', name: t('settings.userManagement'), icon: Users, adminOnly: true, color: 'bg-niyama-warning' },
    { id: 'logs', name: t('settings.logs'), icon: FileText, adminOnly: true, color: 'bg-niyama-error' },
    { id: 'organization', name: t('settings.organization'), icon: Building2, adminOnly: true, color: 'bg-niyama-success' },
    { id: 'security', name: t('settings.security'), icon: Shield, color: 'bg-niyama-accent' },
    { id: 'notifications', name: t('settings.notifications'), icon: Bell, color: 'bg-niyama-info' },
    { id: 'integrations', name: t('settings.integrations'), icon: Database, color: 'bg-niyama-warning' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-niyama-black border-4 border-niyama-black mx-auto mb-6 flex items-center justify-center shadow-brutal-lg">
          <SettingsIcon className="w-10 h-10 text-niyama-accent" />
        </div>
        <h1 className="text-4xl font-bold text-niyama-black mb-2">
          {t('settings.title')}
        </h1>
        <p className="text-niyama-gray-600 text-lg max-w-2xl mx-auto">
          {t('settings.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg sticky top-8">
            <div className="bg-niyama-gray-100 border-b-4 border-niyama-black p-4">
              <h3 className="text-lg font-bold text-niyama-black">Settings</h3>
            </div>
            <nav className="p-4 space-y-2">
              {sections.map((item) => {
              const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                if (item.adminOnly) {
                  return (
                    <AdminOnly key={item.id} fallback={null}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 p-4 border-2 border-niyama-black transition-all duration-200 font-bold ${
                          isActive
                            ? `${item.color} text-niyama-black shadow-brutal-lg scale-105`
                            : 'bg-niyama-white text-niyama-gray-700 hover:bg-niyama-gray-100 hover:text-niyama-black hover:shadow-brutal hover:scale-105'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </button>
                    </AdminOnly>
                  );
                }
                
              return (
                <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 p-4 border-2 border-niyama-black transition-all duration-200 font-bold ${
                      isActive
                        ? `${item.color} text-niyama-black shadow-brutal-lg scale-105`
                        : 'bg-niyama-white text-niyama-gray-700 hover:bg-niyama-gray-100 hover:text-niyama-black hover:shadow-brutal hover:scale-105'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
              <div className="bg-niyama-accent border-b-4 border-niyama-black p-6">
        <h3 className="text-2xl font-bold text-niyama-black">{t('settings.profileSection.title')}</h3>
        <p className="text-niyama-gray-700 mt-2">{t('settings.profileSection.description')}</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.profileSection.firstName')}</label>
                    <input className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none" defaultValue="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.profileSection.lastName')}</label>
                    <input className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none" defaultValue="Doe" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.profileSection.email')}</label>
                    <input className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none" type="email" defaultValue="john.doe@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.profileSection.role')}</label>
                    <select className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none">
                      <option>{t('settings.profileSection.roles.devSecOps')}</option>
                      <option>{t('settings.profileSection.roles.compliance')}</option>
                      <option>{t('settings.profileSection.roles.platform')}</option>
                      <option>{t('settings.profileSection.roles.admin')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.profileSection.organization')}</label>
                    <input className="w-full p-4 border-2 border-niyama-black bg-niyama-gray-100 shadow-brutal" defaultValue="Acme Corporation" disabled />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button className="px-6 py-3 bg-niyama-white text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                    {t('common.cancel')}
                  </button>
                  <button className="px-6 py-3 bg-niyama-accent text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'localization' && (
            <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
              <div className="bg-niyama-info border-b-4 border-niyama-black p-6">
                <h3 className="text-2xl font-bold text-niyama-black">{t('settings.localization.title')}</h3>
                <p className="text-niyama-gray-700 mt-2">{t('settings.localization.description')}</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.localization.language')}</label>
                    <LanguageSwitcher />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.localization.timezone')}</label>
                    <select className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none">
                      <option>UTC</option>
                      <option>America/New_York</option>
                      <option>America/Los_Angeles</option>
                      <option>Europe/London</option>
                      <option>Europe/Paris</option>
                      <option>Asia/Tokyo</option>
                      <option>Asia/Shanghai</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.localization.dateFormat')}</label>
                    <select className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.localization.timeFormat')}</label>
                    <select className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none">
                      <option>12 Hour (AM/PM)</option>
                      <option>24 Hour</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button className="px-6 py-3 bg-niyama-white text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                    {t('common.cancel')}
                  </button>
                  <button className="px-6 py-3 bg-niyama-info text-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'userManagement' && (
            <AdminOnly fallback={
              <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg p-12 text-center">
                <Shield className="h-16 w-16 text-niyama-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-niyama-gray-700">Access Denied</h3>
                <p className="text-niyama-gray-500">You need admin privileges to manage users.</p>
              </div>
            }>
              <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
                <div className="bg-niyama-warning border-b-4 border-niyama-black p-6">
                  <h3 className="text-2xl font-bold text-niyama-black">{t('settings.userManagement.title')}</h3>
                  <p className="text-niyama-gray-700 mt-2">{t('settings.userManagement.description')}</p>
                </div>
                <div className="p-8">
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-niyama-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-niyama-gray-700 mb-2">User Management</h4>
                    <p className="text-niyama-gray-500 mb-6">
                      This section will contain the user management functionality moved from the standalone page.
                    </p>
                    <button className="px-6 py-3 bg-niyama-warning text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                      Manage Users
                    </button>
                  </div>
                </div>
              </div>
            </AdminOnly>
          )}

          {activeSection === 'logs' && (
            <AdminOnly fallback={
              <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg p-12 text-center">
                <Shield className="h-16 w-16 text-niyama-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-niyama-gray-700">Access Denied</h3>
                <p className="text-niyama-gray-500">You need admin privileges to view logs.</p>
              </div>
            }>
              <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
                <div className="bg-niyama-error border-b-4 border-niyama-black p-6">
                  <h3 className="text-2xl font-bold text-niyama-white">{t('settings.logs.title')}</h3>
                  <p className="text-niyama-gray-200 mt-2">{t('settings.logs.description')}</p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button className="p-4 bg-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105">
                      <FileText className="w-6 h-6 text-niyama-black mx-auto mb-2" />
                      <span className="font-bold text-niyama-black">{t('settings.logs.systemLogs')}</span>
                    </button>
                    <button className="p-4 bg-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105">
                      <Shield className="w-6 h-6 text-niyama-black mx-auto mb-2" />
                      <span className="font-bold text-niyama-black">{t('settings.logs.auditLogs')}</span>
                    </button>
                    <button className="p-4 bg-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105">
                      <Database className="w-6 h-6 text-niyama-black mx-auto mb-2" />
                      <span className="font-bold text-niyama-black">{t('settings.logs.databaseLogs')}</span>
                    </button>
                </div>

                  <div className="bg-niyama-gray-100 border-2 border-niyama-black p-6">
                    <h4 className="font-bold text-niyama-black mb-4">{t('settings.logs.recentLogs')}</h4>
                    <div className="space-y-3">
                      <div className="text-sm font-mono text-niyama-gray-600 bg-niyama-white p-3 border border-niyama-black">
                        [2024-01-15 10:30:45] INFO: User login successful
                      </div>
                      <div className="text-sm font-mono text-niyama-gray-600 bg-niyama-white p-3 border border-niyama-black">
                        [2024-01-15 10:25:12] WARN: Policy evaluation timeout
                      </div>
                      <div className="text-sm font-mono text-niyama-gray-600 bg-niyama-white p-3 border border-niyama-black">
                        [2024-01-15 10:20:33] ERROR: Database connection failed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AdminOnly>
          )}

          {activeSection === 'organization' && (
            <AdminOnly fallback={
              <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg p-12 text-center">
                <Shield className="h-16 w-16 text-niyama-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-niyama-gray-700">Access Denied</h3>
                <p className="text-niyama-gray-500">You need admin privileges to manage organization.</p>
              </div>
            }>
              <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
                <div className="bg-niyama-success border-b-4 border-niyama-black p-6">
                  <h3 className="text-2xl font-bold text-niyama-white">{t('settings.organization.title')}</h3>
                  <p className="text-niyama-gray-200 mt-2">{t('settings.organization.description')}</p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.organization.name')}</label>
                      <input className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none" defaultValue="Acme Corporation" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.organization.domain')}</label>
                      <input className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none" defaultValue="acme.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.organization.size')}</label>
                      <select className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none">
                        <option>1-10 employees</option>
                        <option>11-50 employees</option>
                        <option>51-200 employees</option>
                        <option>201-1000 employees</option>
                        <option>1000+ employees</option>
                      </select>
                    </div>
                <div>
                      <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.organization.industry')}</label>
                      <select className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none">
                        <option>Technology</option>
                        <option>Finance</option>
                        <option>Healthcare</option>
                        <option>Manufacturing</option>
                        <option>Retail</option>
                        <option>Other</option>
                  </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-8">
                    <button className="px-6 py-3 bg-niyama-white text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                      {t('common.cancel')}
                    </button>
                    <button className="px-6 py-3 bg-niyama-success text-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                      {t('common.save')}
                    </button>
                  </div>
                </div>
              </div>
            </AdminOnly>
          )}

          {activeSection === 'security' && (
            <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
              <div className="bg-niyama-accent border-b-4 border-niyama-black p-6">
                <h3 className="text-2xl font-bold text-niyama-black">{t('settings.security.title')}</h3>
                <p className="text-niyama-gray-700 mt-2">{t('settings.security.description')}</p>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-niyama-gray-100 border-2 border-niyama-black">
                    <div>
                      <h4 className="font-bold text-niyama-black">{t('settings.security.twoFactorAuth')}</h4>
                      <p className="text-sm text-niyama-gray-600">Enable 2FA for enhanced security</p>
                    </div>
                    <input type="checkbox" className="w-6 h-6 border-2 border-niyama-black" />
                  </div>
                <div>
                    <label className="block text-sm font-bold text-niyama-black mb-2">{t('settings.security.sessionTimeout')}</label>
                    <select className="w-full p-4 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>8 hours</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button className="px-6 py-3 bg-niyama-white text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                    {t('common.cancel')}
                  </button>
                  <button className="px-6 py-3 bg-niyama-accent text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
              <div className="bg-niyama-info border-b-4 border-niyama-black p-6">
                <h3 className="text-2xl font-bold text-niyama-black">{t('settings.notifications.title')}</h3>
                <p className="text-niyama-gray-700 mt-2">{t('settings.notifications.description')}</p>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-niyama-black">{t('settings.notifications.emailNotifications')}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-niyama-gray-100 border-2 border-niyama-black">
                      <span className="font-medium text-niyama-black">{t('settings.notifications.policyViolations')}</span>
                      <input type="checkbox" className="w-6 h-6 border-2 border-niyama-black" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-niyama-gray-100 border-2 border-niyama-black">
                      <span className="font-medium text-niyama-black">{t('settings.notifications.systemAlerts')}</span>
                      <input type="checkbox" className="w-6 h-6 border-2 border-niyama-black" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-niyama-gray-100 border-2 border-niyama-black">
                      <span className="font-medium text-niyama-black">{t('settings.notifications.weeklyReports')}</span>
                      <input type="checkbox" className="w-6 h-6 border-2 border-niyama-black" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button className="px-6 py-3 bg-niyama-white text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                    {t('common.cancel')}
                  </button>
                  <button className="px-6 py-3 bg-niyama-info text-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg">
              <div className="bg-niyama-warning border-b-4 border-niyama-black p-6">
                <h3 className="text-2xl font-bold text-niyama-black">{t('settings.integrations.title')}</h3>
                <p className="text-niyama-gray-700 mt-2">{t('settings.integrations.description')}</p>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-niyama-black">{t('settings.integrations.apiKeys')}</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-niyama-gray-100 border-2 border-niyama-black">
                      <div className="flex items-center space-x-3">
                        <Key className="w-5 h-5 text-niyama-black" />
                        <span className="font-medium text-niyama-black">OpenAI API</span>
                      </div>
                      <button className="px-4 py-2 bg-niyama-warning text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                        {t('settings.integrations.configure')}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-niyama-gray-100 border-2 border-niyama-black">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-niyama-black" />
                        <span className="font-medium text-niyama-black">Slack Integration</span>
                      </div>
                      <button className="px-4 py-2 bg-niyama-warning text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                        {t('settings.integrations.configure')}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button className="px-6 py-3 bg-niyama-white text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                    {t('common.cancel')}
                  </button>
                  <button className="px-6 py-3 bg-niyama-warning text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 font-bold">
                    {t('common.save')}
                  </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};