/**
 * Mistake Drill Screen ("Level-Up Mode")
 * Interactive 1-on-1 voice coaching drill:
 * - Biofeedback Zero-Filler Reflex Trainer (instant micro-vibration biofeedback)
 * - 60-Second STAR Elevator Pitch
 * - Skeptical Architect Pushback Drill
 * - Live re-attempt evaluation and +12 point mastery bonus
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useInteractiveDrill, DrillConfig } from '../hooks/useInteractiveDrill';
import {
  ChevronLeftIcon,
  MicIcon,
  RefreshIcon,
  BoltIcon,
  AlertCircleIcon,
  CheckIcon,
} from '../components/icons/AppIcons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface MistakeDrillScreenProps {
  route: {
    params: {
      drillType?: 'ZERO_FILLER' | 'STAR_PITCH' | 'SKEPTICAL_ARCHITECT' | 'MISTAKE_CORRECTION';
      targetSkillId?: string;
      skillName?: string;
      mistake?: any;
    };
  };
  navigation: any;
}

export const MistakeDrillScreen: React.FC<MistakeDrillScreenProps> = ({ route, navigation }) => {
  const {
    drillType = 'ZERO_FILLER',
    targetSkillId = 'distributed_caching',
    skillName = 'Distributed Systems',
    mistake,
  } = route.params || {};

  let drillConfig: DrillConfig;

  if (drillType === 'ZERO_FILLER') {
    drillConfig = {
      type: 'ZERO_FILLER',
      title: 'Zero-Filler Biofeedback Reflex Trainer',
      prompt:
        'Explain how database indexing improves B-Tree query latency in 45 seconds without using a single filler word (avoid "um", "uh", "like", "basically", "actually", "ya").',
      targetSkillId: 'communication_structure',
      timeLimitSeconds: 45,
    };
  } else if (drillType === 'STAR_PITCH') {
    drillConfig = {
      type: 'STAR_PITCH',
      title: '60-Second STAR Elevator Pitch',
      prompt:
        'Describe a high-severity production outage you personally resolved. Articulate Situation, Task, your individual Action, and the quantified Result before the timer expires.',
      targetSkillId: 'behavioral',
      timeLimitSeconds: 60,
    };
  } else {
    drillConfig = {
      type: 'MISTAKE_CORRECTION',
      title: `Senior Level-Up: ${skillName}`,
      prompt: mistake?.goldenResponse
        ? `Re-answer this question at the Senior Engineer (L5) level. Remember: ${mistake.coachingMentalModel}`
        : 'Re-answer articulating cache stampede mitigations, distributed locking, and eviction policies.',
      targetSkillId,
      timeLimitSeconds: 60,
      mistake,
    };
  }

  const {
    drillState,
    secondsRemaining,
    candidateTranscript,
    hapticCount,
    feedback,
    scoreAwarded,
    startDrill,
    finishDrill,
    onCandidateSpokeChunk,
  } = useInteractiveDrill(drillConfig);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <ChevronLeftIcon size={16} color={colors.textSecondary} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Targeted Voice Drill</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={typography.h1}>{drillConfig.title}</Text>

        {/* Drill Instructions Card */}
        <View style={styles.promptCard}>
          <View style={styles.promptHeaderRow}>
            <View style={styles.promptDot} />
            <Text style={styles.promptLabel}>Coaching Directive</Text>
          </View>
          <Text style={styles.promptText}>{drillConfig.prompt}</Text>
        </View>

        {/* Timer & Biofeedback Display */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, drillState === 'RECORDING' && styles.timerCircleActive]}>
            <Text style={styles.timerNumber}>{secondsRemaining}</Text>
            <Text style={styles.timerUnit}>sec</Text>
          </View>

          {drillConfig.type === 'ZERO_FILLER' && drillState === 'RECORDING' ? (
            <View style={styles.biofeedbackBadge}>
              <View style={styles.biofeedbackRow}>
                <AlertCircleIcon size={14} color={colors.interruptedAmber} />
                <Text style={styles.biofeedbackText}>
                  Disfluencies Detected: <Text style={styles.boldRed}>{hapticCount}</Text>
                </Text>
              </View>
              <Text style={styles.biofeedbackSubtext}>
                Haptic feedback pulses on detected filler words
              </Text>
            </View>
          ) : null}
        </View>

        {/* Transcript Preview */}
        {candidateTranscript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>Live Speech Transcript</Text>
            <Text style={styles.transcriptText}>{candidateTranscript}</Text>
          </View>
        ) : null}

        {/* Result & Mastery Bonus Banner */}
        {drillState === 'PASSED' ? (
          <View style={styles.resultBannerPassed}>
            <View style={styles.resultHeaderRow}>
              <View style={styles.resultTitleGroup}>
                <View style={styles.passedIconCircle}>
                  <CheckIcon size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.resultTitle}>Drill Mastered</Text>
              </View>
              <View style={styles.bonusPill}>
                <Text style={styles.bonusPillText}>+{scoreAwarded} pts</Text>
              </View>
            </View>
            <Text style={styles.resultBody}>{feedback}</Text>
          </View>
        ) : drillState === 'FAILED' ? (
          <View style={styles.resultBannerFailed}>
            <View style={styles.resultHeaderRow}>
              <View style={styles.resultTitleGroup}>
                <AlertCircleIcon size={15} color={colors.errorRed} />
                <Text style={styles.resultTitle}>Refinement Needed</Text>
              </View>
            </View>
            <Text style={styles.resultBody}>{feedback}</Text>
          </View>
        ) : null}

        {/* Controls */}
        <View style={styles.controlsSection}>
          {drillState === 'INTRO' || drillState === 'FAILED' || drillState === 'PASSED' ? (
            <TouchableOpacity style={styles.startBtn} onPress={startDrill} activeOpacity={0.85}>
              {drillState === 'INTRO' ? (
                <MicIcon size={17} color="#FFFFFF" />
              ) : (
                <RefreshIcon size={16} color="#FFFFFF" />
              )}
              <Text style={styles.startBtnText}>
                {drillState === 'INTRO' ? 'Start Voice Drill' : 'Re-attempt Drill'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.finishBtn}
              onPress={() => finishDrill()}
              activeOpacity={0.85}
            >
              <BoltIcon size={16} color="#FFFFFF" />
              <Text style={styles.finishBtnText}>Finish & Evaluate Response</Text>
            </TouchableOpacity>
          )}

          {/* Simulation Helper Buttons for Testing */}
          {drillState === 'RECORDING' ? (
            <View style={styles.simHelpers}>
              <Text style={styles.simHelperLabel}>Simulation Presets</Text>
              <TouchableOpacity
                style={styles.simBtn}
                onPress={() => {
                  if (drillConfig.type === 'ZERO_FILLER') {
                    onCandidateSpokeChunk(
                      'Database indexes use balanced B-Trees to guarantee logarithmic lookups.'
                    );
                  } else {
                    onCandidateSpokeChunk(
                      'I resolved the cache stampede by implementing probabilistic early expiration with distributed mutex locks.'
                    );
                  }
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.simBtnText}>Simulate Flawless Senior Response</Text>
              </TouchableOpacity>

              {drillConfig.type === 'ZERO_FILLER' ? (
                <TouchableOpacity
                  style={[styles.simBtn, { marginTop: 6 }]}
                  onPress={() =>
                    onCandidateSpokeChunk('Um, basically, ya, we just added an index.')
                  }
                  activeOpacity={0.75}
                >
                  <Text style={styles.simBtnText}>Simulate Filler Word (Trigger Haptic)</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  topBarSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  promptCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  promptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  promptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.notionBlueLight,
  },
  promptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.notionBlueLight,
  },
  promptText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.cardBackground,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircleActive: {
    borderColor: colors.notionBlue,
    backgroundColor: colors.notionBlueBg,
  },
  timerNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  timerUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  biofeedbackBadge: {
    marginTop: 14,
    alignItems: 'center',
    backgroundColor: colors.notionOrangeBg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  biofeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  biofeedbackText: {
    color: colors.interruptedAmber,
    fontSize: 13,
    fontWeight: '600',
  },
  biofeedbackSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  boldRed: {
    color: colors.errorRed,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  transcriptBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderLeftWidth: 3,
    borderLeftColor: colors.notionBlue,
    borderRadius: 10,
    padding: 14,
    marginVertical: 10,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 4,
  },
  transcriptText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
  },
  resultBannerPassed: {
    backgroundColor: colors.notionGreenBg,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  resultBannerFailed: {
    backgroundColor: colors.notionRedBg,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passedIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.speakingEmerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bonusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bonusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.speakingEmerald,
    fontVariant: ['tabular-nums'],
  },
  resultBody: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  controlsSection: {
    marginTop: 16,
  },
  startBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    paddingVertical: 15,
    borderRadius: 10,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  finishBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.speakingEmerald,
    paddingVertical: 15,
    borderRadius: 10,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  simHelpers: {
    marginTop: 16,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    padding: 12,
  },
  simHelperLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    marginBottom: 8,
  },
  simBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  simBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
