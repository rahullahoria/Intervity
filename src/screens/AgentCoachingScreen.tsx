/**
 * Agent Coaching Screen: Question-Driven Learning (QBL) Masterclass
 * 
 * Premium UI/UX Edition:
 * - High-end dark aesthetic (#07090E / #0F1420) with electric cyan, purple, and emerald accents
 * - Teddy Organic Companion Card: Avatar halo, dynamic speech bubble, expressive Rive states
 * - Masterclass Track Cards: 5 core engineering tracks with category badges and deep technical scope
 * - Tactical QBL Question Card: Concept counter, 4 high-contrast tactile option buttons (A, B, C, D)
 * - Deep Diagnostics Feedback: Crystal-clear separation of "Why it's a trap" vs "Correct answer & mental model"
 * - Sub-topic Mastery Indicators: Concept step dots (● ● ○), 100% mastery gate
 * - Interactive Sub-topic Roadmap Sheet & Past Sessions Drawer
 * - Modern floating glassmorphism input dock for free-form queries & hints
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RiveMascot } from '../components/RiveMascot';
import { useQBLSession } from '../hooks/useQBLSession';
import {
  StarIcon,
  SparklesIcon,
  SendIcon,
  CloseIcon,
  TargetIcon,
  BrainIcon,
  SettingsIcon,
} from '../components/icons/AppIcons';

import { colors } from '../theme/colors';

interface AgentCoachingScreenProps {
  navigation: any;
}

interface MasterclassTrack {
  id: string;
  title: string;
  badge: string;
  description: string;
  accentColor: string;
  tag: string;
}

const MASTERCLASS_TRACKS: MasterclassTrack[] = [
  {
    id: 'Distributed Systems',
    title: 'High-Scale Distributed Systems',
    badge: 'Staff / L6',
    description: 'PACELC trade-offs, Raft consensus, Byzantine resilience & p99 SLA defense',
    accentColor: '#38BDF8',
    tag: 'CONSENSUS & SCALE',
  },
  {
    id: 'Kafka & Event Streaming',
    title: 'Kafka & Event Streaming',
    badge: 'Data Platform',
    description: 'Partition ISR quorums, consumer rebalancing & exactly-once semantics',
    accentColor: '#A855F7',
    tag: 'EVENT ARCHITECTURE',
  },
  {
    id: 'React Native Architecture',
    title: 'React Native & Mobile Performance',
    badge: '60 FPS JSI',
    description: 'Fabric renderer, TurboModules, Hermes bytecode & offline SQLite sync',
    accentColor: '#10B981',
    tag: 'CLIENT ARCHITECTURE',
  },
  {
    id: 'SQL Indexing & Sharding',
    title: 'SQL Indexing & Sharding',
    badge: 'Deep DB',
    description: 'B+Tree access paths, write-ahead logs (WAL), composite indexes & locks',
    accentColor: '#F59E0B',
    tag: 'STORAGE ENGINES',
  },
  {
    id: 'System Design & Microservices',
    title: 'System Design at Scale',
    badge: 'Principal',
    description: 'Probabilistic caching (XFetch), idempotence, rate limiting & circuit breakers',
    accentColor: '#F43F5E',
    tag: 'MICROSERVICES',
  },
];

export const AgentCoachingScreen: React.FC<AgentCoachingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    session,
    pastSessions,
    currentSubtopic,
    currentQuestion,
    teddyEmotion,
    chatMessages,
    isThinking,
    isInitializing,
    latestSessionToResume,
    modelStatus,
    mascotLevel,
    mascotXp,
    mascotTier,
    startNewTopic,
    resumeSession,
    selectOption,
    advanceToNextQuestion,
    currentTurnResult,
    selectedOptionId,
    sendChatMessage,
  } = useQBLSession();

  const [inputText, setInputText] = useState('');
  const [isRoadmapVisible, setIsRoadmapVisible] = useState(false);
  const [isSessionsModalVisible, setIsSessionsModalVisible] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);

  // When a new question arrives, ALWAYS scroll to top (y: 0) and reset option collapse so question is 100% visible
  useEffect(() => {
    if (currentQuestion) {
      setShowAllOptions(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentQuestion?.id]);

  // When turn is evaluated (feedback arrives), keep scroll strictly anchored at top (y: 0)
  // so the question, choices, and feedback show from the beginning with ZERO overlap under Teddy!
  useEffect(() => {
    if (currentTurnResult) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentTurnResult]);

  // Auto-scroll on free-form chat messages if no active question
  useEffect(() => {
    if (!currentQuestion && chatMessages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatMessages.length, currentQuestion]);

  const handleSend = () => {
    if (!inputText.trim() || isThinking) return;
    const text = inputText.trim();
    setInputText('');
    sendChatMessage(text);
  };

  const handleOptionPress = (optionId: string) => {
    if (isThinking || selectedOptionId) return;
    selectOption(optionId);
  };


  return (
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#07090E" translucent={true} />

      {/* 1. Header HUD */}
      <View
        style={[
          styles.topHeader,
          { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0, 44) + 6 },
        ]}
      >
        <View style={styles.headerRow}>
          {/* Level Badge with Teddy Logo, Star & XP Progress */}
          <View style={styles.levelCardContainer}>
            <Image
              source={require('../assets/images/teddy_logo.png')}
              style={styles.headerTeddyLogo}
              resizeMode="cover"
            />
            <View style={styles.levelCard}>
              <View style={styles.levelBadgeRow}>
                <View style={styles.starBadge}>
                  <StarIcon size={12} color="#38BDF8" />
                  <Text style={styles.starBadgeText}>Lv.{mascotLevel}</Text>
                </View>
                <Text style={styles.personalityTierText} numberOfLines={1}>
                  {mascotTier}
                </Text>
                <Text style={styles.xpFractionText}>{mascotXp % 100}/100 XP</Text>
              </View>
              <View style={styles.xpTrack}>
                <View
                  style={[
                    styles.xpFill,
                    { width: `${Math.min(100, (mascotXp % 100))}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Action Pills */}
          <View style={styles.headerActions}>
            {session && (
              <TouchableOpacity
                style={styles.roadmapBtn}
                onPress={() => setIsRoadmapVisible(true)}
                activeOpacity={0.8}
                accessibilityLabel="View Roadmap"
              >
                <TargetIcon size={14} color="#38BDF8" />
                <Text style={styles.roadmapBtnText}>Roadmap</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.sessionsBtn}
              onPress={() => setIsSessionsModalVisible(true)}
              activeOpacity={0.8}
              accessibilityLabel="Past Sessions"
            >
              <BrainIcon size={15} color="#94A3B8" />
              <Text style={styles.sessionsBtnText}>Sessions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('ModelManager')}
              activeOpacity={0.8}
              accessibilityLabel="Settings"
            >
              <SettingsIcon size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inline Model Download Banner (Only displayed if actively downloading) */}
        {modelStatus.isDownloading && (
          <View style={styles.modelStatusBanner}>
            <ActivityIndicator size="small" color="#38BDF8" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.modelStatusText}>{modelStatus.statusText}</Text>
              <View style={styles.modelProgressTrack}>
                <View style={[styles.modelProgressFill, { width: `${modelStatus.progress}%` }]} />
              </View>
            </View>
            <Text style={styles.modelPercentText}>{modelStatus.progress}%</Text>
          </View>
        )}

        {/* Active Session & Sub-topic Mastery Strip */}
        {session && currentSubtopic && currentQuestion && (
          <View style={styles.activeTopicBar}>

            <View style={styles.topicInfoRow}>
              <Text style={styles.activeTopicName} numberOfLines={1}>
                {session.topicName}
              </Text>
              <View style={styles.overallMasteryBadge}>
                <SparklesIcon size={11} color="#38BDF8" style={{ marginRight: 4 }} />
                <Text style={styles.overallMasteryText}>
                  {session.overallMasteryPercentage}% Skill Mastered
                </Text>
              </View>
            </View>

            <View style={styles.subtopicProgressContainer}>
              <View style={styles.subtopicLabelRow}>
                <Text style={styles.subtopicNameText} numberOfLines={1}>
                  Sub-topic {session.currentSubtopicIndex + 1}/{session.subtopics.length}: {currentSubtopic.title}
                </Text>
                {/* Concept Step Dots: ● ● ○ */}
                <View style={styles.conceptDotsRow}>
                  {[1, 2, 3].map((dot) => {
                    const isMastered = currentSubtopic.conceptsMastered >= dot;
                    const isCurrent = currentSubtopic.conceptsMastered + 1 === dot;
                    return (
                      <View
                        key={dot}
                        style={[
                          styles.conceptDot,
                          isMastered && styles.conceptDotMastered,
                          isCurrent && styles.conceptDotCurrent,
                        ]}
                      />
                    );
                  })}
                  <Text style={styles.subtopicMasteryText}>{currentSubtopic.masteryPercentage}%</Text>
                </View>
              </View>
              <View style={styles.subtopicTrack}>
                <View
                  style={[
                    styles.subtopicFill,
                    {
                      width: `${currentSubtopic.masteryPercentage}%`,
                      backgroundColor:
                        currentSubtopic.masteryPercentage === 100
                          ? colors.successGreen
                          : '#38BDF8',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 2. Teddy Companion Hero Area */}
      <View style={styles.companionSection}>
        <View style={styles.companionRow}>
          <View style={styles.mascotHalo}>
            <RiveMascot
              emotion={isThinking ? 'speaking' : (teddyEmotion === 'speaking' ? 'idle' : teddyEmotion)}
              mascotType="teddy"
              size={95}
              showMascotBadge={false}
            />
          </View>
          <View style={styles.companionSpeechCard}>
            <View style={styles.companionHeaderRow}>
              <View style={styles.companionNameBadge}>
                <Text style={styles.companionNameText}>TEDDY AI</Text>
              </View>
              <View
                style={[
                  styles.emotionBadge,
                  isThinking && styles.emotionSpeaking,
                  !isThinking && teddyEmotion === 'celebrating' && styles.emotionCelebrating,
                  !isThinking && teddyEmotion === 'puzzled' && styles.emotionPuzzled,
                ]}
              >
                <Text style={styles.emotionEmoji}>
                  {isThinking
                    ? '🎙️ Formulating...'
                    : teddyEmotion === 'celebrating'
                    ? '🎉 Celebrating'
                    : teddyEmotion === 'puzzled'
                    ? '🤔 Diagnostics'
                    : '✨ Mentor Ready'}
                </Text>
              </View>
            </View>
            <Text style={styles.companionDialogueText} numberOfLines={2}>
              {isThinking
                ? 'Teddy is formulating your next question and curriculum...'
                : currentQuestion
                ? selectedOptionId
                  ? teddyEmotion === 'celebrating'
                    ? "Spot on! That's exactly how it works in production! 🎉"
                    : "Not quite, but this is a super common trap. Let's analyze it! 🤔"
                  : 'Analyze the trade-offs carefully and select the best pattern below! 🚀'
                : chatMessages.length > 0 && chatMessages[chatMessages.length - 1].sender === 'teddy'
                ? chatMessages[chatMessages.length - 1].text.split('\n')[0]
                : session
                ? `Mastering ${currentSubtopic?.title || session.topicName} together!`
                : 'Welcome! Ready to level up your engineering depth through Question-Driven Learning?'}
            </Text>
          </View>
        </View>

      </View>

      {/* 3. Main Content Stream (Scrollable) */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScroll}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: insets.bottom + 85 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isInitializing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38BDF8" />
            <Text style={styles.loadingText}>Waking up Teddy...</Text>
          </View>
        )}

        {/* Welcome / Choice State: Resume Last Session Card OR Masterclass Tracks */}
        {!currentQuestion && !isThinking && (
          <View style={styles.welcomeContainer}>

            {/* Resume Last Session Banner */}
            {latestSessionToResume && (
              <TouchableOpacity
                style={styles.resumeHeroCard}
                onPress={() => resumeSession(latestSessionToResume.sessionId)}
                activeOpacity={0.85}
              >
                <View style={styles.resumeHeroIconContainer}>
                  <Text style={styles.resumePlayEmoji}>▶️</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.resumeBadgeRow}>
                    <Text style={styles.resumeTagText}>CONTINUE WHERE YOU LEFT OFF</Text>
                    <Text style={styles.resumePercentBadge}>
                      {latestSessionToResume.overallMasteryPercentage}% Done
                    </Text>
                  </View>
                  <Text style={styles.resumeTopicTitle} numberOfLines={1}>
                    {latestSessionToResume.topicName}
                  </Text>
                  <Text style={styles.resumeSubMeta}>
                    {latestSessionToResume.subtopics.length} Sub-topics • Masterclass in progress
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.sectionDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerTitle}>
                {latestSessionToResume ? 'OR START A NEW SKILL' : 'FEATURED MASTERCLASS TRACKS'}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Masterclass Track Cards */}
            <View style={styles.tracksGrid}>
              {MASTERCLASS_TRACKS.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={[styles.trackCard, { borderLeftColor: track.accentColor }]}
                  onPress={() => startNewTopic(track.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.trackCardHeader}>
                    <View style={styles.trackTagContainer}>
                      <Text style={[styles.trackTagText, { color: track.accentColor }]}>
                        {track.tag}
                      </Text>
                    </View>
                    <View style={[styles.trackBadgePill, { borderColor: track.accentColor }]}>
                      <Text style={[styles.trackBadgeText, { color: track.accentColor }]}>
                        {track.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.trackCardTitle}>{track.title}</Text>
                  <Text style={styles.trackCardDesc} numberOfLines={2}>
                    {track.description}
                  </Text>
                  <View style={styles.trackCardFooter}>
                    <Text style={styles.trackSubtopicsCount}>5 Sub-topics • Masterclass</Text>
                    <Text style={[styles.trackActionArrow, { color: track.accentColor }]}>
                      Start →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customTopicPromptBox}>
              <Text style={styles.customTopicPromptText}>
                💡 Want to learn something else? Type any topic (e.g. "PostgreSQL WAL", "GraphQL", "Concurrency") in the bar below!
              </Text>
            </View>
          </View>
        )}

        {/* Active QBL Session: Freeform Inquiries, Active Question & Feedback Cards */}
        {session && (
          <View style={styles.sessionStreamContainer}>
            {/* 1. Free-form Discussion / Hints if user asked Teddy anything */}
            {chatMessages
              .filter(
                (msg) =>
                  msg.id.startsWith('msg_user_chat_') ||
                  msg.id.startsWith('msg_teddy_chat_')
              )
              .map((msg) => {
                const isTeddy = msg.sender === 'teddy';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.chatRow,
                      isTeddy ? styles.chatRowTeddy : styles.chatRowUser,
                    ]}
                  >
                    <View
                      style={[
                        styles.chatBubble,
                        isTeddy ? styles.chatBubbleTeddy : styles.chatBubbleUser,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chatText,
                          isTeddy ? styles.chatTextTeddy : styles.chatTextUser,
                        ]}
                      >
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                );
              })}

            {/* 2. Active Question Card (Tactical One-by-One QBL Presentation) */}
            {currentQuestion && (
              <View style={styles.questionCardContainer}>
                <View style={styles.questionCardHeader}>
                  <View style={styles.conceptPill}>
                    <SparklesIcon size={12} color="#38BDF8" style={{ marginRight: 4 }} />
                    <Text style={styles.conceptPillText}>
                      CONCEPT #{currentQuestion.conceptIndex} OF 3
                    </Text>
                  </View>
                  {currentQuestion.isReinforcement && (
                    <View style={styles.reinforcementBadge}>
                      <Text style={styles.reinforcementBadgeText}>🎯 Reinforcement Drill</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.questionScenarioText}>
                  {currentQuestion.questionText}
                </Text>

                {/* Interactive Multiple-Choice Options */}
                <View style={styles.optionsList}>
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    const hasSelected = !!selectedOptionId;
                    const isEvaluated = !!currentTurnResult;
                    const isCorrect = opt.isCorrect;

                    // When evaluated, prioritize showing the selected option and the correct option to prevent vertical overflow and overlap
                    const isRelevant = isSelected || isCorrect;
                    if (isEvaluated && !showAllOptions && !isRelevant) {
                      return null;
                    }

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Option ${opt.id}: ${opt.text}`}
                        style={[
                          styles.optionButton,
                          isEvaluated && styles.optionButtonEvaluatedCompact,
                          isSelected && styles.optionButtonSelected,
                          isEvaluated && isSelected && isCorrect && styles.optionButtonCorrect,
                          isEvaluated && isSelected && !isCorrect && styles.optionButtonWrong,
                          isEvaluated && !isSelected && isCorrect && styles.optionButtonRevealCorrect,
                          (isThinking || hasSelected) && styles.optionButtonDisabled,
                        ]}
                        onPress={() => handleOptionPress(opt.id)}
                        disabled={isThinking || hasSelected}
                        activeOpacity={0.75}
                      >
                        <View
                          style={[
                            styles.optionLetterBadge,
                            isSelected && styles.optionLetterSelected,
                            isEvaluated && isSelected && isCorrect && styles.optionLetterCorrect,
                            isEvaluated && isSelected && !isCorrect && styles.optionLetterWrong,
                            isEvaluated && !isSelected && isCorrect && styles.optionLetterRevealCorrect,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionLetterText,
                              isSelected && styles.optionLetterTextSelected,
                              isEvaluated && isSelected && (isCorrect ? styles.optionLetterTextCorrect : styles.optionLetterTextWrong),
                            ]}
                          >
                            {isEvaluated && isSelected ? (isCorrect ? '✓' : '✗') : isEvaluated && !isSelected && isCorrect ? '✓' : opt.id}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.optionContentText}>{opt.text}</Text>
                          {isEvaluated && isSelected && !isCorrect && (
                            <Text style={styles.wrongIndicatorTag}>✗ Your Choice (Incorrect)</Text>
                          )}
                          {isEvaluated && isCorrect && (
                            <Text style={styles.correctIndicatorTag}>✓ Correct Answer</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Toggle to view all options if some are hidden once evaluated */}
                  {currentTurnResult && currentQuestion.options.length > 2 && (
                    <TouchableOpacity
                      style={styles.toggleOptionsBtn}
                      onPress={() => setShowAllOptions((prev) => !prev)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.toggleOptionsBtnText}>
                        {showAllOptions
                          ? '▴ Show focused choices'
                          : `▾ View all ${currentQuestion.options.length} options`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 3. Deep Diagnostic Feedback Card (Rendered immediately below options once evaluated) */}
                {currentTurnResult && (
                  <View
                    style={[
                      styles.feedbackCard,
                      currentTurnResult.isCorrect ? styles.feedbackCardCorrect : styles.feedbackCardWrong,
                    ]}
                  >
                    <View style={styles.feedbackHeaderRow}>
                      <Text style={styles.feedbackTitleText}>
                        {currentTurnResult.isCorrect ? '🎉 SPOT ON! +25 XP' : '⚠️ CONCEPT DIAGNOSTIC'}
                      </Text>
                      <View
                        style={[
                          styles.feedbackStatusBadge,
                          currentTurnResult.isCorrect ? styles.feedbackStatusCorrect : styles.feedbackStatusWrong,
                        ]}
                      >
                        <Text style={styles.feedbackStatusBadgeText}>
                          {currentTurnResult.isCorrect ? 'Mastered ✓' : 'Trap Analyzed'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.feedbackBodyText}>{currentTurnResult.feedbackText}</Text>
                  </View>
                )}

                {/* 4. Dedicated Continue Button (Transitions to Next Concept / Drill / Subtopic) */}
                {currentTurnResult && (
                  <TouchableOpacity
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Continue to next question"
                    style={[
                      styles.continueBtn,
                      currentTurnResult.isCorrect ? styles.continueBtnCorrect : styles.continueBtnReinforce,
                    ]}
                    onPress={advanceToNextQuestion}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.continueBtnText}>
                      {currentTurnResult.isSubtopicCompleted
                        ? 'Continue to Next Sub-topic →'
                        : currentTurnResult.isCorrect
                        ? `Continue to Concept #${Math.min(3, (currentSubtopic?.conceptsMastered || 0) + 1)} →`
                        : 'Continue to Reinforcement Drill →'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 5. Masterclass 100% Completion Card */}
            {!currentQuestion && !isThinking && session.overallMasteryPercentage === 100 && (
              <View style={styles.completionCard}>
                <Text style={styles.completionEmoji}>🏆</Text>
                <Text style={styles.completionTitle}>Masterclass Complete!</Text>
                <Text style={styles.completionDesc}>
                  You have achieved 100% mastery across all {session.subtopics.length} sub-topics of "{session.topicName}"! You are ready for Staff/Principal architecture rounds!
                </Text>
                <TouchableOpacity
                  style={[styles.continueBtn, styles.continueBtnCorrect]}
                  onPress={() => setIsRoadmapVisible(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueBtnText}>Review Mastery Roadmap 🗺️</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Thinking Indicator */}
            {isThinking && (
              <View style={styles.thinkingContainer}>
                <ActivityIndicator size="small" color="#38BDF8" style={{ marginRight: 8 }} />
                <Text style={styles.thinkingLabel}>Teddy is formulating your next question...</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 4. Floating Modern Glassmorphism Input Bar */}
      <View
        style={[
          styles.inputContainer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TextInput
          style={styles.textInput}
          placeholder={
            !session
              ? 'Enter any skill, topic, or language...'
              : 'Ask Teddy a question or ask for a hint...'
          }
          placeholderTextColor="#64748B"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline={false}
          editable={!isThinking}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!inputText.trim() || isThinking) && styles.sendBtnDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isThinking}
          activeOpacity={0.8}
        >
          <SendIcon
            size={18}
            color={inputText.trim() && !isThinking ? '#07090E' : '#475569'}
          />
        </TouchableOpacity>
      </View>

      {/* 5. Sub-topic Roadmap Modal Sheet */}
      <Modal
        visible={isRoadmapVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRoadmapVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Masterclass Curriculum</Text>
                <Text style={styles.modalSubtitle}>
                  {session?.topicName} • 5+ In-Depth Sub-topics
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsRoadmapVisible(false)}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.roadmapList} showsVerticalScrollIndicator={false}>
              {session?.subtopics.map((sub, idx) => {
                const isCurrent = idx === session.currentSubtopicIndex;
                const isCompleted = sub.status === 'COMPLETED';

                return (
                  <View
                    key={sub.id}
                    style={[
                      styles.roadmapItemCard,
                      isCurrent && styles.roadmapItemCurrent,
                      isCompleted && styles.roadmapItemCompleted,
                    ]}
                  >
                    <View style={styles.roadmapItemHeader}>
                      <View
                        style={[
                          styles.roadmapIndexBadge,
                          isCompleted && styles.roadmapIndexCompleted,
                          isCurrent && styles.roadmapIndexCurrent,
                        ]}
                      >
                        <Text style={styles.roadmapIndexText}>
                          {isCompleted ? '✓' : idx + 1}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.roadmapItemTitle}>{sub.title}</Text>
                        <Text style={styles.roadmapItemDesc}>{sub.description}</Text>
                      </View>
                    </View>

                    <View style={styles.roadmapProgressRow}>
                      <View style={styles.roadmapTrack}>
                        <View
                          style={[
                            styles.roadmapFill,
                            {
                              width: `${sub.masteryPercentage}%`,
                              backgroundColor: isCompleted ? colors.successGreen : '#38BDF8',
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.roadmapMasteryText}>
                        {sub.masteryPercentage}% ({sub.conceptsMastered}/{sub.totalConcepts} concepts)
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 6. Past Sessions Picker Modal Sheet */}
      <Modal
        visible={isSessionsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSessionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Your Learning Sessions</Text>
                <Text style={styles.modalSubtitle}>
                  Resume where you left off or review past topic progress
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSessionsModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <CloseIcon size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
              {pastSessions.length === 0 ? (
                <View style={styles.emptySessionsBox}>
                  <Text style={styles.emptySessionsText}>
                    No saved sessions yet. Pick a masterclass track to build your skill mastery!
                  </Text>
                </View>
              ) : (
                pastSessions.map((s) => (
                  <TouchableOpacity
                    key={s.sessionId}
                    style={[
                      styles.sessionCard,
                      session?.sessionId === s.sessionId && styles.sessionCardActive,
                    ]}
                    onPress={() => {
                      setIsSessionsModalVisible(false);
                      resumeSession(s.sessionId);
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sessionCardTitle}>{s.topicName}</Text>
                      <Text style={styles.sessionCardMeta}>
                        {s.subtopics.length} sub-topics • Last updated{' '}
                        {new Date(s.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.sessionMasteryBadge}>
                      <Text style={styles.sessionMasteryText}>
                        {s.overallMasteryPercentage}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  topHeader: {
    backgroundColor: '#0B0F19',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#161E30',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelCardContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTeddyLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    marginRight: 8,
  },
  levelCard: {
    flex: 1,
  },
  levelBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  starBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    marginLeft: 3,
  },
  personalityTierText: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: '600',
    flex: 1,
  },
  xpFractionText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  xpTrack: {
    height: 3,
    backgroundColor: '#1C2538',
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roadmapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  roadmapBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  sessionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#202B42',
  },
  sessionsBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#131B2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#202B42',
  },
  modelStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  modelStatusText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
    marginBottom: 4,
  },
  modelProgressTrack: {
    height: 3,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  modelProgressFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  modelPercentText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 8,
    fontWeight: '700',
  },
  activeTopicBar: {
    marginTop: 8,
    backgroundColor: '#0F1420',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1C2538',
  },
  topicInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeTopicName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  overallMasteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  overallMasteryText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  subtopicProgressContainer: {},
  subtopicLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subtopicNameText: {
    color: '#94A3B8',
    fontSize: 11,
    flex: 1,
    marginRight: 6,
  },
  conceptDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conceptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#334155',
    marginRight: 4,
  },
  conceptDotMastered: {
    backgroundColor: colors.successGreen,
  },
  conceptDotCurrent: {
    backgroundColor: '#38BDF8',
  },
  subtopicMasteryText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  subtopicTrack: {
    height: 3,
    backgroundColor: '#07090E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  subtopicFill: {
    height: '100%',
  },
  companionSection: {
    backgroundColor: '#0A0E18',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#161E30',
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotHalo: {
    width: 82,
    height: 82,
    borderRadius: 20,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    overflow: 'hidden',
  },
  companionSpeechCard: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#121827',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F293D',
  },
  companionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  companionNameBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  companionNameText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emotionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  emotionSpeaking: {
    backgroundColor: 'rgba(56, 189, 248, 0.22)',
  },
  emotionCelebrating: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
  },
  emotionPuzzled: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
  },
  emotionThinking: {
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
  },
  emotionEmoji: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  companionDialogueText: {
    color: '#F1F5F9',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 8,
  },
  welcomeContainer: {},
  resumeHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101726',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    marginBottom: 8,
  },
  resumeHeroIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumePlayEmoji: {
    fontSize: 20,
  },
  resumeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  resumeTagText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resumePercentBadge: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  resumeTopicTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  resumeSubMeta: {
    color: '#94A3B8',
    fontSize: 12,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#161E30',
  },
  dividerTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    letterSpacing: 0.6,
  },
  tracksGrid: {
    gap: 10,
  },
  trackCard: {
    backgroundColor: '#0F1422',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1D273B',
    borderLeftWidth: 4,
  },
  trackCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  trackTagContainer: {},
  trackTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  trackBadgePill: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trackBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  trackCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  trackCardDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  trackCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackSubtopicsCount: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  trackActionArrow: {
    fontSize: 13,
    fontWeight: '700',
  },
  customTopicPromptBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  customTopicPromptText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  sessionStreamContainer: {
    gap: 12,
  },
  questionCardContainer: {
    backgroundColor: '#0E1524',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#1E2B45',
  },
  questionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  conceptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conceptPillText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reinforcementBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reinforcementBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
  },
  questionScenarioText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 12,
  },
  optionsList: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2C',
    borderRadius: 10,
    padding: 11,
    borderWidth: 1,
    borderColor: '#23304A',
  },
  optionButtonSelected: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  optionButtonCorrect: {
    borderColor: '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
  },
  optionButtonWrong: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
  },
  optionButtonRevealCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  optionButtonDisabled: {
    opacity: 0.65,
  },
  optionLetterBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionLetterSelected: {
    backgroundColor: '#38BDF8',
  },
  optionLetterCorrect: {
    backgroundColor: '#22C55E',
  },
  optionLetterWrong: {
    backgroundColor: '#EF4444',
  },
  optionLetterRevealCorrect: {
    backgroundColor: '#10B981',
  },
  optionLetterText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  optionLetterTextSelected: {
    color: '#07090E',
  },
  optionLetterTextCorrect: {
    color: '#07090E',
    fontWeight: '800',
  },
  optionLetterTextWrong: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  optionContentText: {
    color: '#E2E8F0',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  correctIndicatorTag: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  wrongIndicatorTag: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  optionButtonEvaluatedCompact: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  toggleOptionsBtn: {
    alignSelf: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  toggleOptionsBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  feedbackCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    marginTop: 10,
  },
  feedbackCardCorrect: {
    backgroundColor: '#063B2C',
    borderColor: '#10B981',
  },
  feedbackCardWrong: {
    backgroundColor: '#38160B',
    borderColor: '#F59E0B',
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  feedbackTitleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  feedbackStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  feedbackStatusCorrect: {
    backgroundColor: '#10B981',
  },
  feedbackStatusWrong: {
    backgroundColor: '#F59E0B',
  },
  feedbackStatusBadgeText: {
    color: '#07090E',
    fontSize: 10,
    fontWeight: '800',
  },
  feedbackBodyText: {
    color: '#F8FAFC',
    fontSize: 13,
    lineHeight: 20,
  },
  continueBtn: {
    marginTop: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnCorrect: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  continueBtnReinforce: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  continueBtnText: {
    color: '#07090E',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  completionCard: {
    backgroundColor: '#0E1524',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    marginTop: 20,
  },
  completionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  completionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionDesc: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  chatRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  chatRowTeddy: {
    justifyContent: 'flex-start',
  },
  chatRowUser: {
    justifyContent: 'flex-end',
  },
  chatBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 14,
  },
  chatBubbleTeddy: {
    backgroundColor: '#121827',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#1F293D',
  },
  chatBubbleUser: {
    backgroundColor: '#0284C7',
    borderBottomRightRadius: 4,
  },
  chatText: {
    fontSize: 13,
    lineHeight: 19,
  },
  chatTextTeddy: {
    color: '#F1F5F9',
  },
  chatTextUser: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  thinkingLabel: {
    color: '#38BDF8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#0B0F19',
    borderTopWidth: 1,
    borderTopColor: '#161E30',
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#131B2E',
    borderRadius: 21,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#23304A',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#1E293B',
    opacity: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F1422',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#1E2B45',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#161E30',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  roadmapList: {
    marginTop: 12,
  },
  roadmapItemCard: {
    backgroundColor: '#131B2C',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#223048',
  },
  roadmapItemCurrent: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  roadmapItemCompleted: {
    borderColor: colors.successGreen,
  },
  roadmapItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  roadmapIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#26344F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapIndexCurrent: {
    backgroundColor: '#38BDF8',
  },
  roadmapIndexCompleted: {
    backgroundColor: colors.successGreen,
  },
  roadmapIndexText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  roadmapItemTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  roadmapItemDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  roadmapProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  roadmapTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#07090E',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  roadmapFill: {
    height: '100%',
  },
  roadmapMasteryText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  sessionsList: {
    marginTop: 12,
  },
  emptySessionsBox: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptySessionsText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2C',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#223048',
  },
  sessionCardActive: {
    borderColor: '#38BDF8',
  },
  sessionCardTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  sessionCardMeta: {
    color: '#94A3B8',
    fontSize: 11,
  },
  sessionMasteryBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  sessionMasteryText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
});
