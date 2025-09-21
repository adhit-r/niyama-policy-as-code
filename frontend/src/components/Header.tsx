import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  Settings, 
  BarChart3, 
  User,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Policies', href: '/policies', icon: Shield },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Monitoring', href: '/monitoring', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className={`bg-niyama-white border-b-2 border-niyama-black ${className}`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 bg-niyama-black flex items-center justify-center shadow-brutal group-hover:shadow-brutal-lg transition-all duration-150">
                <Shield className="w-6 h-6 text-niyama-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-mono text-niyama-black tracking-tight bg-niyama-gray-100 px-2 py-1 border border-niyama-black">
                  niyama
                </h1>
                <p className="text-xs text-niyama-gray-600 font-medium uppercase tracking-wider">
                  Policy as Code
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded font-medium text-sm transition-all duration-150
                    ${isActive(item.href)
                      ? 'bg-niyama-black text-niyama-white shadow-brutal'
                      : 'text-niyama-gray-700 hover:bg-niyama-gray-100 hover:text-niyama-black'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-niyama-accent text-niyama-white rounded font-semibold text-sm shadow-brutal hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150">
              <User className="w-4 h-4" />
              <span>Admin</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded border-2 border-niyama-black bg-niyama-white shadow-brutal hover:shadow-brutal-lg transition-all duration-150"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-niyama-black" />
              ) : (
                <Menu className="w-5 h-5 text-niyama-black" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-2 border-niyama-black bg-niyama-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      flex items-center space-x-3 w-full px-4 py-3 rounded font-medium text-sm transition-all duration-150
                      ${isActive(item.href)
                        ? 'bg-niyama-black text-niyama-white shadow-brutal'
                        : 'text-niyama-gray-700 hover:bg-niyama-white hover:text-niyama-black'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
              <div className="pt-4 border-t-2 border-niyama-black">
                <button className="flex items-center space-x-3 w-full px-4 py-3 bg-niyama-accent text-niyama-white rounded font-semibold text-sm shadow-brutal">
                  <User className="w-5 h-5" />
                  <span>Admin User</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};