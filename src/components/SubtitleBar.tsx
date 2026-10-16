/**
 * Live Subtitles Teleprompter Bar
 * Streams candidate transcript or live AI interviewer utterance in real-time
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
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
  const speakerTitle = isCandidateSpeaking ? 'Your Response' : 'Interviewer';
  const speakerMeta = isCandidateSpeaking ? 'Live Transcript' : 'Bengaluru Tech Lead';
  const displayText = isCandidateSpeaking
    ? (transcript || 'Listening to your voice...')
    : (activeQuestion || 'Preparing question...');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.speakerBadge}>
          <View
            style={[
              styles.speakerDot,
              { backgroundColor: isCandidateSpeaking ? colors.speakingEmerald : colors.notionBlueLight },
            ]}
          />
          <Text style={styles.speakerLabel}>{speakerTitle}</Text>
        </View>
        <Text style={styles.speakerMetaText}>{speakerMeta}</Text>
      </View>
      <Text style={styles.subtitleText} numberOfLines={3}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    minHeight: 88,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  speakerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  speakerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  speakerMetaText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  subtitleText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 21,
    fontWeight: '400',
  },
});
