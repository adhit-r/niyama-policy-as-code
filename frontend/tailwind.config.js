/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Canvas: White
        'white': '#FFFFFF',
        // Accent: Orange #FF6A00
        'accent': {
          DEFAULT: '#FF6A00',
          light: '#FFB366',
          dark: '#CC5500',
        },
        // Text: Deep Charcoal #0F1720
        'charcoal': '#0F1720',
        // Borders: Mid-gray #64748B
        'gray-medium': '#64748B',
        // Surfaces: Warm neutral #F8FAFC
        'neutral-warm': '#F8FAFC',
        // Error
        'error': {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626',
        },
        // Warning
        'warning': {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706',
        },
        // Success
        'success': {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#059669',
        },
        // Gray scale for surfaces
        'gray': {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Custom neo-brutalist variants
        'surface-bg': '#F8FAFC',
        'border': '#64748B',
      },
      fontFamily: {
        // Variable font for responsiveness
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'Monaco', 'monospace'],
        display: ['"Space Grotesk"', 'Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Modern scale
        'display': {
          DEFAULT: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
          sm: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
        },
        'heading': {
          1: ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
          2: ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
          3: ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        },
        body: {
          DEFAULT: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
          lg: ['1.125rem', { lineHeight: '1.75', fontWeight: '500' }],
        },
        caption: ['0.875rem', { lineHeight: '1.25', fontWeight: '400' }],
      },
      spacing: {
        // Token-based scale
        '3xs': '0.25rem',
        '2xs': '0.5rem',
        xs: '1rem',
        sm: '1.25rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      borderRadius: {
        // Neo-brutalist: minimal
        none: '0px',
        sm: '2px',
        base: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        // Neo-brutalist shadows
        'brutal': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        'brutal-lg': 'inset 0 4px 8px rgba(0, 0, 0, 0.15)',
        'elevate': '0 4px 0 rgba(0, 0, 0, 0.1)',
        'press': 'inset 0 2px 0 rgba(255, 255, 255, 0.1)',
      },
      animation: {
        // Micro-interactions
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0.0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)' },
          to: { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
