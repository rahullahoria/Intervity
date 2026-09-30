/**
 * Mistake Card Component
 * Displays post-interview autopsy, gap critique, golden L5 response, and drill launcher
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MistakeDiagnostic } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface MistakeCardProps {
  mistake: MistakeDiagnostic;
  onLaunchDrill?: (mistake: MistakeDiagnostic) => void;
}

export const MistakeCard: React.FC<MistakeCardProps> = ({ mistake, onLaunchDrill }) => {
  const [expanded, setExpanded] = useState(false);

  const categoryBadgeColor =
    mistake.mistakeCategory === 'CONCEPTUAL'
      ? colors.errorRed
      : mistake.mistakeCategory === 'L4_CEILING'
      ? colors.interruptedAmber
      : colors.thinkingViolet;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: `${categoryBadgeColor}20`, borderColor: categoryBadgeColor }]}>
          <Text style={[styles.badgeText, { color: categoryBadgeColor }]}>
            {mistake.mistakeCategory.replace('_', ' ')}
          </Text>
        </View>
        <Text style={styles.turnText}>Turn {mistake.turnIndex + 1}</Text>
      </View>

      <Text style={styles.candidateQuote} numberOfLines={2}>
        "{mistake.candidateQuote}"
      </Text>

      <Text style={styles.critiqueText}>
        {mistake.critique}
      </Text>

      {/* Expandable Golden L5+ Response */}
      {expanded ? (
        <View style={styles.expandedSection}>
          <Text style={styles.sectionHeader}>Missing Senior (L5) Concepts:</Text>
          {mistake.missingSeniorConcepts.map((concept, idx) => (
            <Text key={idx} style={styles.conceptItem}>
              • {concept}
            </Text>
          ))}

          <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Golden L5+ Response:</Text>
          <View style={styles.goldenResponseBox}>
            <Text style={styles.goldenResponseText}>
              "{mistake.goldenResponse}"
            </Text>
          </View>

          <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Actionable Mental Model:</Text>
          <Text style={styles.mentalModelText}>
            💡 {mistake.coachingMentalModel}
          </Text>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandButtonText}>
            {expanded ? 'Hide Golden Response' : 'View Golden L5 Response'}
          </Text>
        </TouchableOpacity>

        {onLaunchDrill ? (
          <TouchableOpacity
            style={[styles.drillButton, mistake.isDrilled && styles.drillButtonCompleted]}
            onPress={() => onLaunchDrill(mistake)}
          >
            <Text style={styles.drillButtonText}>
              {mistake.isDrilled ? '✓ Drilled (+12 pts)' : '⚡ Drill This'}
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  turnText: {
    ...typography.caption,
  },
  candidateQuote: {
    color: colors.textTertiary,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  critiqueText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  expandedSection: {
    backgroundColor: colors.elevatedBackground,
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.listeningCyan,
    marginBottom: 4,
  },
  conceptItem: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    marginBottom: 2,
  },
  goldenResponseBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: colors.listeningCyan,
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  goldenResponseText: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
  },
  mentalModelText: {
    color: colors.interruptedAmber,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  expandButton: {
    paddingVertical: 6,
  },
  expandButtonText: {
    color: colors.accentPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  drillButton: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  drillButtonCompleted: {
    backgroundColor: colors.speakingEmerald,
  },
  drillButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
