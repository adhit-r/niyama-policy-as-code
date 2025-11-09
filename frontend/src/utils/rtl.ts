// RTL (Right-to-Left) utility functions

export const isRTL = (language: string): boolean => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language);
};

export const getDirection = (language: string): 'ltr' | 'rtl' => {
  return isRTL(language) ? 'rtl' : 'ltr';
};

export const getTextAlign = (language: string): 'left' | 'right' => {
  return isRTL(language) ? 'right' : 'left';
};

export const getFlexDirection = (language: string): 'row' | 'row-reverse' => {
  return isRTL(language) ? 'row-reverse' : 'row';
};

export const getMarginDirection = (language: string): 'margin-left' | 'margin-right' => {
  return isRTL(language) ? 'margin-right' : 'margin-left';
};

export const getPaddingDirection = (language: string): 'padding-left' | 'padding-right' => {
  return isRTL(language) ? 'padding-right' : 'padding-left';
};

export const getBorderRadius = (language: string, baseRadius: string): string => {
  if (isRTL(language)) {
    // For RTL, we might want to adjust border radius
    return baseRadius;
  }
  return baseRadius;
};

// CSS class utilities for RTL
export const getRTLClasses = (language: string): string => {
  const classes = [];
  
  if (isRTL(language)) {
    classes.push('rtl');
    classes.push('text-right');
  } else {
    classes.push('ltr');
    classes.push('text-left');
  }
  
  return classes.join(' ');
};

// Direction-aware spacing utilities
export const getSpacingClasses = (language: string, direction: 'start' | 'end'): string => {
  if (isRTL(language)) {
    return direction === 'start' ? 'pr' : 'pl';
  } else {
    return direction === 'start' ? 'pl' : 'pr';
  }
};
