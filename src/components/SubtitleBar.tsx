/**
 * Live Subtitles Teleprompter Bar
 * Streams candidate transcript or live AI interviewer utterance in real-time
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { InterviewState } from '../types';

interface SubtitleBarProps {
  state: InterviewState;
  transcript: string;
  activeQuestion: string;
}

export const SubtitleBar: React.FC<SubtitleBarProps> = ({
  state,
  transcript,
  activeQuestion,
}) => {
  const isCandidateSpeaking = state === 'USER_SPEAKING' || state === 'INTERRUPTED';
  const speakerTitle = isCandidateSpeaking ? 'Candidate:' : 'Interviewer (Bengaluru Lead):';
  const displayText = isCandidateSpeaking
    ? (transcript || 'Listening to your voice...')
    : (activeQuestion || 'Preparing question...');

  return (
    <View style={styles.container}>
      <Text style={styles.speakerLabel}>{speakerTitle}</Text>
      <Text style={[typography.body, styles.subtitleText]} numberOfLines={3}>
        "{displayText}"
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    minHeight: 80,
    justifyContent: 'center',
  },
  speakerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitleText: {
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
