/**
 * State Badge Component
 * Displays live full-duplex conversational state with matching glowing pill
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InterviewState } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface StateBadgeProps {
  state: InterviewState;
}

export const StateBadge: React.FC<StateBadgeProps> = ({ state }) => {
  let label = 'INITIALIZING';
  let badgeColor = colors.textTertiary;
  let bgGlow = 'rgba(100, 116, 139, 0.15)';

  switch (state) {
    case 'READY':
      label = 'SESSION READY';
      badgeColor = colors.textSecondary;
      bgGlow = 'rgba(148, 163, 184, 0.15)';
      break;
    case 'LISTENING':
      label = 'LISTENING (SPEAK TO ANSWER)';
      badgeColor = colors.listeningCyan;
      bgGlow = colors.listeningGlow;
      break;
    case 'USER_SPEAKING':
      label = 'CANDIDATE SPEAKING';
      badgeColor = colors.speakingEmerald;
      bgGlow = colors.speakingGlow;
      break;
    case 'THINKING':
      label = 'EVALUATING TURN...';
      badgeColor = colors.thinkingViolet;
      bgGlow = colors.thinkingGlow;
      break;
    case 'AI_SPEAKING':
      label = 'INTERVIEWER SPEAKING (TAP TO INTERRUPT)';
      badgeColor = colors.listeningCyan;
      bgGlow = 'rgba(6, 182, 212, 0.2)';
      break;
    case 'INTERRUPTED':
      label = 'BARGE-IN REGISTERED';
      badgeColor = colors.interruptedAmber;
      bgGlow = colors.interruptedGlow;
      break;
    case 'COMPLETED':
      label = 'INTERVIEW COMPLETED';
      badgeColor = colors.successGreen;
      bgGlow = 'rgba(34, 197, 94, 0.2)';
      break;
  }

  return (
    <View style={[styles.badgeContainer, { backgroundColor: bgGlow, borderColor: badgeColor }]}>
      <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      <Text style={[typography.badge, { color: badgeColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
    marginVertical: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },
});
