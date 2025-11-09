import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import ErrorBoundary from './ui/ErrorBoundary';
import { Menu, X, ChevronLeft, ChevronRight, Bell, Search, User, Settings, Shield } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className={`h-screen bg-gray-50 flex overflow-hidden ${className}`}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-50 lg:z-auto h-screen
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-all duration-300 ease-in-out
      `}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onMobileToggle={toggleMobileMenu}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Neo-Brutalist Top Navigation */}
        <header className="bg-white border-b-2 border-black shadow-brutal z-30 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 border-2 border-black bg-white shadow-brutal hover:shadow-brutal-lg transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-black" />
                ) : (
                  <Menu className="w-5 h-5 text-black" />
                )}
              </button>

              {/* Desktop Sidebar Toggle */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center w-10 h-10 border-2 border-black bg-orange-500 text-white shadow-brutal hover:shadow-brutal-lg transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>

              {/* Brand/Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 border-2 border-black shadow-brutal flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col justify-center">
                    <h1 className="text-lg font-bold text-black tracking-tight leading-tight">
                      Niyama
                    </h1>
                    <p className="text-xs text-gray-600 font-medium leading-tight">
                      Policy as Code
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search policies, templates..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-black bg-white shadow-brutal focus:shadow-brutal-lg transition-all duration-150 focus:outline-none"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 border-2 border-black bg-white shadow-brutal hover:shadow-brutal-lg transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 flex-shrink-0">
                <Bell className="w-5 h-5 text-black" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold flex items-center justify-center border border-black">
                  3
                </span>
              </button>

              {/* System Status */}
              <div className="hidden sm:flex items-center gap-2 bg-green-100 border-2 border-green-500 px-3 py-1 shadow-brutal flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 border border-black"></div>
                <span className="text-sm font-bold text-black">
                  Online
                </span>
              </div>

              {/* Settings */}
              <button className="p-2 border-2 border-black bg-white shadow-brutal hover:shadow-brutal-lg transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 flex-shrink-0">
                <Settings className="w-5 h-5 text-black" />
              </button>

              {/* User Profile */}
              <button className="flex items-center gap-2 p-2 border-2 border-black bg-white shadow-brutal hover:shadow-brutal-lg transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 border-2 border-black flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden lg:flex flex-col justify-center text-left">
                  <p className="text-sm font-bold text-black leading-tight">Admin</p>
                  <p className="text-xs text-gray-600 leading-tight">admin@niyama.com</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content with Neo-Brutalist Layout */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          <div className="p-6">
            {/* Dynamic Breadcrumb */}
            <Breadcrumb />

            {/* Content Container */}
            <div className="bg-white border-2 border-black shadow-brutal">
              <div className="p-6">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
