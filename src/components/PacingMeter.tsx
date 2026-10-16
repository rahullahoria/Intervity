/**
 * Speech Pacing & Disfluency Gauge Component
 * Visualizes Words Per Minute (WPM) cadence and filler density with tabular numerals
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface PacingMeterProps {
  wpm: number;
  fillerCount: number;
  score: number;
}

export const PacingMeter: React.FC<PacingMeterProps> = ({ wpm, fillerCount, score }) => {
  let pacingStatus = 'Optimal range';
  let statusColor = colors.successGreen;

  if (wpm === 0) {
    pacingStatus = 'Calibrated';
    statusColor = colors.textSecondary;
  } else if (wpm < 110) {
    pacingStatus = 'Measured / Slow';
    statusColor = colors.interruptedAmber;
  } else if (wpm > 165) {
    pacingStatus = 'Rapid pace';
    statusColor = colors.interruptedAmber;
  }

  return (
    <View style={styles.container}>
      <View style={styles.metricBox}>
        <Text style={styles.metricLabel}>Cadence</Text>
        <View style={styles.valueRow}>
          <Text style={styles.metricValue}>{wpm > 0 ? wpm : '--'}</Text>
          <Text style={styles.metricUnit}>wpm</Text>
        </View>
        <Text style={[styles.statusText, { color: statusColor }]}>{pacingStatus}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricBox}>
        <Text style={styles.metricLabel}>Disfluencies</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.metricValue, { color: fillerCount > 3 ? colors.interruptedAmber : colors.textPrimary }]}>
            {fillerCount}
          </Text>
        </View>
        <Text style={styles.subtext}>Target &lt; 2</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricBox}>
        <Text style={styles.metricLabel}>Acoustic Poise</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.metricValue, { color: colors.speakingEmerald }]}>{score}</Text>
          <Text style={[styles.metricUnit, { color: colors.speakingEmerald }]}>%</Text>
        </View>
        <Text style={styles.subtext}>Clarity index</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    marginLeft: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  subtext: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.cardBorder,
  },
});
