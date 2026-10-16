/**
 * Mistake Card Component
 * Displays post-interview gap analysis, reference L5 response, and targeted practice launcher
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MistakeDiagnostic } from '../types';
import { colors } from '../theme/colors';
import { BulbIcon, CheckIcon, BoltIcon, ChevronRightIcon } from './icons/AppIcons';

interface MistakeCardProps {
  mistake: MistakeDiagnostic;
  onLaunchDrill?: (mistake: MistakeDiagnostic) => void;
}

export const MistakeCard: React.FC<MistakeCardProps> = ({ mistake, onLaunchDrill }) => {
  const [expanded, setExpanded] = useState(false);

  const categoryColor =
    mistake.mistakeCategory === 'CONCEPTUAL'
      ? colors.errorRed
      : mistake.mistakeCategory === 'L4_CEILING'
      ? colors.interruptedAmber
      : colors.thinkingViolet;

  const categoryBg =
    mistake.mistakeCategory === 'CONCEPTUAL'
      ? colors.notionRedBg
      : mistake.mistakeCategory === 'L4_CEILING'
      ? colors.notionYellowBg
      : colors.notionPurpleBg;

  const formattedCategory = mistake.mistakeCategory
    .replace('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: categoryBg }]}>
          <View style={[styles.badgeDot, { backgroundColor: categoryColor }]} />
          <Text style={[styles.badgeText, { color: categoryColor }]}>
            {formattedCategory}
          </Text>
        </View>
        <Text style={styles.turnText}>Turn {mistake.turnIndex + 1}</Text>
      </View>

      <View style={styles.quoteBlock}>
        <Text style={styles.candidateQuote} numberOfLines={2}>
          "{mistake.candidateQuote}"
        </Text>
      </View>

      <Text style={styles.critiqueText}>
        {mistake.critique}
      </Text>

      {expanded ? (
        <View style={styles.expandedSection}>
          <Text style={styles.sectionHeader}>Missing Senior (L5) Depth</Text>
          {mistake.missingSeniorConcepts.map((concept, idx) => (
            <View key={idx} style={styles.conceptRow}>
              <View style={styles.conceptBullet} />
              <Text style={styles.conceptItem}>{concept}</Text>
            </View>
          ))}

          <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Reference L5+ Response</Text>
          <View style={styles.goldenResponseBox}>
            <Text style={styles.goldenResponseText}>
              {mistake.goldenResponse}
            </Text>
          </View>

          <View style={styles.mentalModelRow}>
            <BulbIcon size={15} color={colors.interruptedAmber} style={{ marginTop: 1 }} />
            <Text style={styles.mentalModelText}>
              {mistake.coachingMentalModel}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.expandButtonText}>
            {expanded ? 'Hide Reference Answer' : 'View L5 Reference'}
          </Text>
          <ChevronRightIcon
            size={14}
            color={colors.notionBlueLight}
            style={expanded ? { transform: [{ rotate: '-90deg' }] } : undefined}
          />
        </TouchableOpacity>

        {onLaunchDrill ? (
          <TouchableOpacity
            style={[styles.drillButton, mistake.isDrilled && styles.drillButtonCompleted]}
            onPress={() => onLaunchDrill(mistake)}
            activeOpacity={0.8}
          >
            {mistake.isDrilled ? (
              <CheckIcon size={13} color="#FFFFFF" />
            ) : (
              <BoltIcon size={13} color="#FFFFFF" />
            )}
            <Text style={styles.drillButtonText}>
              {mistake.isDrilled ? 'Completed (+12)' : 'Practice Drill'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  turnText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  quoteBlock: {
    borderLeftWidth: 2,
    borderLeftColor: colors.cardBorder,
    paddingLeft: 10,
    marginBottom: 10,
  },
  candidateQuote: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  critiqueText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  expandedSection: {
    backgroundColor: colors.elevatedBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  conceptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  conceptBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.notionBlueLight,
    marginTop: 7,
    marginRight: 8,
  },
  conceptItem: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  goldenResponseBox: {
    backgroundColor: colors.notionBlueBg,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.notionBlue,
    padding: 10,
    borderRadius: 6,
    marginTop: 2,
  },
  goldenResponseText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 19,
  },
  mentalModelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  mentalModelText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  expandButtonText: {
    color: colors.notionBlueLight,
    fontSize: 13,
    fontWeight: '600',
  },
  drillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  drillButtonCompleted: {
    backgroundColor: colors.speakingEmerald,
  },
  drillButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
