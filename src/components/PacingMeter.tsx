/**
 * Speech Pacing & Disfluency Gauge Component
 * Visualizes Words Per Minute (WPM) cadence and filler density
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface PacingMeterProps {
  wpm: number;
  fillerCount: number;
  score: number;
}

export const PacingMeter: React.FC<PacingMeterProps> = ({ wpm, fillerCount, score }) => {
  // Cadence status
  let pacingStatus = 'Optimal Cadence';
  let statusColor = colors.successGreen;

  if (wpm === 0) {
    pacingStatus = 'Calibrated';
    statusColor = colors.textSecondary;
  } else if (wpm < 110) {
    pacingStatus = 'Hesitant / Slow';
    statusColor = colors.interruptedAmber;
  } else if (wpm > 165) {
    pacingStatus = 'Rushing Pace';
    statusColor = colors.interruptedAmber;
  }

  return (
    <View style={styles.container}>
      <View style={styles.metricBox}>
        <Text style={styles.metricValue}>{wpm > 0 ? wpm : '--'}</Text>
        <Text style={styles.metricLabel}>Words / Min</Text>
        <Text style={[styles.statusText, { color: statusColor }]}>{pacingStatus}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricBox}>
        <Text style={[styles.metricValue, { color: fillerCount > 3 ? colors.interruptedAmber : colors.textPrimary }]}>
          {fillerCount}
        </Text>
        <Text style={styles.metricLabel}>Filler Words</Text>
        <Text style={styles.subtext}>Target: &lt; 2</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricBox}>
        <Text style={[styles.metricValue, { color: colors.speakingEmerald }]}>{score}%</Text>
        <Text style={styles.metricLabel}>Prosody Score</Text>
        <Text style={styles.subtext}>Acoustic Poise</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricLabel: {
    ...typography.captionBold,
    color: colors.textTertiary,
    marginTop: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  subtext: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.cardBorder,
  },
});
