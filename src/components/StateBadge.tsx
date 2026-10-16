/**
 * State Badge Component
 * Displays live full-duplex conversational state with a clean status dot and subtle pill surface
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InterviewState } from '../types';
import { colors } from '../theme/colors';

interface StateBadgeProps {
  state: InterviewState;
}

export const StateBadge: React.FC<StateBadgeProps> = ({ state }) => {
  let label = 'Initializing';
  let dotColor = colors.textTertiary;
  let textColor = colors.textSecondary;
  let bgTint = colors.cardBackground;
  let borderColor = colors.cardBorder;

  switch (state) {
    case 'READY':
      label = 'Session Ready';
      dotColor = colors.textSecondary;
      textColor = colors.textSecondary;
      break;
    case 'LISTENING':
      label = 'Listening';
      dotColor = colors.listeningCyan;
      textColor = colors.notionBlueLight;
      bgTint = colors.notionBlueBg;
      borderColor = 'rgba(79, 110, 247, 0.3)';
      break;
    case 'USER_SPEAKING':
      label = 'Speaking';
      dotColor = colors.speakingEmerald;
      textColor = colors.speakingEmerald;
      bgTint = colors.notionGreenBg;
      borderColor = 'rgba(16, 185, 129, 0.3)';
      break;
    case 'THINKING':
      label = 'Evaluating Turn';
      dotColor = colors.thinkingViolet;
      textColor = colors.thinkingViolet;
      bgTint = colors.notionPurpleBg;
      borderColor = 'rgba(139, 92, 246, 0.3)';
      break;
    case 'AI_SPEAKING':
      label = 'Interviewer Speaking';
      dotColor = colors.listeningCyan;
      textColor = colors.notionBlueLight;
      bgTint = colors.notionBlueBg;
      borderColor = 'rgba(79, 110, 247, 0.3)';
      break;
    case 'INTERRUPTED':
      label = 'Barge-In Active';
      dotColor = colors.interruptedAmber;
      textColor = colors.interruptedAmber;
      bgTint = colors.notionOrangeBg;
      borderColor = 'rgba(245, 158, 11, 0.3)';
      break;
    case 'COMPLETED':
      label = 'Completed';
      dotColor = colors.successGreen;
      textColor = colors.successGreen;
      bgTint = colors.notionGreenBg;
      borderColor = 'rgba(16, 185, 129, 0.3)';
      break;
  }

  return (
    <View style={[styles.badgeContainer, { backgroundColor: bgTint, borderColor }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.labelText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
