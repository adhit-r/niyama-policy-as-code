import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { isRTL, getRTLClasses } from '../utils/rtl';
import { 
  BarChart3, 
  FileText, 
  Code, 
  Shield, 
  Settings, 
  Users,
  Activity,
  Zap,
  TrendingUp
} from 'lucide-react';

const navigationItems = [
  { nameKey: 'navigation.dashboard', href: '/', icon: BarChart3 },
  { nameKey: 'navigation.policies', href: '/policies', icon: Shield },
  { nameKey: 'navigation.templates', href: '/templates', icon: FileText },
  { nameKey: 'navigation.policyEditor', href: '/policies/new', icon: Code },
  { nameKey: 'navigation.monitoring', href: '/monitoring', icon: Activity },
  { nameKey: 'navigation.analytics', href: '/analytics', icon: TrendingUp },
  { nameKey: 'navigation.compliance', href: '/compliance', icon: Shield },
  { nameKey: 'navigation.userManagement', href: '/users', icon: Users, adminOnly: true },
  { nameKey: 'navigation.settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  
  const currentLanguage = i18n.language || 'en';
  const isRTLMode = isRTL(currentLanguage);

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <div className={`w-64 bg-niyama-white border-r-2 border-niyama-black min-h-screen flex flex-col ${isRTLMode ? 'rtl' : ''}`}>
      {/* Logo/Brand Section */}
      <div className="p-6 border-b-2 border-niyama-black">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-niyama-accent flex items-center justify-center shadow-brutal relative">
            <div className="w-8 h-8 bg-niyama-black flex items-center justify-center">
              <Shield className="w-5 h-5 text-niyama-accent" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-mono text-niyama-black tracking-tight bg-niyama-gray-100 px-2 py-1 border border-niyama-black">
              niyama
            </h1>
            <p className="text-xs text-niyama-gray-600 font-medium uppercase tracking-wider">
              Policy as Code
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.nameKey}
              onClick={() => navigate(item.href)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded font-medium text-sm transition-all duration-150
                ${isActive(item.href)
                  ? 'bg-niyama-accent text-niyama-black shadow-brutal'
                  : 'text-niyama-gray-700 hover:bg-niyama-gray-100 hover:text-niyama-black'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{t(item.nameKey)}</span>
            </button>
          );
        })}
      </nav>

      {/* Language Switcher */}
      <div className="p-4 border-t-2 border-niyama-black">
        <LanguageSwitcher />
      </div>

      {/* User Section */}
      <div className="p-4 border-t-2 border-niyama-black">
        <div className="flex items-center space-x-3 p-3 bg-niyama-gray-100 rounded">
          <div className="w-8 h-8 bg-niyama-accent flex items-center justify-center shadow-brutal">
            <Users className="w-4 h-4 text-niyama-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-niyama-black truncate">
              Admin User
            </p>
            <p className="text-xs text-niyama-gray-600 truncate">
              admin@niyama.dev
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};