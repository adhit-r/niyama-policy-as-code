import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import ErrorBoundary from './ui/ErrorBoundary';
import { Menu, X, ChevronLeft, ChevronRight, Bell, Search, User, Settings } from 'lucide-react';
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
    <div className={`h-screen bg-gradient-to-br from-niyama-gray-50 via-niyama-white to-niyama-gray-100 flex overflow-hidden ${className}`}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-niyama-black/60 backdrop-blur-sm z-40 lg:hidden"
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
        {/* Modern Top Navigation */}
        <header className="bg-niyama-white/95 backdrop-blur-xl border-b-4 border-niyama-black shadow-brutal-lg z-30 flex-shrink-0">
          <div className="flex items-center justify-between h-20 px-6">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-3 border-2 border-niyama-black bg-niyama-white shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-niyama-black" />
                ) : (
                  <Menu className="w-5 h-5 text-niyama-black" />
                )}
              </button>

              {/* Desktop Sidebar Toggle */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex items-center justify-center w-12 h-12 border-2 border-niyama-black bg-niyama-accent shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-niyama-black" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-niyama-black" />
                )}
              </button>

              {/* Brand/Title */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-niyama-black flex items-center justify-center shadow-brutal-lg flex-shrink-0">
                  <div className="w-8 h-8 bg-niyama-accent border-2 border-niyama-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-niyama-black"></div>
                  </div>
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col justify-center">
                    <h1 className="text-xl font-bold text-niyama-black tracking-tight leading-tight">
                      {t('layout.dashboardTitle')}
                    </h1>
                    <p className="text-xs text-niyama-gray-600 font-medium leading-tight">
                      Policy as Code Platform
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-niyama-gray-400" />
                <input
                  type="text"
                  placeholder="Search policies, templates, users..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-niyama-black bg-niyama-white shadow-brutal focus:shadow-brutal-lg transition-all duration-200 focus:outline-none rounded-none"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-3 border-2 border-niyama-black bg-niyama-white shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0">
                <Bell className="w-5 h-5 text-niyama-black" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-niyama-error text-niyama-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-niyama-black">
                  3
                </span>
              </button>

              {/* System Status */}
              <div className="hidden sm:flex items-center gap-2 bg-niyama-success/20 border-2 border-niyama-success px-4 py-2 shadow-brutal flex-shrink-0">
                <div className="w-2 h-2 bg-niyama-success rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-niyama-black">
                  {t('layout.online')}
                </span>
              </div>

              {/* Settings */}
              <button className="p-3 border-2 border-niyama-black bg-niyama-white shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0">
                <Settings className="w-5 h-5 text-niyama-black" />
              </button>

              {/* User Profile */}
              <button className="flex items-center gap-3 p-2 border-2 border-niyama-black bg-niyama-white shadow-brutal hover:shadow-brutal-lg transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0">
                <div className="w-10 h-10 bg-niyama-accent border-2 border-niyama-black flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-niyama-black" />
                </div>
                <div className="hidden lg:flex flex-col justify-center text-left">
                  <p className="text-sm font-bold text-niyama-black leading-tight">Admin User</p>
                  <p className="text-xs text-niyama-gray-600 leading-tight">admin@niyama.com</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content with Modern Layout */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-niyama-gray-100">
          <div className="p-6 space-y-6">
            {/* Dynamic Breadcrumb */}
            <Breadcrumb />

            {/* Content Container */}
            <div className="bg-niyama-white border-4 border-niyama-black shadow-brutal-lg rounded-2xl overflow-hidden">
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
