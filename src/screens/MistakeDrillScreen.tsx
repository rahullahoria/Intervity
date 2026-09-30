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
} from 'react-native';
import { useInteractiveDrill, DrillConfig } from '../hooks/useInteractiveDrill';
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
      prompt: 'Explain how database indexing improves B-Tree query latency in 45 seconds without using a single filler word (avoid "um", "uh", "like", "basically", "actually", "ya").',
      targetSkillId: 'communication_structure',
      timeLimitSeconds: 45,
    };
  } else if (drillType === 'STAR_PITCH') {
    drillConfig = {
      type: 'STAR_PITCH',
      title: '60-Second STAR Elevator Pitch',
      prompt: 'Describe a high-severity production outage you personally resolved. Articulate Situation, Task, your individual Action, and the quantified Result before the timer expires.',
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
      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.appTag}>LEVEL-UP COACHING DRILL</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={typography.h1}>{drillConfig.title}</Text>

        {/* Drill Instructions Card */}
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>Coaching Directive:</Text>
          <Text style={styles.promptText}>"{drillConfig.prompt}"</Text>
        </View>

        {/* Timer & Biofeedback Display */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, drillState === 'RECORDING' && styles.timerCircleActive]}>
            <Text style={styles.timerNumber}>{secondsRemaining}</Text>
            <Text style={styles.timerUnit}>SEC</Text>
          </View>

          {drillConfig.type === 'ZERO_FILLER' && drillState === 'RECORDING' ? (
            <View style={styles.biofeedbackBadge}>
              <Text style={styles.biofeedbackText}>
                ⚠️ Filler Words Detected: <Text style={styles.boldRed}>{hapticCount}</Text>
              </Text>
              <Text style={typography.caption}>Haptic pulses triggered on disfluencies</Text>
            </View>
          ) : null}
        </View>

        {/* Transcript Preview */}
        {candidateTranscript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>Your Spoken Re-attempt:</Text>
            <Text style={styles.transcriptText}>{candidateTranscript}</Text>
          </View>
        ) : null}

        {/* Result & Mastery Bonus Banner */}
        {drillState === 'PASSED' ? (
          <View style={styles.resultBannerPassed}>
            <Text style={styles.resultTitle}>🎉 DRILL MASTERED! (+{scoreAwarded} PTS)</Text>
            <Text style={styles.resultBody}>{feedback}</Text>
          </View>
        ) : drillState === 'FAILED' ? (
          <View style={styles.resultBannerFailed}>
            <Text style={styles.resultTitle}>NEEDS RETRY</Text>
            <Text style={styles.resultBody}>{feedback}</Text>
          </View>
        ) : null}

        {/* Controls */}
        <View style={styles.controlsSection}>
          {drillState === 'INTRO' || drillState === 'FAILED' || drillState === 'PASSED' ? (
            <TouchableOpacity style={styles.startBtn} onPress={startDrill}>
              <Text style={styles.startBtnText}>
                {drillState === 'INTRO' ? 'Start Voice Drill 🎙️' : 'Re-attempt Drill 🔄'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.finishBtn}
              onPress={() => finishDrill()}
            >
              <Text style={styles.finishBtnText}>Finish & Evaluate Answer ⚡</Text>
            </TouchableOpacity>
          )}

          {/* Simulation Helper Buttons for Testing */}
          {drillState === 'RECORDING' ? (
            <View style={styles.simHelpers}>
              <Text style={styles.simHelperLabel}>Test Input Shortcut:</Text>
              <TouchableOpacity
                style={styles.simBtn}
                onPress={() => {
                  if (drillConfig.type === 'ZERO_FILLER') {
                    onCandidateSpokeChunk('Database indexes use balanced B-Trees to guarantee logarithmic lookups.');
                  } else {
                    onCandidateSpokeChunk('I resolved the cache stampede by implementing probabilistic early expiration with distributed mutex locks.');
                  }
                }}
              >
                <Text style={styles.simBtnText}>Speak Flawless Senior Answer</Text>
              </TouchableOpacity>

              {drillConfig.type === 'ZERO_FILLER' ? (
                <TouchableOpacity
                  style={[styles.simBtn, { marginTop: 6 }]}
                  onPress={() => onCandidateSpokeChunk('Um, basically, ya, we just added an index.')}
                >
                  <Text style={styles.simBtnText}>Speak Filler Word (Trigger Haptic)</Text>
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
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  appTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.listeningCyan,
    letterSpacing: 1.2,
  },
  promptCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 16,
    marginVertical: 14,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.listeningCyan,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  promptText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 18,
  },
  timerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.elevatedBackground,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircleActive: {
    borderColor: colors.listeningCyan,
  },
  timerNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timerUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  biofeedbackBadge: {
    marginTop: 12,
    alignItems: 'center',
  },
  biofeedbackText: {
    color: colors.interruptedAmber,
    fontSize: 14,
    fontWeight: '600',
  },
  boldRed: {
    color: colors.errorRed,
    fontWeight: '800',
  },
  transcriptBox: {
    backgroundColor: colors.elevatedBackground,
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    marginBottom: 4,
  },
  transcriptText: {
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  resultBannerPassed: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.speakingEmerald,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginVertical: 14,
  },
  resultBannerFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.errorRed,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginVertical: 14,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  resultBody: {
    ...typography.body,
    color: colors.textPrimary,
  },
  controlsSection: {
    marginTop: 20,
  },
  startBtn: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  finishBtn: {
    backgroundColor: colors.speakingEmerald,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  simHelpers: {
    marginTop: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 12,
  },
  simHelperLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 6,
  },
  simBtn: {
    backgroundColor: colors.elevatedBackground,
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
