/**
 * Pryysm Design System - Inline Styles Configuration
 * Used for public pages (landing, login, signup) and reusable components
 */

export const colors = {
  // Primary Colors
  primary: '#004B8D', // Navy Blue
  accent: '#E6A635', // Gold
  
  // Text Colors
  textDark: '#111827', // Dark text
  textGray: '#4B5563', // Body text
  textMuted: '#6B7280', // Secondary text
  
  // Background Colors
  bgLight: '#F9FAFB', // Light background
  bgLighter: '#F3F4F6', // Lighter background
  bgWhite: 'white',
  
  // Border Colors
  borderLight: '#E5E7EB',
  borderLighter: '#D1D5DB',
  
  // Status Colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;

export const typography = {
  fontFamily: 'Roboto, system-ui, -apple-system, sans-serif',
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
} as const;

export const borderRadius = {
  none: '0px',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 1px 3px rgba(0,0,0,0.1)',
  lg: '0 4px 6px rgba(0,0,0,0.1)',
  xl: '0 10px 15px rgba(0,0,0,0.1)',
} as const;

/**
 * Pre-built style objects for common components
 */
export const styles = {
  // Buttons
  buttonPrimary: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.bgWhite,
    backgroundColor: colors.primary,
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    transition: 'all 0.2s ease',
    fontFamily: typography.fontFamily,
  } as const,

  buttonSecondary: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    backgroundColor: colors.bgWhite,
    border: `1px solid ${colors.primary}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    transition: 'all 0.2s ease',
    fontFamily: typography.fontFamily,
  } as const,

  // Form Inputs
  input: {
    padding: `${spacing.sm} ${spacing.sm}`,
    fontSize: typography.sizes.sm,
    border: `1px solid ${colors.borderLighter}`,
    borderRadius: borderRadius.md,
    fontFamily: typography.fontFamily,
    backgroundColor: colors.bgWhite,
    color: colors.textDark,
  } as const,

  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textDark,
    fontFamily: typography.fontFamily,
  } as const,

  // Card
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.xl,
    border: `1px solid ${colors.borderLight}`,
    boxShadow: shadows.md,
    padding: spacing.xl,
  } as const,

  // Links
  linkPrimary: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    textDecoration: 'none',
    fontFamily: typography.fontFamily,
    cursor: 'pointer',
  } as const,

  // Containers
  containerMax: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: `0 ${spacing.lg}`,
  } as const,

  section: {
    width: '100%',
    padding: `${spacing.xl} 0`,
  } as const,

  // Headings
  heading1: {
    fontSize: 'clamp(2.5rem, 9vw, 4rem)',
    fontWeight: typography.weights.extrabold,
    color: colors.textDark,
    fontFamily: typography.fontFamily,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  } as const,

  heading2: {
    fontSize: 'clamp(1.875rem, 6vw, 2.25rem)',
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    fontFamily: typography.fontFamily,
    lineHeight: 1.2,
  } as const,

  heading3: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textDark,
    fontFamily: typography.fontFamily,
    lineHeight: 1.3,
  } as const,

  // Body text
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.textGray,
    fontFamily: typography.fontFamily,
    lineHeight: 1.6,
  } as const,

  bodySmall: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.textGray,
    fontFamily: typography.fontFamily,
    lineHeight: 1.5,
  } as const,
} as const;

/**
 * Helper function to merge style objects
 */
export const mergeStyles = (...styleObjects: any[]): Record<string, any> => {
  return Object.assign({}, ...styleObjects);
};

/**
 * Helper function to create button variants
 */
export const createButtonStyle = (variant: 'primary' | 'secondary' | 'disabled' = 'primary', isDisabled = false) => {
  if (isDisabled) {
    return mergeStyles(styles.buttonPrimary, {
      backgroundColor: colors.textMuted,
      cursor: 'not-allowed',
      opacity: 0.6,
    });
  }
  return variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
};
