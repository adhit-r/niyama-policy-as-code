import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbMap: Record<string, string> = {
      '': t('navigation.dashboard'),
      'policies': t('navigation.policies'),
      'templates': t('navigation.templates'),
      'compliance': t('navigation.compliance'),
      'monitoring': t('navigation.monitoring'),
      'analytics': t('navigation.analytics'),
      'settings': t('navigation.settings'),
      'users': t('navigation.userManagement'),
    };

    const items: Array<{ label: string; href: string; icon?: typeof Home; isCurrent?: boolean }> = [
      { label: t('navigation.dashboard'), href: '/', icon: Home }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      if (index === segments.length - 1) {
        // Last segment - current page
        items.push({ label, href: currentPath, isCurrent: true });
      } else {
        items.push({ label, href: currentPath, isCurrent: false });
      }
    });

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-niyama-gray-400" />
          )}
          <div className="flex items-center space-x-1">
            {index === 0 && <Home className="w-4 h-4 text-niyama-gray-600" />}
            <span className={`font-medium ${
              item.isCurrent 
                ? 'text-niyama-black' 
                : 'text-niyama-gray-600 hover:text-niyama-black cursor-pointer'
            }`}>
              {item.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};
