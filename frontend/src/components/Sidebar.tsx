import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { isRTL } from '../utils/rtl';
import { 
  FileText, 
  Code, 
  Shield, 
  Settings, 
  Activity,
  X,
  Home,
  Database,
  Zap,
  BarChart3
} from 'lucide-react';

const navigationItems = [
  { nameKey: 'navigation.dashboard', href: '/', icon: Home, adminOnly: false },
  { nameKey: 'navigation.policies', href: '/policies', icon: Shield, adminOnly: false },
  { nameKey: 'navigation.templates', href: '/templates', icon: FileText, adminOnly: false },
  { nameKey: 'navigation.policyEditor', href: '/policies/new', icon: Code, adminOnly: false },
  { nameKey: 'navigation.monitoring', href: '/monitoring', icon: Activity, adminOnly: false },
  { nameKey: 'navigation.analytics', href: '/analytics', icon: BarChart3, adminOnly: false },
  { nameKey: 'navigation.compliance', href: '/compliance', icon: Shield, adminOnly: false },
  { nameKey: 'navigation.settings', href: '/settings', icon: Settings, adminOnly: false },
];

interface SidebarProps {
  collapsed: boolean;
  onMobileToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onMobileToggle 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
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
    if (item.adminOnly && !user?.publicMetadata?.isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <div className={`
      bg-niyama-white border-r-4 border-niyama-black h-full flex flex-col shadow-brutal-lg overflow-hidden
      ${collapsed ? 'w-20' : 'w-72'}
      ${isRTLMode ? 'rtl' : ''}
    `}>
      {/* Logo/Brand Section */}
      <div className="p-6 border-b-4 border-niyama-black bg-gradient-to-r from-niyama-accent/20 to-niyama-accent/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-niyama-black flex items-center justify-center shadow-brutal-lg flex-shrink-0">
            <div className="w-10 h-10 bg-niyama-accent border-2 border-niyama-white flex items-center justify-center">
              <Shield className="w-6 h-6 text-niyama-black" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col justify-center gap-1">
              <h1 className="text-2xl font-bold text-niyama-black tracking-tight bg-niyama-white px-4 py-2 border-2 border-niyama-black shadow-brutal leading-none">
                NIYAMA
              </h1>
              <p className="text-xs text-niyama-gray-600 font-bold uppercase tracking-wider">
                Policy as Code
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {filteredNavigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <button
              key={item.nameKey}
              onClick={() => {
                navigate(item.href);
                onMobileToggle(); // Close mobile menu after navigation
              }}
              className={`
                w-full flex items-center gap-4 px-4 py-3 font-bold text-sm transition-all duration-200 border-2 border-niyama-black
                ${active
                  ? 'bg-niyama-accent text-niyama-black shadow-brutal-lg'
                  : 'bg-niyama-white text-niyama-gray-700 hover:bg-niyama-gray-100 hover:text-niyama-black hover:shadow-brutal'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
              title={collapsed ? t(item.nameKey) : ''}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              {!collapsed && <span className="truncate">{t(item.nameKey)}</span>}
            </button>
          );
        })}
      </nav>

      {/* Quick Actions - Only show when not collapsed */}
      {!collapsed && (
        <div className="p-4 border-t-4 border-niyama-black bg-niyama-gray-100 flex-shrink-0">
          <h3 className="text-sm font-bold text-niyama-black mb-3 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 bg-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200">
              <Zap className="w-4 h-4 text-niyama-accent flex-shrink-0" />
              <span className="text-sm font-medium text-niyama-black">Create Policy</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200">
              <Database className="w-4 h-4 text-niyama-info flex-shrink-0" />
              <span className="text-sm font-medium text-niyama-black">Run Scan</span>
            </button>
          </div>
        </div>
      )}

      {/* Language Switcher - Only show when not collapsed */}
      {!collapsed && (
        <div className="p-4 border-t-4 border-niyama-black bg-niyama-gray-100 flex-shrink-0">
          <LanguageSwitcher />
        </div>
      )}

      {/* User Section */}
      <div className="p-4 border-t-4 border-niyama-black bg-gradient-to-r from-niyama-gray-100 to-niyama-gray-50 flex-shrink-0">
        <div className={`flex items-center gap-3 p-4 bg-niyama-white border-2 border-niyama-black shadow-brutal ${collapsed ? 'justify-center' : ''}`}>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10 border-2 border-niyama-black shadow-brutal',
                userButtonPopoverCard: 'bg-niyama-white border-2 border-niyama-black shadow-brutal-lg',
                userButtonPopoverActionButton: 'hover:bg-niyama-gray-100',
                userButtonPopoverFooter: 'border-t-2 border-niyama-black',
              }
            }}
            afterSignOutUrl="/sign-in"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-bold text-niyama-black truncate leading-tight">
                {user?.fullName || user?.firstName || 'User'}
              </p>
              <p className="text-xs text-niyama-gray-600 truncate leading-tight">
                {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Close Button */}
      <div className="lg:hidden p-4 border-t-4 border-niyama-black bg-niyama-accent flex-shrink-0">
        <button
          onClick={onMobileToggle}
          className="w-full flex items-center justify-center gap-2 p-4 bg-niyama-black text-niyama-white border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 active:scale-95"
        >
          <X className="w-5 h-5" />
          <span className="font-bold">Close Menu</span>
        </button>
      </div>
    </div>
  );
};