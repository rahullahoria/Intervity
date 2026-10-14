/**
 * Notion-Inspired Design System Color Tokens
 * Warm charcoal canvas, refined borders, crisp typography, and iconic Notion pastel accents
 */

export const colors = {
  // Notion Dark Surfaces & Canvas
  background: '#191919',           // Notion dark mode background (warm charcoal)
  surface: '#202020',              // Notion elevated surface (sidebar, headers, panels)
  cardBackground: '#252525',       // Notion card / callout / block background
  cardBorder: '#2E2E2E',           // Notion subtle border (1px solid, clean)
  elevatedBackground: '#2A2A2A',   // Notion dropdown, modal, popped surface
  surfaceHover: '#333333',         // Notion hover / active item highlight
  divider: '#2E2E2E',              // Notion divider line

  // Notion Typography
  textPrimary: '#FFFFFF',          // High-contrast clean white
  textSecondary: '#9B9B9B',        // Notion secondary body / muted text
  textTertiary: '#737373',         // Notion placeholder / subtle timestamp text
  textInverse: '#191919',          // For bright CTA button text

  // Notion Iconic Pastel Accent Colors
  notionBlue: '#2383E2',           // Notion primary link / interactive blue
  notionBlueLight: '#529CCA',      // Notion dark-theme blue accent
  notionBlueBg: 'rgba(35, 131, 226, 0.15)', // Notion blue tag background

  notionGreen: '#4E9D6D',          // Notion green (success, mastered, positive)
  notionGreenBg: 'rgba(78, 157, 109, 0.15)',

  notionYellow: '#DFAB01',         // Notion yellow / gold (stars, levels, warnings)
  notionYellowBg: 'rgba(223, 171, 1, 0.15)',

  notionOrange: '#D9730D',         // Notion orange (in-progress, learning XP)
  notionOrangeBg: 'rgba(217, 115, 13, 0.15)',

  notionPurple: '#9D68D3',         // Notion purple (system, staff, advanced)
  notionPurpleBg: 'rgba(157, 104, 211, 0.15)',

  notionPink: '#C14C8A',           // Notion pink
  notionPinkBg: 'rgba(193, 76, 138, 0.15)',

  notionRed: '#EB5757',            // Notion red (mistakes, danger, traps)
  notionRedBg: 'rgba(235, 87, 87, 0.15)',

  notionGray: '#787774',           // Notion neutral gray
  notionGrayBg: 'rgba(255, 255, 255, 0.08)',

  // Semantic & Interactive mappings
  accentPrimary: '#2383E2',        // Notion primary action blue
  accentHover: '#1B6EC2',
  accentSubtle: 'rgba(35, 131, 226, 0.15)',

  successGreen: '#4E9D6D',
  errorRed: '#EB5757',
  warningAmber: '#D9730D',

  // Dynamic Voice Orb & State Colors
  listeningCyan: '#529CCA',
  listeningGlow: 'rgba(82, 156, 202, 0.25)',

  speakingEmerald: '#4E9D6D',
  speakingGlow: 'rgba(78, 157, 109, 0.25)',

  thinkingViolet: '#9D68D3',
  thinkingGlow: 'rgba(157, 104, 211, 0.25)',

  interruptedAmber: '#D9730D',
  interruptedGlow: 'rgba(217, 115, 13, 0.25)',

  // Radar Analytics
  radarPolygonFill: 'rgba(35, 131, 226, 0.25)',
  radarPolygonStroke: '#529CCA',
  radarGrid: '#2E2E2E',
};
