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
import { RiveMascot } from '../components/RiveMascot';
import { useAgentCoaching } from '../hooks/useAgentCoaching';
import { colors } from '../theme/colors';

interface AgentCoachingScreenProps {
  navigation: any;
}

export const AgentCoachingScreen: React.FC<AgentCoachingScreenProps> = ({ navigation }) => {
  const {
    state,
    mascotProfile,
    userMemory,
    currentSubtitle,
    audioLevel,
    messages,
    isLoudspeaker,
    isHandsFreeActive,
    turnIndex,
    startSession,
    triggerBargeIn,
    sendBackupTextMessage,
    toggleSpeakerphone,
    toggleHandsFree,
    handleUserFinishedSpeaking,
  } = useAgentCoaching();

  const [isTextDrawerVisible, setIsTextDrawerVisible] = useState(false);
  const [typedInput, setTypedInput] = useState('');

  const isSpeaking = state === 'AI_SPEAKING';
  const isListening = state === 'LISTENING' || state === 'USER_SPEAKING';
  const isThinking = state === 'THINKING';
  const isReady = state === 'READY';
  const isInitializing = state === 'INITIALIZING';

  const handleSendText = () => {
    if (!typedInput.trim()) return;
    sendBackupTextMessage(typedInput);
    setTypedInput('');
  };

  const handleQuickPrompt = (prompt: string) => {
    sendBackupTextMessage(prompt);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Header: Mascot Personality Level & Audio Output */}
      <View style={styles.header}>
        <View style={styles.mascotLevelChip}>
          <Text style={styles.mascotLevelText}>
            ⭐ Lv.{mascotProfile.level} • {mascotProfile.personalityTier}
          </Text>
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
            style={[
              styles.iconBtn,
              isLoudspeaker && styles.iconBtnActive,
            ]}
            onPress={toggleSpeakerphone}
          >
            <Text style={styles.iconBtnText}>{isLoudspeaker ? '🔊' : '🔈'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('ModelManager')}
          >
            <Text style={styles.iconBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Hands-Free Coaching Space */}
      <View style={styles.centerStage}>
        {/* Memory Hint: Career Target Badge */}
        {userMemory?.targetRole ? (
          <View style={styles.targetRoleBadge}>
            <Text style={styles.targetRoleText}>
              🎯 Target: {userMemory.targetRole}
            </Text>
          </View>
        ) : null}

        {/* Centerpiece: Expressive Rive Mascot */}
        <View style={styles.mascotWrapper}>
          <RiveMascot
            state={state}
            audioLevel={audioLevel}
            size={290}
            mascotType="teddy"
            showMascotBadge={true}
            onPress={() => {
              if (isSpeaking) triggerBargeIn();
              else if (isReady) startSession();
            }}
          />
        </View>

        {/* Live Subtitle Teleprompter */}
        <View style={styles.subtitleCard}>
          <Text style={styles.subtitleSpeaker}>
            {isSpeaking ? `Nova (AI Coach):` : isListening ? `Listening to you:` : `Coach Status:`}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={4}>
            {currentSubtitle || 'Speak naturally into your microphone...'}
          </Text>
        </View>
      </View>

      {/* Bottom Hands-Free Action Bar */}
      <View style={styles.bottomBar}>
        {isReady ? (
          <TouchableOpacity style={styles.primaryStartBtn} onPress={startSession}>
            <Text style={styles.primaryStartBtnText}>🎙️ Begin Coaching Conversation</Text>
          </TouchableOpacity>
        ) : isSpeaking ? (
          <TouchableOpacity style={styles.bargeInBtn} onPress={triggerBargeIn}>
            <Text style={styles.bargeInBtnText}>⚡ Tap to Speak (Barge-In)</Text>
          </TouchableOpacity>
        ) : isListening ? (
          <TouchableOpacity style={styles.listeningActiveBtn} onPress={() => handleUserFinishedSpeaking()}>
            <Text style={styles.listeningActiveBtnText}>
              👂 Listening... (Pause 1s or Tap when Done)
            </Text>
          </TouchableOpacity>
        ) : isThinking ? (
          <View style={styles.thinkingPill}>
            <Text style={styles.thinkingPillText}>🧠 Updating Career Model...</Text>
          </View>
        ) : null}

        {/* Secondary Discreet Backup Option: Text Mode */}
        <View style={styles.secondaryControlsRow}>
          <TouchableOpacity
            style={styles.handsFreeToggle}
            onPress={toggleHandsFree}
          >
            <Text style={styles.handsFreeToggleText}>
              {isHandsFreeActive ? '🎙️ Hands-Free Loop ON' : '⏸️ Manual Tap Mode'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.textBackupBtn}
            onPress={() => setIsTextDrawerVisible(true)}
          >
            <Text style={styles.textBackupBtnText}>💬 Text Mode</Text>
          </TouchableOpacity>
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
              <View>
                <Text style={styles.modalTitle}>💬 Backup Text Mode</Text>
                <Text style={styles.modalSubtitle}>Use when you cannot speak or listen out loud</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsTextDrawerVisible(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
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
                <Text style={styles.quickChipText}>🎯 Aiming for Staff Level</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => handleQuickPrompt("Teach me how to prevent cache stampedes in distributed systems.")}
              >
                <Text style={styles.quickChipText}>💡 Learn Cache Stampede</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => handleQuickPrompt("How do I structure my system design answers to pass L6?")}
              >
                <Text style={styles.quickChipText}>🏗️ System Design Framing</Text>
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
                      {msg.sender === 'user' ? 'You' : `Nova (Lv.${mascotProfile.level})`}
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
                <Text style={styles.sendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  mascotLevelChip: {
    flexDirection: 'column',
    gap: 4,
  },
  mascotLevelText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  xpBarTrack: {
    width: 140,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  iconBtnText: {
    fontSize: 15,
  },
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  targetRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 12,
  },
  targetRoleText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '600',
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  subtitleCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
  },
  subtitleSpeaker: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitleText: {
    color: '#F1F5F9',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  primaryStartBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
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
  bargeInBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  bargeInBtnText: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '700',
  },
  listeningActiveBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: '#06B6D4',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  listeningActiveBtnText: {
    color: '#22D3EE',
    fontSize: 13,
    fontWeight: '700',
  },
  thinkingPill: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
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
  handsFreeToggle: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  handsFreeToggleText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  textBackupBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textBackupBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
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
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '600',
  },
  quickPromptScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  quickChip: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
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
    backgroundColor: '#2563EB',
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
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
