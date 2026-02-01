// ============================================
// BRAND CONSTANTS
// ============================================

export const BRAND = {
  // Company
  name: 'ProjeXtPal',
  tagline: 'Project Management Made Simple',
  academy: 'ProjeXtPal Academy',
  company: 'Inclufy',
  website: 'https://inclufy.com',
  support: 'support@inclufy.com',
  
  // Primary Colors
  purple: '#8B5CF6',
  pink: '#EC4899',
  pinkLight: '#F472B6',
  green: '#10B981',
  
  // Secondary Colors
  blue: '#3B82F6',
  amber: '#F59E0B',
  orange: '#F97316',
  cyan: '#06B6D4',
  emerald: '#059669',
  red: '#EF4444',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
  gradientSuccess: 'linear-gradient(135deg, #10B981, #059669)',
  gradientWarning: 'linear-gradient(135deg, #F59E0B, #F97316)',
  gradientInfo: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
} as const;

export type BrandColor = typeof BRAND[keyof typeof BRAND];

export default BRAND;