/**
 * Studio Design System — Color Tokens
 * Inspired by Linear, Raycast & Vercel Geist Dark:
 * Deep obsidian carbon canvas, whisper-quiet hairline borders, high-contrast off-white typography,
 * and restrained, purposeful semantic accents.
 */

export const colors = {
  // Core Surfaces & Canvas (Zinc / Obsidian Dark Scale)
  background: '#09090B',           // Deep carbon canvas
  surface: '#101014',              // Elevated navigation bar, dock, and sheet surface
  cardBackground: '#141419',       // Primary card / block surface
  cardBorder: '#22222A',           // Crisp 1px structural hairline border
  borderSubtle: '#1A1A22',         // Subtle internal divider
  borderStrong: '#2E2E3A',         // Stronger interactive control border
  elevatedBackground: '#191920',   // Inset wells, modals, secondary containers
  surfaceHover: '#1E1E27',         // Interactive row / button surface
  divider: '#1D1D25',              // Hairline separator

  // Typography Hierarchy
  textPrimary: '#F4F4F6',          // Crisp, comfortable off-white
  textSecondary: '#9E9EA9',        // Balanced neutral slate-gray for body copy
  textTertiary: '#656572',         // Muted metadata, captions, and placeholders
  textInverse: '#09090B',          // Dark text on bright surfaces

  // Studio Accent Palette (Mapped to existing keys for full compatibility)
  notionBlue: '#4F6EF7',           // Primary interactive Cobalt-Indigo
  notionBlueLight: '#7B93FF',      // Soft luminous indigo-blue for text & icons on dark
  notionBlueBg: 'rgba(79, 110, 247, 0.12)',

  notionGreen: '#10B981',          // Semantic Emerald (verified, mastered, optimal)
  notionGreenBg: 'rgba(16, 185, 129, 0.11)',

  notionYellow: '#F59E0B',         // Warm Amber-Gold (levels, highlights)
  notionYellowBg: 'rgba(245, 158, 11, 0.11)',

  notionOrange: '#F97316',         // Signal Orange (reinforcement, focus areas)
  notionOrangeBg: 'rgba(249, 115, 22, 0.11)',

  notionPurple: '#8B5CF6',         // Architectural Violet (staff/principal tier)
  notionPurpleBg: 'rgba(139, 92, 246, 0.12)',

  notionPink: '#EC4899',           // Accent Rose
  notionPinkBg: 'rgba(236, 72, 153, 0.11)',

  notionRed: '#F43F5E',            // Crimson Rose (traps, critical gaps, errors)
  notionRedBg: 'rgba(244, 63, 94, 0.11)',

  notionGray: '#71717A',           // Neutral Zinc
  notionGrayBg: 'rgba(255, 255, 255, 0.06)',

  // Semantic & Interactive Mappings
  accentPrimary: '#4F6EF7',
  accentHover: '#3E5BE0',
  accentSubtle: 'rgba(79, 110, 247, 0.12)',

  successGreen: '#10B981',
  errorRed: '#F43F5E',
  warningAmber: '#F59E0B',

  // Dynamic Voice Orb & Conversational State Tokens
  listeningCyan: '#7B93FF',
  listeningGlow: 'rgba(123, 147, 255, 0.22)',

  speakingEmerald: '#10B981',
  speakingGlow: 'rgba(16, 185, 129, 0.22)',

  thinkingViolet: '#8B5CF6',
  thinkingGlow: 'rgba(139, 92, 246, 0.22)',

  interruptedAmber: '#F59E0B',
  interruptedGlow: 'rgba(245, 158, 11, 0.22)',

  // Radar & Competency Analytics
  radarPolygonFill: 'rgba(79, 110, 247, 0.22)',
  radarPolygonStroke: '#7B93FF',
  radarGrid: '#23232C',
};
