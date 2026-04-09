// ShrinQE Design System
export const Colors = {
  // Primary palette
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  
  // Accent
  accent: '#3B82F6',
  accentLight: '#60A5FA',
  accentDark: '#2563EB',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#7C3AED', '#3B82F6'],
  gradientDark: ['#0F0D15', '#1A1625', '#0F0D15'],
  gradientCard: ['rgba(124, 58, 237, 0.1)', 'rgba(59, 130, 246, 0.05)'],
  gradientHero: ['#1a0533', '#0F0D15', '#0a1628'],
  gradientButton: ['#7C3AED', '#6D28D9', '#5B21B6'],
  gradientAccent: ['#3B82F6', '#7C3AED'],

  // Backgrounds
  bgPrimary: '#0F0D15',
  bgSecondary: '#1A1625',
  bgTertiary: '#231E30',
  bgCard: '#1E1A2E',
  bgCardHover: '#252038',
  bgInput: '#1A1625',
  bgOverlay: 'rgba(15, 13, 21, 0.85)',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textAccent: '#A78BFA',

  // Borders
  border: 'rgba(124, 58, 237, 0.2)',
  borderLight: 'rgba(148, 163, 184, 0.1)',
  borderFocus: '#7C3AED',

  // Status
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.1)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  error: '#EF4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.1)',

  // Glass
  glass: 'rgba(30, 26, 46, 0.6)',
  glassBorder: 'rgba(124, 58, 237, 0.15)',

  // Social
  google: '#EA4335',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  hero: 48,
  display: 56,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};
