/**
 * Interview Session Screen (Full Duplex Voice HUD)
 * Implements Section 9.2:
 * - Dynamic 3D Voice Orb Canvas
 * - Real-time state badges (LISTENING, USER_SPEAKING, THINKING, AI_SPEAKING, INTERRUPTED)
 * - Live Subtitles Teleprompter
 * - Hardware AEC Barge-in Interruption Controls
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { VoiceOrb } from '../components/VoiceOrb';
import { RiveMascot } from '../components/RiveMascot';
import { StateBadge } from '../components/StateBadge';
import { SubtitleBar } from '../components/SubtitleBar';
import { useOfflineInterviewEngine } from '../hooks/useOfflineInterviewEngine';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { InterviewOptions } from '../types';

interface InterviewSessionScreenProps {
  route: {
    params: {
      interviewOptions: InterviewOptions;
    };
  };
  navigation: any;
}

const DEFAULT_INTERVIEW_OPTIONS: InterviewOptions = {
  targetRole: 'Senior Staff React Native Architect',
  voiceProfile: 'hf_alpha',
  interviewerPersona: 'bengaluru_tech_lead',
  targetLevel: 'STAFF (L6)',
  dialect: 'en-IN',
  resume: {
    candidateName: 'Rahul Sharma',
    yearsOfExperience: 6,
    skills: ['React Native', 'TypeScript', 'System Design'],
    notableProjects: [],
    recommendedInterviewTopics: ['System Design Scale', 'Concurrency'],
    rawText: 'Experienced Software Engineer',
  },
};

export const InterviewSessionScreen: React.FC<InterviewSessionScreenProps> = ({
  route,
  navigation,
}) => {
  const interviewOptions: InterviewOptions = route?.params?.interviewOptions || DEFAULT_INTERVIEW_OPTIONS;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [visualMode, setVisualMode] = useState<'mascot' | 'orb'>('mascot');

  const {
    state,
    transcript,
    audioLevel,
    currentTurnIndex,
    activeQuestion,
    sessionRecord,
    startInterview,
    endInterview,
    triggerInterruption,
    finishSpeakingManually,
    submitCandidateAnswer,
    simulateCandidateAnswer,
  } = useOfflineInterviewEngine(interviewOptions);

  // Timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const handleEndSession = async () => {
    await endInterview();
    navigation.replace('SessionSummary', {
      sessionRecord: sessionRecord || {
        sessionId: `session_${Date.now()}`,
        targetRole: interviewOptions.targetRole,
        startedAt: Date.now() - elapsedSeconds * 1000,
        completedAt: Date.now(),
        durationSeconds: elapsedSeconds,
        overallScore: 82,
        turns: [],
      },
      resume: interviewOptions.resume,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBtn} onPress={handleEndSession}>
          <Text style={styles.navBtnText}>← End</Text>
        </TouchableOpacity>

        <View style={styles.centerTitleWrapper}>
          <Text style={styles.roleTitle} numberOfLines={1}>
            {interviewOptions.targetRole}
          </Text>
          <Text style={styles.personaSubtitle}>
            Voice: {interviewOptions.voiceProfile || 'hf_alpha (en-IN)'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.navigate('ModelManager')}
        >
          <Text style={styles.navBtnText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Meta Stats Row */}
      <View style={styles.statsRow}>
        <Text style={typography.captionBold}>
          Turn {currentTurnIndex + 1}
        </Text>
        <Text style={styles.timeElapsedText}>
          ⏱️ {formatTime(elapsedSeconds)}
        </Text>
      </View>

      {/* State & Visual Mode Switcher */}
      <View style={styles.topStatusRow}>
        <StateBadge state={state} />
        <View style={styles.modeToggleRow}>
          <TouchableOpacity
            style={[styles.modeToggleBtn, visualMode === 'mascot' && styles.modeToggleBtnActive]}
            onPress={() => setVisualMode('mascot')}
          >
            <Text style={[styles.modeToggleText, visualMode === 'mascot' && styles.modeToggleTextActive]}>
              🤖 Mascot
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeToggleBtn, visualMode === 'orb' && styles.modeToggleBtnActive]}
            onPress={() => setVisualMode('orb')}
          >
            <Text style={[styles.modeToggleText, visualMode === 'orb' && styles.modeToggleTextActive]}>
              🔮 Orb
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Visual Canvas (Rive Mascot / 3D Voice Orb) */}
      <View style={styles.orbCanvasContainer}>
        {visualMode === 'mascot' ? (
          <RiveMascot
            state={state}
            audioLevel={audioLevel}
            size={240}
            onPress={state === 'AI_SPEAKING' ? triggerInterruption : undefined}
          />
        ) : (
          <VoiceOrb state={state} audioLevel={audioLevel} size={240} />
        )}

        <Text style={styles.orbHelperText}>
          {state === 'AI_SPEAKING'
            ? 'Tap mascot or speak to interrupt (Barge-In)'
            : state === 'LISTENING'
            ? 'Speak clearly into your microphone...'
            : state === 'THINKING'
            ? 'Evaluating technical trade-offs...'
            : state === 'INTERRUPTED'
            ? 'Interruption detected! Listening to you...'
            : 'Candidate Speaking'}
        </Text>
      </View>

      {/* Live Teleprompter Subtitles */}
      <SubtitleBar
        state={state}
        transcript={transcript}
        activeQuestion={activeQuestion}
      />

      {/* Interactive Controls & Simulation Triggers */}
      <View style={styles.controlsContainer}>
        {state === 'READY' ? (
          <TouchableOpacity style={styles.primaryActionButton} onPress={startInterview}>
            <Text style={styles.primaryActionText}>🎙️ Begin Mock Interview</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <View style={styles.activeControlsRow}>
              {/* If candidate is speaking or listening, show Finish Speaking button */}
              {(state === 'LISTENING' || state === 'USER_SPEAKING' || state === 'INTERRUPTED') ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.finishSpeakingBtn]}
                  onPress={finishSpeakingManually}
                >
                  <Text style={styles.finishSpeakingBtnText}>⏹️ Finish Speaking</Text>
                </TouchableOpacity>
              ) : state === 'AI_SPEAKING' ? (
                /* Barge-In Interruption Button */
                <TouchableOpacity
                  style={[styles.actionBtn, styles.bargeInBtn, styles.bargeInBtnActive]}
                  onPress={triggerInterruption}
                >
                  <Text style={styles.bargeInBtnText}>⚡ Interrupt</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.actionBtn, styles.thinkingBadge]}>
                  <Text style={styles.thinkingBadgeText}>⏳ Evaluating...</Text>
                </View>
              )}

              {/* Type Answer Button */}
              <TouchableOpacity
                style={[styles.actionBtn, styles.typeAnswerBtn]}
                onPress={() => setIsTypeModalVisible(true)}
              >
                <Text style={styles.typeAnswerBtnText}>⌨️ Type</Text>
              </TouchableOpacity>

              {/* End Interview Button */}
              <TouchableOpacity style={[styles.actionBtn, styles.endBtn]} onPress={handleEndSession}>
                <Text style={styles.endBtnText}>End</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Testing Simulation Shortcuts */}
        <View style={styles.simulationBar}>
          <Text style={styles.simLabel}>Quick Simulated Candidate Answer:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.simChips}>
            <TouchableOpacity
              style={styles.simChip}
              onPress={() => simulateCandidateAnswer(
                'In our distributed catalog service, caching with Redis was not enough; key expiry caused cache stampedes. I solved this by implementing probabilistic early expiration with distributed mutex locks.'
              )}
            >
              <Text style={styles.simChipText}>Senior Answer (Cache Stampede)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simChip}
              onPress={() => simulateCandidateAnswer(
                'Um, basically, ya, we used Redis because it is very fast for reads, but we did not configure eviction.'
              )}
            >
              <Text style={styles.simChipText}>Filler-Heavy Answer (Um/Ya)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simChip}
              onPress={() => simulateCandidateAnswer(
                'We used Kafka to make the system fast and reliable for all events.'
              )}
            >
              <Text style={styles.simChipText}>Vague Answer (L4 Ceiling)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Type Answer Modal */}
      <Modal
        visible={isTypeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Type Your Response</Text>
            <Text style={styles.modalSubtitle}>
              Directly type your technical answer for the interviewer:
            </Text>
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="e.g. In my last project, we handled caching stampedes using probabilistic early expiration..."
              placeholderTextColor={colors.textTertiary}
              value={typedAnswer}
              onChangeText={setTypedAnswer}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsTypeModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={() => {
                  if (typedAnswer.trim()) {
                    submitCandidateAnswer(typedAnswer.trim());
                    setTypedAnswer('');
                    setIsTypeModalVisible(false);
                  }
                }}
              >
                <Text style={styles.modalSubmitText}>Submit Answer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  navBtn: {
    padding: 8,
  },
  navBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  centerTitleWrapper: {
    alignItems: 'center',
    maxWidth: '65%',
  },
  roleTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  personaSubtitle: {
    color: colors.listeningCyan,
    fontSize: 11,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  timeElapsedText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  orbCanvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  orbHelperText: {
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  primaryActionButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  activeControlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishSpeakingBtn: {
    flex: 3,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  finishSpeakingBtnText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
  },
  bargeInBtn: {
    flex: 3,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  bargeInBtnActive: {
    borderColor: colors.interruptedAmber,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  bargeInBtnText: {
    color: colors.interruptedAmber,
    fontSize: 13,
    fontWeight: '700',
  },
  thinkingBadge: {
    flex: 3,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  thinkingBadgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  typeAnswerBtn: {
    flex: 1.3,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  typeAnswerBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  endBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.errorRed,
  },
  endBtnText: {
    color: colors.errorRed,
    fontSize: 12,
    fontWeight: '700',
  },
  simulationBar: {
    marginTop: 10,
  },
  simLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 6,
  },
  simChips: {
    gap: 8,
  },
  simChip: {
    backgroundColor: colors.elevatedBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  simChipText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: colors.elevatedBackground,
    color: colors.textPrimary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    minHeight: 110,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  topStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 4,
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modeToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeToggleBtnActive: {
    backgroundColor: colors.accentPrimary,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
