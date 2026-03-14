export const Colors = {
  primary: '#D4002A',
  primaryDark: '#8B0000',
  primaryLight: 'rgba(212, 0, 42, 0.08)',
  white: '#FFFFFF',
  background: '#F2F2F7',
  backgroundGradientStart: '#F2F2F7',
  backgroundGradientEnd: '#E8E8ED',
  textPrimary: '#1C1C1E',
  textSecondary: '#6B6B6D',
  textAccent: '#D4002A',
  cardBackground: '#FFFFFF',
  tabBarInactive: '#8E8E93',
  tabBarActive: '#D4002A',
  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassTint: '#F7F7F7',
  tram: '#E2001A',
  bus: '#0068B4',
  metro: '#0052A5',
  delay: '#E74C3C',
  onTime: '#27AE60',
};

export type ThemeColors = typeof Colors;

export const DarkColors: ThemeColors = {
  primary: '#FF3B54',
  primaryDark: '#CC2233',
  primaryLight: 'rgba(255, 59, 84, 0.15)',
  white: '#1C1C1E',
  background: '#000000',
  backgroundGradientStart: '#000000',
  backgroundGradientEnd: '#1C1C1E',
  textPrimary: '#F2F2F7',
  textSecondary: '#8E8E93',
  textAccent: '#FF3B54',
  cardBackground: '#1C1C1E',
  tabBarInactive: '#636366',
  tabBarActive: '#FF3B54',
  glassBg: 'rgba(28, 28, 30, 0.72)',
  glassTint: '#2C2C2E',
  tram: '#FF4D4F',
  bus: '#4DA6FF',
  metro: '#5B8DEF',
  delay: '#FF6B6B',
  onTime: '#4CD964',
};

export const Fonts = {
  light: 'DMSans_300Light',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semiBold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
};

export const Spacing = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 24,
  xxxl: 40,
};

export const BorderRadius = {
  sm: 12,
  md: 24,
  lg: 26,
  xl: 40,
  pill: 296,
};
