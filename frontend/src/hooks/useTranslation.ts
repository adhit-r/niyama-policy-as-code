import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = (namespace?: string) => {
  const { t, i18n } = useI18nTranslation(namespace);
  
  return {
    t,
    i18n,
    // Helper function for nested translations
    tNested: (key: string, options?: any) => t(key, options),
    // Helper function for pluralization
    tPlural: (key: string, count: number, options?: any) => t(key, { count, ...options }),
    // Helper function for interpolation
    tInterpolate: (key: string, values: Record<string, any>) => t(key, values),
  };
};
