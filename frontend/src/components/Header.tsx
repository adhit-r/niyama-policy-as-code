import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { getInitials } from '../lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Search */}
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search policies, templates..."
                  className="input pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              type="button"
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-danger-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center space-x-3 p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getInitials(`${user?.firstName} ${user?.lastName}`)}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-charcoal-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-slate-200">
                      <p className="text-sm font-medium text-charcoal-800">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    
                    <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </button>
                    
                    <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                    
                    <div className="border-t border-slate-200">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

