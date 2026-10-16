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
import {
  ChevronLeftIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  SettingsIcon,
  ClockIcon,
  BearIcon,
  OrbIcon,
  MicIcon,
  StopIcon,
  BoltIcon,
  KeyboardIcon,
  ActivityIcon,
} from '../components/icons/AppIcons';
import { useOfflineInterviewEngine } from '../hooks/useOfflineInterviewEngine';
import { colors } from '../theme/colors';
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
  const interviewOptions: InterviewOptions =
    route?.params?.interviewOptions || DEFAULT_INTERVIEW_OPTIONS;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [visualMode, setVisualMode] = useState<'mascot' | 'orb'>('mascot');
  const [isLoudspeaker, setIsLoudspeaker] = useState(true);

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
    setSpeakerphone,
  } = useOfflineInterviewEngine(interviewOptions);

  const handleToggleSpeaker = async () => {
    const nextState = !isLoudspeaker;
    setIsLoudspeaker(nextState);
    await setSpeakerphone(nextState);
  };

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
        <TouchableOpacity style={styles.backBtn} onPress={handleEndSession} activeOpacity={0.75}>
          <ChevronLeftIcon size={16} color={colors.textSecondary} />
          <Text style={styles.backBtnText}>End</Text>
        </TouchableOpacity>

        <View style={styles.centerTitleWrapper}>
          <Text style={styles.roleTitle} numberOfLines={1}>
            {interviewOptions.targetRole}
          </Text>
          <Text style={styles.personaSubtitle}>
            {interviewOptions.voiceProfile || 'hf_alpha'} • {interviewOptions.dialect || 'en-IN'}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.iconBtn, isLoudspeaker && styles.iconBtnActive]}
            onPress={handleToggleSpeaker}
            activeOpacity={0.75}
          >
            {isLoudspeaker ? (
              <VolumeHighIcon size={15} color={colors.speakingEmerald} />
            ) : (
              <VolumeLowIcon size={15} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('ModelManager')}
            activeOpacity={0.75}
          >
            <SettingsIcon size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Studio Telemetry & Mode Bar */}
      <View style={styles.telemetryBar}>
        <View style={styles.telemetryLeft}>
          <StateBadge state={state} />
          <View style={styles.turnPill}>
            <Text style={styles.turnPillText}>Turn {currentTurnIndex + 1}</Text>
          </View>
        </View>

        <View style={styles.telemetryRight}>
          <View style={styles.timerPill}>
            <ClockIcon size={12} color={colors.textTertiary} />
            <Text style={styles.timeElapsedText}>{formatTime(elapsedSeconds)}</Text>
          </View>

          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[styles.modeToggleBtn, visualMode === 'mascot' && styles.modeToggleBtnActive]}
              onPress={() => setVisualMode('mascot')}
              activeOpacity={0.8}
            >
              <BearIcon
                size={12}
                color={visualMode === 'mascot' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.modeToggleText,
                  visualMode === 'mascot' && styles.modeToggleTextActive,
                ]}
              >
                Coach
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeToggleBtn, visualMode === 'orb' && styles.modeToggleBtnActive]}
              onPress={() => setVisualMode('orb')}
              activeOpacity={0.8}
            >
              <OrbIcon
                size={12}
                color={visualMode === 'orb' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.modeToggleText,
                  visualMode === 'orb' && styles.modeToggleTextActive,
                ]}
              >
                Orb
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Center Visual Canvas (Rive Mascot / 3D Voice Orb) */}
      <View style={styles.orbCanvasContainer}>
        {visualMode === 'mascot' ? (
          <RiveMascot
            state={state}
            audioLevel={audioLevel}
            size={220}
            mascotType="teddy"
            onPress={state === 'AI_SPEAKING' ? triggerInterruption : undefined}
          />
        ) : (
          <VoiceOrb state={state} audioLevel={audioLevel} size={220} />
        )}

        <Text style={styles.orbHelperText}>
          {state === 'AI_SPEAKING'
            ? 'Tap visual or start speaking to barge in'
            : state === 'LISTENING'
            ? 'Microphone active — speak clearly at your natural pace'
            : state === 'THINKING'
            ? 'Evaluating architectural trade-offs on-device...'
            : state === 'INTERRUPTED'
            ? 'Interruption registered — listening to your point'
            : 'Capturing live speech stream'}
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
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={startInterview}
            activeOpacity={0.85}
          >
            <MicIcon size={17} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Begin Mock Interview</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControlsRow}>
            {(state === 'LISTENING' || state === 'USER_SPEAKING' || state === 'INTERRUPTED') ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.finishSpeakingBtn]}
                onPress={finishSpeakingManually}
                activeOpacity={0.8}
              >
                <StopIcon size={13} color={colors.notionBlueLight} />
                <Text style={styles.finishSpeakingBtnText}>Finish Speaking</Text>
              </TouchableOpacity>
            ) : state === 'AI_SPEAKING' ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.bargeInBtn, styles.bargeInBtnActive]}
                onPress={triggerInterruption}
                activeOpacity={0.8}
              >
                <BoltIcon size={14} color={colors.interruptedAmber} />
                <Text style={styles.bargeInBtnText}>Interrupt</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.actionBtn, styles.thinkingBadge]}>
                <ActivityIcon size={14} color={colors.textSecondary} />
                <Text style={styles.thinkingBadgeText}>Evaluating...</Text>
              </View>
            )}

            {/* Type Answer Button */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.typeAnswerBtn]}
              onPress={() => setIsTypeModalVisible(true)}
              activeOpacity={0.75}
            >
              <KeyboardIcon size={14} color={colors.textPrimary} />
              <Text style={styles.typeAnswerBtnText}>Type</Text>
            </TouchableOpacity>

            {/* End Interview Button */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.endBtn]}
              onPress={handleEndSession}
              activeOpacity={0.75}
            >
              <Text style={styles.endBtnText}>End</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Testing Simulation Shortcuts */}
        <View style={styles.simulationBar}>
          <Text style={styles.simLabel}>Simulation Presets</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.simChips}
          >
            <TouchableOpacity
              style={styles.simChip}
              onPress={() =>
                simulateCandidateAnswer(
                  'In our distributed catalog service, caching with Redis was not enough; key expiry caused cache stampedes. I solved this by implementing probabilistic early expiration with distributed mutex locks.'
                )
              }
              activeOpacity={0.75}
            >
              <Text style={styles.simChipText}>Senior Answer (Cache Stampede)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simChip}
              onPress={() =>
                simulateCandidateAnswer(
                  'Um, basically, ya, we used Redis because it is very fast for reads, but we did not configure eviction.'
                )
              }
              activeOpacity={0.75}
            >
              <Text style={styles.simChipText}>Filler-Heavy (Um/Ya)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simChip}
              onPress={() =>
                simulateCandidateAnswer(
                  'We used Kafka to make the system fast and reliable for all events.'
                )
              }
              activeOpacity={0.75}
            >
              <Text style={styles.simChipText}>Surface Level (L4 Ceiling)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Type Answer Modal */}
      <Modal
        visible={isTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Type Your Response</Text>
            <Text style={styles.modalSubtitle}>
              Enter your technical response directly for evaluation:
            </Text>
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="e.g. In my last project, we mitigated cache stampedes using probabilistic early expiration..."
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
  centerTitleWrapper: {
    alignItems: 'center',
    maxWidth: '58%',
  },
  roleTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  personaSubtitle: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: colors.notionGreenBg,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  telemetryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  telemetryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  turnPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  turnPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  telemetryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeElapsedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
  },
  orbCanvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  orbHelperText: {
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  primaryActionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 6,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  activeControlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 13,
  },
  finishSpeakingBtn: {
    flex: 2.6,
    backgroundColor: colors.notionBlueBg,
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.4)',
  },
  finishSpeakingBtnText: {
    color: colors.notionBlueLight,
    fontSize: 13,
    fontWeight: '600',
  },
  bargeInBtn: {
    flex: 2.6,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  bargeInBtnActive: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: colors.notionOrangeBg,
  },
  bargeInBtnText: {
    color: colors.interruptedAmber,
    fontSize: 13,
    fontWeight: '600',
  },
  thinkingBadge: {
    flex: 2.6,
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
    flex: 0.9,
    backgroundColor: colors.notionRedBg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  endBtnText: {
    color: colors.errorRed,
    fontSize: 12,
    fontWeight: '600',
  },
  simulationBar: {
    marginTop: 8,
  },
  simLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    marginBottom: 6,
  },
  simChips: {
    gap: 8,
  },
  simChip: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  simChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: colors.surface,
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
    gap: 10,
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
    fontWeight: '600',
  },
});
