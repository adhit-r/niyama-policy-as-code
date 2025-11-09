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
  BarChart3,
  CheckSquare,
  Cloud,
  TrendingUp,
  Clock
} from 'lucide-react';

const navigationItems = [
  { nameKey: 'navigation.dashboard', href: '/', icon: Home, adminOnly: false },
  { nameKey: 'navigation.policies', href: '/policies', icon: Shield, adminOnly: false },
  { nameKey: 'navigation.templates', href: '/templates', icon: FileText, adminOnly: false },
  { nameKey: 'navigation.policyEditor', href: '/policies/new', icon: Code, adminOnly: false },
  { nameKey: 'navigation.validation', href: '/validation', icon: CheckSquare, adminOnly: false },
  { nameKey: 'navigation.inventory', href: '/inventory', icon: Cloud, adminOnly: false },
  { nameKey: 'navigation.drift', href: '/drift', icon: TrendingUp, adminOnly: false },
  { nameKey: 'navigation.scheduler', href: '/scheduler', icon: Clock, adminOnly: false },
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
      bg-white border-r-2 border-black h-full flex flex-col shadow-brutal overflow-hidden
      ${collapsed ? 'w-20' : 'w-72'}
      ${isRTLMode ? 'rtl' : ''}
    `}>
      {/* Logo/Brand Section */}
      <div className="p-4 border-b-2 border-black bg-orange-500 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white border-2 border-black shadow-brutal flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-orange-500" />
          </div>
          {!collapsed && (
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">
                Niyama
              </h1>
              <p className="text-xs text-white/80 tracking-wider uppercase font-medium">
                Policy as Code
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
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
                w-full flex items-center gap-3 px-3 py-3 font-bold text-sm transition-all duration-150 border-2 border-black
                ${active
                  ? 'bg-orange-500 text-white shadow-brutal-lg'
                  : 'bg-white text-black hover:bg-gray-100 hover:shadow-brutal'
                }
                ${collapsed ? 'justify-center px-2' : ''}
                hover:-translate-x-1 hover:-translate-y-1
              `}
              title={collapsed ? t(item.nameKey) : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{t(item.nameKey)}</span>}
            </button>
          );
        })}
      </nav>

      {/* Quick Actions - Only show when not collapsed */}
      {!collapsed && (
        <div className="p-3 border-t-2 border-black bg-gray-100 flex-shrink-0">
          <h3 className="text-sm font-bold text-black mb-2 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-2 p-2 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-lg transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1">
              <Zap className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium text-black">Create Policy</span>
            </button>
            <button className="w-full flex items-center gap-2 p-2 bg-white border-2 border-black shadow-brutal hover:shadow-brutal-lg transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1">
              <Database className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium text-black">Run Scan</span>
            </button>
          </div>
        </div>
      )}

      {/* Language Switcher - Only show when not collapsed */}
      {!collapsed && (
        <div className="p-3 border-t-2 border-black bg-gray-100 flex-shrink-0">
          <LanguageSwitcher />
        </div>
      )}

      {/* User Section */}
      <div className="p-3 border-t-2 border-black bg-gray-50 flex-shrink-0">
        <div className={`flex items-center gap-2 p-3 bg-white border-2 border-black shadow-brutal ${collapsed ? 'justify-center' : ''}`}>
          {user ? (
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 border-2 border-black shadow-brutal',
                  userButtonPopoverCard: 'bg-white border-2 border-black shadow-brutal-lg',
                  userButtonPopoverActionButton: 'hover:bg-gray-100',
                  userButtonPopoverFooter: 'border-t-2 border-black',
                }
              }}
              afterSignOutUrl="/sign-in"
            />
          ) : (
            <div className="w-8 h-8 bg-orange-500 border-2 border-black shadow-brutal flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-bold text-black truncate leading-tight">
                {user?.fullName || user?.firstName || 'Developer'}
              </p>
              <p className="text-xs text-gray-600 truncate leading-tight">
                {user?.primaryEmailAddress?.emailAddress || 'dev@niyama.local'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Close Button */}
      <div className="lg:hidden p-3 border-t-2 border-black bg-orange-500 flex-shrink-0">
        <button
          onClick={onMobileToggle}
          className="w-full flex items-center justify-center gap-2 p-3 bg-black text-white border-2 border-black shadow-brutal hover:shadow-brutal-lg transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1"
        >
          <X className="w-4 h-4" />
          <span className="font-bold">Close Menu</span>
        </button>
      </div>
    </div>
  );
};