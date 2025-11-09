import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Shield, Plus, BarChart3, Settings, Users, FileText } from 'lucide-react';
import { NiyamaLogo } from './components/ui/NiyamaLogo';

// Neo-Brutalist Layout following exact design system
const NeoLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50">
    {/* Neo-Brutal Header */}
    <header className="bg-white border-b-2 border-black shadow-brutal">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <NiyamaLogo size="md" variant="full" />
          
          <div className="flex items-center space-x-4">
            <button className="bg-white text-black border-2 border-black px-4 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
              <Settings className="w-4 h-4" />
            </button>
            <button className="bg-orange-500 text-white border-2 border-black px-6 py-3 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
              <Plus className="w-4 h-4 mr-2" />
              New Policy
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Neo-Brutal Navigation */}
    <nav className="bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-1">
          {[
            { name: 'Dashboard', icon: BarChart3, active: true },
            { name: 'Policies', icon: Shield, active: false },
            { name: 'Templates', icon: FileText, active: false },
            { name: 'Users', icon: Users, active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`flex items-center space-x-2 px-4 py-3 border-2 font-semibold transition-all duration-150 ${
                  item.active 
                    ? 'bg-orange-500 text-white border-black shadow-brutal' 
                    : 'text-black border-transparent hover:bg-gray-100 hover:border-black'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-6 py-8">
      {children}
    </main>
  </div>
);

// Neo-Brutal Dashboard with exact design system
const NeoDashboard = () => (
  <div className="space-y-8">
    {/* Hero Section */}
    <div className="bg-white border-2 border-black shadow-brutal p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-4xl text-black mb-2">Policy Dashboard</h2>
          <p className="text-gray-700">Monitor your security policies and compliance status</p>
        </div>
        <div className="w-20 h-20 bg-orange-500 border-2 border-black shadow-brutal flex items-center justify-center">
          <Shield className="w-10 h-10 text-white" />
        </div>
      </div>
    </div>

    {/* Stats Grid - Neo-Brutal Style */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { title: 'Compliance Score', value: '94%', color: 'bg-green-500', icon: Shield, trend: '+2%' },
        { title: 'Active Policies', value: '127', color: 'bg-orange-500', icon: FileText, trend: '+5' },
        { title: 'Violations', value: '3', color: 'bg-yellow-500', icon: BarChart3, trend: '-2' },
        { title: 'Users', value: '45', color: 'bg-gray-600', icon: Users, trend: '+8' },
      ].map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white border-2 border-black shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} border-2 border-black shadow-brutal flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-green-500">{stat.trend}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">{stat.title}</h3>
            <p className="font-display font-bold text-2xl text-black">{stat.value}</p>
          </div>
        );
      })}
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent Activity */}
      <div className="lg:col-span-2 bg-white border-2 border-black shadow-brutal">
        <div className="bg-gray-100 border-b-2 border-black p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-black">Recent Activity</h3>
            <button className="bg-orange-500 text-white border-2 border-black px-4 py-2 font-semibold shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 text-sm">
              View All
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[
            { action: 'Policy "Container Security" updated', time: '2 minutes ago', status: 'success' },
            { action: 'New violation detected in prod cluster', time: '15 minutes ago', status: 'warning' },
            { action: 'Compliance report generated', time: '1 hour ago', status: 'success' },
            { action: 'User "john@company.com" added', time: '2 hours ago', status: 'info' },
          ].map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 border-2 border-black hover:shadow-brutal transition-all duration-150">
              <div className={`w-3 h-3 border-2 border-black shadow-brutal mt-2 ${
                activity.status === 'success' ? 'bg-green-500' :
                activity.status === 'warning' ? 'bg-yellow-500' :
                'bg-orange-500'
              }`}></div>
              <div className="flex-1">
                <p className="font-semibold text-black">{activity.action}</p>
                <p className="text-sm text-gray-700">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="bg-white border-2 border-black shadow-brutal">
          <div className="bg-orange-500 border-b-2 border-black p-4">
            <h3 className="font-display font-bold text-xl text-white">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: 'Create Policy', color: 'bg-green-500', icon: Plus },
              { label: 'Run Compliance Scan', color: 'bg-yellow-500', icon: BarChart3 },
              { label: 'View Reports', color: 'bg-orange-500', icon: FileText },
              { label: 'Manage Users', color: 'bg-gray-600', icon: Users },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <button key={index} className={`w-full flex items-center space-x-3 p-3 ${action.color} text-white border-2 border-black shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 font-semibold`}>
                  <Icon className="w-5 h-5" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white border-2 border-black shadow-brutal">
          <div className="bg-gray-100 border-b-2 border-black p-4">
            <h3 className="font-display font-bold text-xl text-black">System Status</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { service: 'Policy Engine', status: 'Healthy', color: 'bg-green-500' },
              { service: 'Database', status: 'Healthy', color: 'bg-green-500' },
              { service: 'AI Service', status: 'Warning', color: 'bg-yellow-500' },
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black">
                <span className="font-semibold text-black">{service.service}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 ${service.color} border border-black shadow-brutal`}></div>
                  <span className="text-sm font-semibold text-gray-700">{service.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Neo-Brutal Sign In
const NeoSignIn = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="bg-white border-2 border-black shadow-brutal p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <NiyamaLogo size="lg" variant="icon" />
        </div>
        <h2 className="font-display font-bold text-2xl text-black mb-2">Welcome to Niyama</h2>
        <p className="text-gray-700">Policy as Code Platform</p>
      </div>
      
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="w-full py-4 bg-orange-500 text-white border-2 border-black shadow-brutal hover:shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 font-semibold text-lg"
      >
        Enter Dashboard
      </button>
      
      <div className="mt-6 p-4 bg-gray-100 border-2 border-black">
        <p className="text-sm text-gray-700 text-center">
          Enterprise authentication ready for integration
        </p>
      </div>
    </div>
  </div>
);

function App() {
  console.log('🎯 Neo-Brutalist Niyama App with new logo loading...');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<NeoSignIn />} />
        <Route
          path="/*"
          element={
            <NeoLayout>
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<NeoDashboard />} />
                <Route path="*" element={
                  <div className="bg-white border-2 border-black shadow-brutal p-8 text-center">
                    <h2 className="font-display font-bold text-2xl text-black mb-2">404 - Page Not Found</h2>
                    <p className="text-gray-700">The page you're looking for doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </NeoLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;