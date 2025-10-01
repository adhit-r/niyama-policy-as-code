/**
 * Niyama Design System Types
 * TypeScript definitions for the New Brutalist Professional Design System
 */

export interface DesignSystem {
  name: string;
  version: string;
  description: string;
  colors: ColorSystem;
  typography: TypographySystem;
  spacing: SpacingSystem;
  borderRadius: BorderRadiusSystem;
  shadows: ShadowSystem;
  transitions: TransitionSystem;
  zIndex: ZIndexSystem;
  components: ComponentSystem;
  breakpoints: BreakpointSystem;
  animations: AnimationSystem;
}

export interface ColorSystem {
  primary: {
    black: ColorToken;
    white: ColorToken;
  };
  accent: {
    orange: ColorToken;
    orangeDark: ColorToken;
    orangeLight: ColorToken;
  };
  gray: {
    [key: string]: ColorToken;
  };
  semantic: {
    success: ColorToken;
    successLight: ColorToken;
    successDark: ColorToken;
    warning: ColorToken;
    warningLight: ColorToken;
    warningDark: ColorToken;
    error: ColorToken;
    errorLight: ColorToken;
    errorDark: ColorToken;
    info: ColorToken;
    purple: ColorToken;
    purpleLight: ColorToken;
    purpleDark: ColorToken;
  };
}

export interface ColorToken {
  value: string;
  description: string;
  usage: string;
}

export interface TypographySystem {
  fontFamilies: {
    primary: FontToken;
    display: FontToken;
    mono: FontToken;
  };
  fontWeights: {
    [key: string]: FontWeightToken;
  };
  fontSizes: {
    [key: string]: FontSizeToken;
  };
  lineHeights: {
    [key: string]: LineHeightToken;
  };
  letterSpacing: {
    [key: string]: LetterSpacingToken;
  };
}

export interface FontToken {
  value: string;
  description: string;
  usage: string;
}

export interface FontWeightToken {
  value: string;
  description: string;
}

export interface FontSizeToken {
  value: string;
  pixels: string;
  description: string;
  usage: string;
}

export interface LineHeightToken {
  value: string;
  description: string;
}

export interface LetterSpacingToken {
  value: string;
  description: string;
}

export interface SpacingSystem {
  scale: string;
  baseUnit: string;
  values: {
    [key: string]: SpacingToken;
  };
}

export interface SpacingToken {
  value: string;
  pixels: string;
  description: string;
}

export interface BorderRadiusSystem {
  philosophy: string;
  values: {
    [key: string]: BorderRadiusToken;
  };
}

export interface BorderRadiusToken {
  value: string;
  pixels?: string;
  description: string;
}

export interface ShadowSystem {
  philosophy: string;
  values: {
    [key: string]: ShadowToken;
  };
}

export interface ShadowToken {
  value: string;
  description: string;
}

export interface TransitionSystem {
  durations: {
    [key: string]: TransitionToken;
  };
  easings: {
    [key: string]: EasingToken;
  };
}

export interface TransitionToken {
  value: string;
  description: string;
}

export interface EasingToken {
  value: string;
  description: string;
}

export interface ZIndexSystem {
  scale: string;
  values: {
    [key: string]: ZIndexToken;
  };
}

export interface ZIndexToken {
  value: string;
  description: string;
}

export interface ComponentSystem {
  button: ButtonSystem;
  card: CardSystem;
  input: InputSystem;
  navigation: NavigationSystem;
}

export interface ButtonSystem {
  variants: {
    [key: string]: ButtonVariant;
  };
  sizes: {
    [key: string]: ButtonSize;
  };
}

export interface ButtonVariant {
  background: string;
  color: string;
  border: string;
  shadow: string;
  hover: {
    [key: string]: string;
  };
}

export interface ButtonSize {
  padding: string;
  fontSize: string;
}

export interface CardSystem {
  background: string;
  border: string;
  borderRadius: string;
  shadow: string;
  hover: {
    [key: string]: string;
  };
  header: {
    [key: string]: string;
  };
  content: {
    [key: string]: string;
  };
  footer: {
    [key: string]: string;
  };
}

export interface InputSystem {
  background: string;
  border: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  focus: {
    [key: string]: string;
  };
}

export interface NavigationSystem {
  background: string;
  borderBottom: string;
  padding: string;
  brand: {
    [key: string]: string;
  };
  link: {
    [key: string]: string | object;
  };
}

export interface BreakpointSystem {
  [key: string]: BreakpointToken;
}

export interface BreakpointToken {
  value: string;
  description: string;
}

export interface AnimationSystem {
  [key: string]: AnimationToken;
}

export interface AnimationToken {
  keyframes: {
    [key: string]: string;
  };
  duration: string;
  easing: string;
}

// Utility types for component props
export type ButtonVariantType = 'primary' | 'secondary' | 'accent';
export type ButtonSizeType = 'sm' | 'md' | 'lg' | 'xl';
export type ColorType = 'black' | 'white' | 'orange' | 'gray' | 'success' | 'warning' | 'error' | 'info' | 'purple';
export type SpacingType = '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24' | '32';
export type FontSizeType = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
export type FontWeightType = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
export type BorderRadiusType = 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl';
export type ShadowType = 'sm' | 'base' | 'md' | 'lg' | 'brutal' | 'brutalLg' | 'brutalSm';

// Component prop interfaces
export interface ButtonProps {
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface NavigationProps {
  brand: string;
  links: NavigationLink[];
  className?: string;
}

export interface NavigationLink {
  label: string;
  href: string;
  active?: boolean;
}

// Design token constants
export const DESIGN_TOKENS = {
  colors: {
    primary: {
      black: '#000000',
      white: '#ffffff',
    },
    accent: {
      orange: '#ff6b35',
      orangeDark: '#e55a2b',
      orangeLight: '#ff8c69',
    },
    gray: {
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    semantic: {
      success: '#ff6b35',
      successLight: '#dcfce7',
      successDark: '#16a34a',
      warning: '#f59e0b',
      warningLight: '#fef3c7',
      warningDark: '#d97706',
      error: '#ef4444',
      errorLight: '#fee2e2',
      errorDark: '#dc2626',
      info: '#ff6b35',
      purple: '#8b5cf6',
      purpleLight: '#ede9fe',
      purpleDark: '#7c3aed',
    },
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    brutal: '4px 4px 0px 0px #000000',
    brutalLg: '8px 8px 0px 0px #000000',
    brutalSm: '2px 2px 0px 0px #000000',
  },
  typography: {
    fontFamilies: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'Space Grotesk, Inter, sans-serif',
      mono: 'JetBrains Mono, "Fira Code", "Monaco", monospace',
    },
    fontWeights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
    },
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
} as const;

// Utility functions
export const getColor = (colorPath: string): string => {
  const keys = colorPath.split('.');
  let value: any = DESIGN_TOKENS.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color not found: ${colorPath}`);
      return '#000000';
    }
  }
  
  return value;
};

export const getSpacing = (size: SpacingType): string => {
  return DESIGN_TOKENS.spacing[size];
};

export const getFontSize = (size: FontSizeType): string => {
  return DESIGN_TOKENS.typography.fontSizes[size];
};

export const getShadow = (shadow: ShadowType): string => {
  return DESIGN_TOKENS.shadows[shadow];
};

export const getBorderRadius = (radius: BorderRadiusType): string => {
  return DESIGN_TOKENS.borderRadius[radius];
};

export const getBreakpoint = (breakpoint: keyof typeof DESIGN_TOKENS.breakpoints): string => {
  return DESIGN_TOKENS.breakpoints[breakpoint];
};

export const getZIndex = (layer: keyof typeof DESIGN_TOKENS.zIndex): number => {
  return DESIGN_TOKENS.zIndex[layer];
};
