/**
 * Studio Typography System
 * Precision optical tracking, comfortable reading line-heights, and tabular numerals.
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  h2: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 23,
  },
  h3: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: colors.textTertiary,
    letterSpacing: 0.1,
    lineHeight: 17,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  monoMetric: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
});
