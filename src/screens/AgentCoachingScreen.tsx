/**
 * Agent Coaching Screen (Minimalist Hands-Free Voice Space)
 * 
 * Design Philosophy:
 * - Zero Clutter / No Fancy bloat
 * - Mascot front-and-center talking with on-device Kokoro-82M TTS
 * - Hands-Free Voice-First continuous conversation loop
 * - Evolving Mascot personality & level progress as it learns from the user
 * - Secondary backup text input/output for quiet environments
 */

import React, { useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { RiveMascot } from '../components/RiveMascot';
import { useAgentCoaching } from '../hooks/useAgentCoaching';
import { colors } from '../theme/colors';
import {
  SparklesIcon,
  StarIcon,
  CoachIcon,
  BearIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  SettingsIcon,
  TargetIcon,
  MicIcon,
  BoltIcon,
  BrainIcon,
  ChatBubbleIcon,
  LoopIcon,
  PauseIcon,
  CloseIcon,
  SendIcon,
  BulbIcon,
  BriefcaseIcon,
  ArchitectureIcon,
  SoundWaveBars,
} from '../components/icons/AppIcons';

interface AgentCoachingScreenProps {
  navigation: any;
}

export const AgentCoachingScreen: React.FC<AgentCoachingScreenProps> = ({ navigation }) => {
  const {
    state,
    mascotProfile,
    userMemory,
    voiceProfile,
    refreshVoiceProfile,
    currentSubtitle,
    audioLevel,
    messages,
    isLoudspeaker,
    turnIndex,
    startSession,
    startListening,
    stopAndSend,
    cancelListening,
    stopMascotSpeaking,
    sendBackupTextMessage,
    toggleSpeakerphone,
  } = useAgentCoaching();

  useFocusEffect(
    React.useCallback(() => {
      refreshVoiceProfile();
    }, [refreshVoiceProfile])
  );


  const [isTextDrawerVisible, setIsTextDrawerVisible] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [selectedMascot, setSelectedMascot] = useState<'coach' | 'teddy'>('teddy');
  const insets = useSafeAreaInsets();

  const isSpeaking = state === 'AI_SPEAKING';
  const isListening = state === 'LISTENING' || state === 'USER_SPEAKING';
  const isThinking = state === 'THINKING';
  const isReady = state === 'READY';
  const isInitializing = state === 'INITIALIZING';
  const hasStarted = messages.length > 0 || turnIndex > 0;

  const handleSendText = () => {
    if (!typedInput.trim()) return;
    sendBackupTextMessage(typedInput);
    setTypedInput('');
  };

  const handleQuickPrompt = (prompt: string) => {
    sendBackupTextMessage(prompt);
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* 1. Full Screen Immersive Mascot Layer */}
      <RiveMascot
        isFullScreen={true}
        state={state}
        audioLevel={audioLevel}
        mascotType={selectedMascot}
        onPress={() => {
          if (isSpeaking) stopMascotSpeaking();
          else if (isReady) startListening();
          else if (isListening) stopAndSend();
        }}
      />

      {/* 2. Floating Top Header & Career Goals */}
      <View
        style={[
          styles.floatingTopContainer,
          { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 38) : 0, 44) + 12 },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.header}>
          <View style={styles.mascotLevelChip}>
            <View style={styles.mascotLevelHeaderRow}>
              <View style={styles.levelBadge}>
                <StarIcon size={11} color="#38BDF8" />
                <Text style={styles.levelBadgeText}>Lv.{mascotProfile.level}</Text>
              </View>
              <Text style={styles.mascotPersonalityText} numberOfLines={1}>
                {mascotProfile.personalityTier}
              </Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View
                style={[
                  styles.xpBarFill,
                  { width: `${Math.min(100, (mascotProfile.xp / mascotProfile.xpToNextLevel) * 100)}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.headerControls}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setSelectedMascot((prev) => (prev === 'coach' ? 'teddy' : 'coach'))}
              accessibilityLabel="Switch Avatar"
            >
              {selectedMascot === 'coach' ? (
                <CoachIcon size={18} color="#38BDF8" />
              ) : (
                <BearIcon size={18} color="#38BDF8" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconBtn,
                isLoudspeaker && styles.iconBtnActive,
              ]}
              onPress={toggleSpeakerphone}
              accessibilityLabel="Toggle Loudspeaker"
            >
              {isLoudspeaker ? (
                <VolumeHighIcon size={18} color="#38BDF8" />
              ) : (
                <VolumeLowIcon size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('ModelManager')}
              accessibilityLabel="Settings"
            >
              <SettingsIcon size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.topBadgesRow}>
          <TouchableOpacity
            style={[
              styles.voiceProfileBadge,
              voiceProfile?.voiceEnrolled && styles.voiceProfileBadgeActive,
            ]}
            onPress={() =>
              navigation.navigate('VoiceEnrollment', {
                candidateName: voiceProfile?.name || userMemory?.candidateName || 'Rahul',
              })
            }
            activeOpacity={0.8}
            accessibilityLabel="Voice Profile Calibration"
          >
            <MicIcon size={12} color={voiceProfile?.voiceEnrolled ? '#10B981' : '#38BDF8'} />
            <Text
              style={[
                styles.voiceProfileText,
                voiceProfile?.voiceEnrolled && { color: '#6EE7B7' },
              ]}
            >
              {voiceProfile?.voiceEnrolled
                ? `${voiceProfile.name} (Calibrated)`
                : '🎙️ Enroll Voice'}
            </Text>
          </TouchableOpacity>

          {userMemory?.targetRole ? (
            <View style={styles.targetRoleBadge}>
              <TargetIcon size={12} color="#818CF8" />
              <Text style={styles.targetRoleText} numberOfLines={1}>
                Target: {userMemory.targetRole}
              </Text>
            </View>
          ) : null}
        </View>
      </View>


      {/* 3. Floating Bottom HUD (Subtitles & Primary Action Controls) */}
      <View
        style={[
          styles.floatingBottomContainer,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 22 : 8) + 8 },
        ]}
        pointerEvents="box-none"
      >
        {/* Live Subtitle Teleprompter */}
        <View style={styles.subtitleCard}>
          <View style={styles.subtitleHeaderRow}>
            <View style={styles.speakerStatusRow}>
              {isSpeaking ? (
                <>
                  <SoundWaveBars level={audioLevel} active={true} color="#38BDF8" size={14} />
                  <Text style={[styles.subtitleSpeaker, { color: '#38BDF8' }]}>Teddy (AI Buddy & Coach)</Text>
                </>
              ) : isListening ? (
                <>
                  <SoundWaveBars level={audioLevel} active={true} color="#22D3EE" size={14} />
                  <Text style={[styles.subtitleSpeaker, { color: '#22D3EE' }]}>Listening to you</Text>
                </>
              ) : isThinking ? (
                <>
                  <BrainIcon size={13} color="#A78BFA" />
                  <Text style={[styles.subtitleSpeaker, { color: '#A78BFA' }]}>Updating Career Model</Text>
                </>
              ) : (
                <>
                  <SparklesIcon size={13} color="#94A3B8" />
                  <Text style={styles.subtitleSpeaker}>Teddy Ready</Text>
                </>
              )}
            </View>

            {isSpeaking && (
              <TouchableOpacity
                style={styles.bargeInHintPill}
                onPress={stopMascotSpeaking}
                activeOpacity={0.7}
              >
                <PauseIcon size={10} color="#38BDF8" />
                <Text style={[styles.bargeInHintText, { color: '#38BDF8' }]}>Tap to pause speech</Text>
              </TouchableOpacity>
            )}
            {isListening && (
              <View style={[styles.bargeInHintPill, { backgroundColor: 'rgba(34, 211, 238, 0.15)' }]}>
                <Text style={[styles.bargeInHintText, { color: '#22D3EE' }]}>Tap Send when done</Text>
              </View>
            )}
          </View>

          <Text style={styles.subtitleText} numberOfLines={3}>
            {currentSubtitle || (isListening ? 'Speak now into your microphone...' : 'Tap below to chat with Teddy...')}
          </Text>
        </View>

        {/* Bottom Push-to-Talk Action Bar */}
        <View style={styles.bottomBar}>
          {isReady ? (
            <TouchableOpacity
              style={styles.primaryStartBtn}
              onPress={hasStarted ? startListening : startSession}
              activeOpacity={0.8}
            >
              <MicIcon size={20} color="#FFFFFF" />
              <Text style={styles.primaryStartBtnText}>
                {hasStarted ? 'Tap to Speak' : 'Start Coaching Conversation'}
              </Text>
            </TouchableOpacity>
          ) : isSpeaking ? (
            <TouchableOpacity
              style={styles.speakingActiveBtn}
              onPress={stopMascotSpeaking}
              activeOpacity={0.8}
            >
              <SoundWaveBars level={audioLevel} active={true} color="#38BDF8" size={15} />
              <Text style={styles.speakingActiveBtnText}>Teddy is speaking... (Tap to Pause)</Text>
              <PauseIcon size={14} color="#38BDF8" />
            </TouchableOpacity>
          ) : isListening ? (
            <View style={styles.recordingControlsRow}>
              <TouchableOpacity
                style={styles.cancelRecordBtn}
                onPress={cancelListening}
                activeOpacity={0.7}
              >
                <CloseIcon size={16} color="#94A3B8" />
                <Text style={styles.cancelRecordText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendRecordBtn}
                onPress={() => stopAndSend()}
                activeOpacity={0.8}
              >
                <SoundWaveBars level={audioLevel} active={true} color="#FFFFFF" size={14} />
                <Text style={styles.sendRecordBtnText}>Send</Text>
                <SendIcon size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : isThinking ? (
            <View style={styles.thinkingPill}>
              <BrainIcon size={16} color="#A78BFA" />
              <Text style={styles.thinkingPillText}>Teddy is thinking...</Text>
            </View>
          ) : null}

          {/* Secondary Controls: Push-to-Talk Indicator & Text Mode */}
          <View style={styles.secondaryControlsRow}>
            <View style={styles.modeIndicatorChip}>
              <MicIcon size={12} color="#38BDF8" />
              <Text style={styles.modeIndicatorText}>Push-to-Talk Mode</Text>
            </View>

            <TouchableOpacity
              style={styles.textBackupBtn}
              onPress={() => setIsTextDrawerVisible(true)}
              activeOpacity={0.8}
            >
              <ChatBubbleIcon size={13} color="#38BDF8" />
              <Text style={styles.textBackupBtnText}>Text Mode</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Secondary Backup Text Modal (For Silent / Non-Voice Situations) */}
      <Modal
        visible={isTextDrawerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTextDrawerVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <ChatBubbleIcon size={18} color="#38BDF8" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.modalTitle}>Backup Text Mode</Text>
                  <Text style={styles.modalSubtitle}>Use when you cannot speak or listen out loud</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsTextDrawerVisible(false)}
              >
                <CloseIcon size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Quick Prompts */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.quickPromptScroll}
            >
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => handleQuickPrompt("I'm currently a Senior Engineer aiming for Staff level.")}
              >
                <BriefcaseIcon size={13} color="#818CF8" />
                <Text style={styles.quickChipText}>Aiming for Staff Level</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => handleQuickPrompt("Teach me how to prevent cache stampedes in distributed systems.")}
              >
                <BulbIcon size={13} color="#FBBF24" />
                <Text style={styles.quickChipText}>Learn Cache Stampede</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => handleQuickPrompt("How do I structure my system design answers to pass L6?")}
              >
                <ArchitectureIcon size={13} color="#38BDF8" />
                <Text style={styles.quickChipText}>System Design Framing</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Conversation History */}
            <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatScrollContent}>
              {messages.length === 0 ? (
                <Text style={styles.emptyChatText}>No messages yet. Send a message below to start.</Text>
              ) : (
                messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.chatBubble,
                      msg.sender === 'user' ? styles.userBubble : styles.mascotBubble,
                    ]}
                  >
                    <Text style={styles.bubbleAuthor}>
                      {msg.sender === 'user' ? 'You' : `Teddy (Lv.${mascotProfile.level})`}
                    </Text>
                    <Text style={styles.bubbleText}>{msg.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Text Input Row */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your answer or career goal..."
                placeholderTextColor="#64748B"
                value={typedInput}
                onChangeText={setTypedInput}
                onSubmitEditing={handleSendText}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendBtn, !typedInput.trim() && styles.sendBtnDisabled]}
                onPress={handleSendText}
                disabled={!typedInput.trim()}
              >
                <SendIcon size={15} color={typedInput.trim() ? '#FFFFFF' : '#64748B'} />
                <Text style={styles.sendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#d6e2ea',
  },
  floatingTopContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
  floatingBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mascotLevelChip: {
    flexShrink: 1,
    maxWidth: '65%',
    flexDirection: 'column',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  mascotLevelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  levelBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  mascotPersonalityText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  xpBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  iconBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  topBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  voiceProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  voiceProfileBadgeActive: {
    borderColor: 'rgba(16, 185, 129, 0.45)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  voiceProfileText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  targetRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  targetRoleText: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '700',
  },

  subtitleCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  subtitleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  speakerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitleSpeaker: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bargeInHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  bargeInHintText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '700',
  },
  subtitleText: {
    color: '#F1F5F9',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'android' ? 18 : 8,
    gap: 10,
  },
  primaryStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0284C7',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryStartBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  speakingActiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 14,
  },
  speakingActiveBtnText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  recordingControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelRecordBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    borderRadius: 14,
  },
  cancelRecordText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  sendRecordBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  sendRecordBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  thinkingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 14,
  },
  thinkingPillText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  modeIndicatorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  modeIndicatorText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  textBackupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textBackupBtnText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  quickPromptScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickChipText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  chatScroll: {
    paddingHorizontal: 16,
    maxHeight: 280,
  },
  chatScrollContent: {
    paddingVertical: 12,
    gap: 10,
  },
  emptyChatText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 13,
    marginVertical: 20,
  },
  chatBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    maxWidth: '85%',
  },
  mascotBubble: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#0284C7',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleAuthor: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 19,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sendBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
