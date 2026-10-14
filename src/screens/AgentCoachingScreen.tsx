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
  route?: any;
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
    accentColor: colors.notionBlueLight,
    tag: 'CONSENSUS & SCALE',
  },
  {
    id: 'Kafka & Event Streaming',
    title: 'Kafka & Event Streaming',
    badge: 'Data Platform',
    description: 'Partition ISR quorums, consumer rebalancing & exactly-once semantics',
    accentColor: colors.notionPurple,
    tag: 'EVENT ARCHITECTURE',
  },
  {
    id: 'React Native Architecture',
    title: 'React Native & Mobile Performance',
    badge: '60 FPS JSI',
    description: 'Fabric renderer, TurboModules, Hermes bytecode & offline SQLite sync',
    accentColor: colors.notionGreen,
    tag: 'CLIENT ARCHITECTURE',
  },
  {
    id: 'SQL Indexing & Sharding',
    title: 'SQL Indexing & Sharding',
    badge: 'Deep DB',
    description: 'B+Tree access paths, write-ahead logs (WAL), composite indexes & locks',
    accentColor: colors.notionOrange,
    tag: 'STORAGE ENGINES',
  },
  {
    id: 'System Design & Microservices',
    title: 'System Design at Scale',
    badge: 'Principal',
    description: 'Probabilistic caching (XFetch), idempotence, rate limiting & circuit breakers',
    accentColor: colors.notionRed,
    tag: 'MICROSERVICES',
  },
];

export const AgentCoachingScreen: React.FC<AgentCoachingScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    session,
    pastSessions,
    currentSubtopic,
    currentQuestion,
    teddyEmotion,
    teddyDialogue,
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
    isReviewSessionActive,
    sessionMistakes,
    currentMistakeIndex,
    currentMistake,
    mistakesCount,
    startMistakeReview,
    nextMistake,
    previousMistake,
    exitReviewSession,
    resetToTrackSelection,
  } = useQBLSession();

  const [inputText, setInputText] = useState('');
  const [isRoadmapVisible, setIsRoadmapVisible] = useState(false);
  const [isSessionsModalVisible, setIsSessionsModalVisible] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);

  useEffect(() => {
    if (!session) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [session]);

  useEffect(() => {
    if (route?.params?.autoStartTopic && !session && !isThinking) {
      startNewTopic(route.params.autoStartTopic);
    }
  }, [route?.params?.autoStartTopic, session, isThinking, startNewTopic]);

  useEffect(() => {
    if (route?.params?.autoSelectOption && currentQuestion && !selectedOptionId && !currentTurnResult) {
      const timer = setTimeout(() => {
        selectOption(route.params.autoSelectOption);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [route?.params?.autoSelectOption, currentQuestion, selectedOptionId, currentTurnResult, selectOption]);

  useEffect(() => {
    if (route?.params?.openRoadmap && session) {
      setIsRoadmapVisible(true);
    }
  }, [route?.params?.openRoadmap, session]);

  // When a new question arrives, ALWAYS scroll to top (y: 0) and reset option collapse so question is 100% visible
  useEffect(() => {
    if (currentQuestion) {
      setShowAllOptions(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentQuestion?.id]);

  // When turn is evaluated, smooth-scroll to reveal the feedback card and Continue button.
  // When a new question arrives (above), it always anchors strictly at top (y: 0) to show from the beginning!
  useEffect(() => {
    if (currentTurnResult) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentTurnResult]);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [isReviewSessionActive, currentMistakeIndex]);

  // Auto-scroll on free-form chat messages if session is active and no active question
  useEffect(() => {
    if (session && !currentQuestion && chatMessages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [session, chatMessages.length, currentQuestion]);

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
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={true} />

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
                  <StarIcon size={12} color={colors.notionYellow} />
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
                <TargetIcon size={14} color={colors.notionBlueLight} />
                <Text style={styles.roadmapBtnText}>Roadmap</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.sessionsBtn}
              onPress={() => setIsSessionsModalVisible(true)}
              activeOpacity={0.8}
              accessibilityLabel="Past Sessions"
            >
              <BrainIcon size={15} color={colors.textSecondary} />
              <Text style={styles.sessionsBtnText}>Sessions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('ModelManager')}
              activeOpacity={0.8}
              accessibilityLabel="Settings"
            >
              <SettingsIcon size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inline Model Download Banner (Only displayed if actively downloading) */}
        {modelStatus.isDownloading && (
          <View style={styles.modelStatusBanner}>
            <ActivityIndicator size="small" color={colors.notionBlue} style={{ marginRight: 8 }} />
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
        {session && currentSubtopic && (currentQuestion || isReviewSessionActive) && (
          <View style={styles.activeTopicBar}>

            <View style={styles.topicInfoRow}>
              <Text style={styles.activeTopicName} numberOfLines={1}>
                {session.topicName}
              </Text>
              <View style={styles.headerRightBadges}>
                <View style={styles.overallMasteryBadge}>
                  <SparklesIcon size={11} color={colors.notionBlueLight} style={{ marginRight: 4 }} />
                  <Text style={styles.overallMasteryText}>
                    {session.overallMasteryPercentage}% Skill Mastered
                  </Text>
                </View>
                {mistakesCount > 0 && !isReviewSessionActive && (
                  <TouchableOpacity
                    style={styles.reviewMistakesHudBtn}
                    onPress={startMistakeReview}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reviewMistakesHudText}>
                      🔍 Review ({mistakesCount})
                    </Text>
                  </TouchableOpacity>
                )}
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
                          : colors.notionBlue,
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
                  !isThinking && isReviewSessionActive && styles.emotionPuzzled,
                  !isThinking && !isReviewSessionActive && teddyEmotion === 'celebrating' && styles.emotionCelebrating,
                  !isThinking && !isReviewSessionActive && teddyEmotion === 'puzzled' && styles.emotionPuzzled,
                ]}
              >
                <Text style={styles.emotionEmoji}>
                  {isThinking
                    ? '🎙️ Formulating...'
                    : isReviewSessionActive
                    ? '🔍 Reviewing Traps'
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
                : isReviewSessionActive
                ? (teddyDialogue.split('\n')[0] || 'Let\'s analyze the traps and solidify your mental model! 🔍')
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
            <ActivityIndicator size="large" color={colors.notionBlue} />
            <Text style={styles.loadingText}>Waking up Teddy...</Text>
          </View>
        )}

        {/* Welcome / Choice State: When no session is active */}
        {!session && !isThinking && (
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
            {!isReviewSessionActive && currentQuestion && (
              <View style={styles.questionCardContainer}>
                <View style={styles.questionCardHeader}>
                  <View style={styles.badgeRow}>
                    <View style={styles.conceptPill}>
                      <SparklesIcon size={12} color={colors.notionBlueLight} style={{ marginRight: 4 }} />
                      <Text style={styles.conceptPillText}>
                        CONCEPT #{currentQuestion.conceptIndex} OF 3
                      </Text>
                    </View>
                    {currentQuestion.difficulty && (
                      <View
                        style={[
                          styles.difficultyBadge,
                          currentQuestion.difficulty === 'basic' && styles.difficultyBadgeBasic,
                          currentQuestion.difficulty === 'intermediate' && styles.difficultyBadgeIntermediate,
                          currentQuestion.difficulty === 'advanced' && styles.difficultyBadgeAdvanced,
                          currentQuestion.difficulty === 'pro' && styles.difficultyBadgePro,
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyText,
                            currentQuestion.difficulty === 'basic' && styles.difficultyTextBasic,
                            currentQuestion.difficulty === 'intermediate' && styles.difficultyTextIntermediate,
                            currentQuestion.difficulty === 'advanced' && styles.difficultyTextAdvanced,
                            currentQuestion.difficulty === 'pro' && styles.difficultyTextPro,
                          ]}
                        >
                          {currentQuestion.difficulty === 'basic'
                            ? '🟢 BASIC'
                            : currentQuestion.difficulty === 'intermediate'
                            ? '🟡 INTERMEDIATE'
                            : currentQuestion.difficulty === 'advanced'
                            ? '🟠 ADVANCED'
                            : '🟣 PRO'}
                        </Text>
                      </View>
                    )}
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
                        ? (session.currentSubtopicIndex === session.subtopics.length - 1
                          ? '🏆 Complete Masterclass & View Results →'
                          : 'Continue to Next Sub-topic →')
                        : currentTurnResult.isCorrect
                        ? `Continue to Concept #${Math.min(3, (currentSubtopic?.conceptsMastered || 0) + 1)} →`
                        : 'Continue to Reinforcement Drill →'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 3. Mistake Review Session Card */}
            {isReviewSessionActive && currentMistake && (
              <View style={styles.reviewCardContainer}>
                {/* Header */}
                <View style={styles.reviewHeaderRow}>
                  <View style={styles.reviewHeaderLeft}>
                    <View style={styles.reviewTitleBadge}>
                      <Text style={styles.reviewTitleBadgeText}>🔍 MISTAKE AUTOPSY & REVIEW</Text>
                    </View>
                    <View style={styles.reviewCounterBadge}>
                      <Text style={styles.reviewCounterText}>
                        Trap {currentMistakeIndex + 1} of {sessionMistakes.length}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.reviewExitBtn}
                    onPress={exitReviewSession}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reviewExitBtnText}>✕ Exit Review</Text>
                  </TouchableOpacity>
                </View>

                {/* Subtopic & Difficulty */}
                <View style={styles.reviewSubtopicRow}>
                  <Text style={styles.reviewSubtopicText} numberOfLines={1}>
                    {currentMistake.conceptTitle}
                  </Text>
                  {currentMistake.difficulty && (
                    <View
                      style={[
                        styles.difficultyBadge,
                        currentMistake.difficulty === 'basic' && styles.difficultyBadgeBasic,
                        currentMistake.difficulty === 'intermediate' && styles.difficultyBadgeIntermediate,
                        currentMistake.difficulty === 'advanced' && styles.difficultyBadgeAdvanced,
                        currentMistake.difficulty === 'pro' && styles.difficultyBadgePro,
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyText,
                          currentMistake.difficulty === 'basic' && styles.difficultyTextBasic,
                          currentMistake.difficulty === 'intermediate' && styles.difficultyTextIntermediate,
                          currentMistake.difficulty === 'advanced' && styles.difficultyTextAdvanced,
                          currentMistake.difficulty === 'pro' && styles.difficultyTextPro,
                        ]}
                      >
                        {currentMistake.difficulty === 'basic'
                          ? '🟢 BASIC'
                          : currentMistake.difficulty === 'intermediate'
                          ? '🟡 INTERMEDIATE'
                          : currentMistake.difficulty === 'advanced'
                          ? '🟠 ADVANCED'
                          : '🟣 PRO'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* The Challenging Question Scenario */}
                <View style={styles.reviewQuestionBox}>
                  <Text style={styles.reviewQuestionLabel}>THE CHALLENGE SCENARIO</Text>
                  <Text style={styles.reviewQuestionText}>{currentMistake.questionText}</Text>
                </View>

                {/* The Trap (Candidate's Choice) */}
                <View style={styles.reviewTrapBox}>
                  <View style={styles.reviewBoxHeader}>
                    <Text style={styles.reviewTrapHeaderTag}>❌ YOUR TRAP CHOICE</Text>
                    <Text style={styles.reviewOptionLetter}>Option {currentMistake.userSelectedOption.id}</Text>
                  </View>
                  <Text style={styles.reviewOptionText}>{currentMistake.userSelectedOption.text}</Text>
                  <View style={styles.reviewDivider} />
                  <Text style={styles.reviewAutopsyLabel}>WHY THIS FAILED (AUTOPSY):</Text>
                  <Text style={styles.reviewAutopsyText}>
                    {currentMistake.userSelectedOption.explanation || currentMistake.feedbackText}
                  </Text>
                </View>

                {/* Authoritative Pattern (Correct Answer) */}
                <View style={styles.reviewPatternBox}>
                  <View style={styles.reviewBoxHeader}>
                    <Text style={styles.reviewPatternHeaderTag}>✓ AUTHORITATIVE PATTERN</Text>
                    <Text style={styles.reviewPatternLetter}>Option {currentMistake.correctOption.id}</Text>
                  </View>
                  <Text style={styles.reviewPatternText}>{currentMistake.correctOption.text}</Text>
                  <View style={styles.reviewDividerGreen} />
                  <Text style={styles.reviewPatternDetailLabel}>CORRECT MENTAL MODEL:</Text>
                  <Text style={styles.reviewPatternDetailText}>
                    {currentMistake.correctOption.explanation}
                  </Text>
                </View>

                {/* Navigation Action Buttons */}
                <View style={styles.reviewNavRow}>
                  <TouchableOpacity
                    style={[styles.reviewNavBtn, currentMistakeIndex === 0 && styles.reviewNavBtnDisabled]}
                    onPress={previousMistake}
                    disabled={currentMistakeIndex === 0}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.reviewNavBtnText, currentMistakeIndex === 0 && styles.reviewNavBtnTextDisabled]}>
                      ← Previous Trap
                    </Text>
                  </TouchableOpacity>

                  {currentMistakeIndex < sessionMistakes.length - 1 ? (
                    <TouchableOpacity
                      style={[styles.reviewNavBtn, styles.reviewNavBtnPrimary]}
                      onPress={nextMistake}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.reviewNavBtnPrimaryText}>Next Trap →</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.reviewNavBtn, styles.reviewNavBtnComplete]}
                      onPress={exitReviewSession}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.reviewNavBtnCompleteText}>Finish Review 🎉</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* 4. Masterclass 100% Completion Card */}
            {!currentQuestion && !isReviewSessionActive && !isThinking && (session.overallMasteryPercentage === 100 || session.status === 'COMPLETED') && (
              <View style={styles.completionCard}>
                <Text style={styles.completionEmoji}>🏆</Text>
                <Text style={styles.completionTitle}>Masterclass Complete!</Text>
                <Text style={styles.completionDesc}>
                  You have achieved 100% mastery across all {session.subtopics.length} sub-topics of "{session.topicName}"! You are ready for Staff/Principal architecture rounds!
                </Text>
                {mistakesCount > 0 && (
                  <TouchableOpacity
                    style={[styles.continueBtn, styles.reviewMistakesCompletionBtn]}
                    onPress={startMistakeReview}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.reviewMistakesCompletionBtnText}>
                      🔍 Review {mistakesCount} Traps & Mistakes
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.continueBtn, styles.continueBtnCorrect, { marginTop: 10 }]}
                  onPress={() => setIsRoadmapVisible(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueBtnText}>Review Mastery Roadmap 🗺️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.continueBtn, styles.completionActionBtnSecondary, { marginTop: 10 }]}
                  onPress={resetToTrackSelection}
                  activeOpacity={0.85}
                >
                  <Text style={styles.completionActionBtnSecondaryText}>Start Another Masterclass 🚀</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.continueBtn, styles.completionActionBtnDashboard, { marginTop: 10 }]}
                  onPress={() => navigation.navigate('Dashboard')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.completionActionBtnDashboardText}>Back to Dashboard 🏠</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Thinking Indicator */}
            {isThinking && (
              <View style={styles.thinkingContainer}>
                <ActivityIndicator size="small" color={colors.notionBlue} style={{ marginRight: 8 }} />
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
          placeholderTextColor={colors.textTertiary}
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
            color={inputText.trim() && !isThinking ? '#FFFFFF' : colors.textTertiary}
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
                <CloseIcon size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {mistakesCount > 0 && (
              <TouchableOpacity
                style={styles.roadmapReviewMistakesBtn}
                onPress={() => {
                  setIsRoadmapVisible(false);
                  startMistakeReview();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.roadmapReviewMistakesText}>
                  🔍 Review All Mistakes & Traps ({mistakesCount})
                </Text>
              </TouchableOpacity>
            )}

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
                              backgroundColor: isCompleted ? colors.successGreen : colors.notionBlueLight,
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
                <CloseIcon size={20} color={colors.textSecondary} />
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
    backgroundColor: colors.background,
  },
  topHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
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
    borderColor: colors.notionBlue,
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
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  starBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.notionBlueLight,
    marginLeft: 3,
  },
  personalityTierText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  xpFractionText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  xpTrack: {
    height: 3,
    backgroundColor: colors.cardBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.notionBlue,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roadmapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.notionBlue,
  },
  roadmapBtnText: {
    color: colors.notionBlueLight,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  sessionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sessionsBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modelStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modelStatusText: {
    fontSize: 11,
    color: colors.notionBlueLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  modelProgressTrack: {
    height: 3,
    backgroundColor: colors.surfaceHover,
    borderRadius: 2,
    overflow: 'hidden',
  },
  modelProgressFill: {
    height: '100%',
    backgroundColor: colors.notionBlue,
  },
  modelPercentText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '700',
  },
  activeTopicBar: {
    marginTop: 8,
    backgroundColor: colors.cardBackground,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  topicInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeTopicName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  overallMasteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  overallMasteryText: {
    color: colors.notionBlueLight,
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
    color: colors.textSecondary,
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
    backgroundColor: colors.cardBorder,
    marginRight: 4,
  },
  conceptDotMastered: {
    backgroundColor: colors.notionGreen,
  },
  conceptDotCurrent: {
    backgroundColor: colors.notionBlue,
  },
  subtopicMasteryText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  subtopicTrack: {
    height: 3,
    backgroundColor: colors.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  subtopicFill: {
    height: '100%',
  },
  companionSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotHalo: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  companionSpeechCard: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: colors.cardBackground,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  companionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  companionNameBadge: {
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  companionNameText: {
    color: colors.notionBlueLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emotionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.surfaceHover,
  },
  emotionSpeaking: {
    backgroundColor: colors.notionBlueBg,
  },
  emotionCelebrating: {
    backgroundColor: colors.notionGreenBg,
  },
  emotionPuzzled: {
    backgroundColor: colors.notionYellowBg,
  },
  emotionThinking: {
    backgroundColor: colors.notionPurpleBg,
  },
  emotionEmoji: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  companionDialogueText: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  mainScroll: {
    flex: 1,
    overflow: 'hidden',
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
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },
  welcomeContainer: {},
  resumeHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.notionBlue,
    marginBottom: 8,
  },
  resumeHeroIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.notionBlueBg,
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
    color: colors.notionBlueLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resumePercentBadge: {
    color: colors.notionBlueLight,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  resumeTopicTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  resumeSubMeta: {
    color: colors.textSecondary,
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
    backgroundColor: colors.divider,
  },
  dividerTitle: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    letterSpacing: 0.6,
  },
  tracksGrid: {
    gap: 10,
  },
  trackCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  trackCardDesc: {
    color: colors.textSecondary,
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
    color: colors.textTertiary,
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
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  customTopicPromptText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  sessionStreamContainer: {
    gap: 12,
  },
  questionCardContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conceptPillText: {
    color: colors.notionBlueLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reinforcementBadge: {
    backgroundColor: colors.notionOrangeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reinforcementBadgeText: {
    color: colors.notionOrange,
    fontSize: 10,
    fontWeight: '700',
  },
  questionScenarioText: {
    color: colors.textPrimary,
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
    backgroundColor: colors.surfaceHover,
    borderRadius: 8,
    padding: 11,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  optionButtonSelected: {
    borderColor: colors.notionBlue,
    backgroundColor: colors.notionBlueBg,
  },
  optionButtonCorrect: {
    borderColor: colors.notionGreen,
    backgroundColor: colors.notionGreenBg,
  },
  optionButtonWrong: {
    borderColor: colors.notionRed,
    backgroundColor: colors.notionRedBg,
  },
  optionButtonRevealCorrect: {
    borderColor: colors.notionGreen,
    backgroundColor: colors.notionGreenBg,
  },
  optionButtonDisabled: {
    opacity: 0.65,
  },
  optionLetterBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optionLetterSelected: {
    backgroundColor: colors.notionBlue,
  },
  optionLetterCorrect: {
    backgroundColor: colors.notionGreen,
  },
  optionLetterWrong: {
    backgroundColor: colors.notionRed,
  },
  optionLetterRevealCorrect: {
    backgroundColor: colors.notionGreen,
  },
  optionLetterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  optionLetterTextSelected: {
    color: '#FFFFFF',
  },
  optionLetterTextCorrect: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  optionLetterTextWrong: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  optionContentText: {
    color: colors.textPrimary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  correctIndicatorTag: {
    color: colors.notionGreen,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  wrongIndicatorTag: {
    color: colors.notionRed,
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
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  feedbackCard: {
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  feedbackCardCorrect: {
    backgroundColor: colors.notionGreenBg,
    borderColor: colors.notionGreen,
  },
  feedbackCardWrong: {
    backgroundColor: colors.notionRedBg,
    borderColor: colors.notionRed,
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  feedbackTitleText: {
    color: colors.textPrimary,
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
    backgroundColor: colors.notionGreen,
  },
  feedbackStatusWrong: {
    backgroundColor: colors.notionRed,
  },
  feedbackStatusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  feedbackBodyText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
  },
  continueBtn: {
    marginTop: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.notionBlue,
  },
  continueBtnCorrect: {
    backgroundColor: colors.notionGreen,
  },
  continueBtnReinforce: {
    backgroundColor: colors.notionOrange,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  completionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.notionBlue,
    marginTop: 20,
  },
  completionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  completionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  completionActionBtnSecondary: {
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.notionBlue,
  },
  completionActionBtnSecondaryText: {
    color: colors.notionBlueLight,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  completionActionBtnDashboard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  completionActionBtnDashboardText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
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
    borderRadius: 8,
  },
  chatBubbleTeddy: {
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chatBubbleUser: {
    backgroundColor: colors.notionBlue,
    borderBottomRightRadius: 2,
  },
  chatText: {
    fontSize: 13,
    lineHeight: 19,
  },
  chatTextTeddy: {
    color: colors.textPrimary,
  },
  chatTextUser: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  thinkingLabel: {
    color: colors.notionBlueLight,
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.notionBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: colors.surfaceHover,
    opacity: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: colors.textSecondary,
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
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roadmapItemCurrent: {
    borderColor: colors.notionBlue,
    backgroundColor: colors.notionBlueBg,
  },
  roadmapItemCompleted: {
    borderColor: colors.notionGreen,
  },
  roadmapItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  roadmapIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapIndexCurrent: {
    backgroundColor: colors.notionBlue,
  },
  roadmapIndexCompleted: {
    backgroundColor: colors.notionGreen,
  },
  roadmapIndexText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  roadmapItemTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  roadmapItemDesc: {
    color: colors.textSecondary,
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
    backgroundColor: colors.background,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  roadmapFill: {
    height: '100%',
  },
  roadmapMasteryText: {
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sessionCardActive: {
    borderColor: colors.notionBlue,
  },
  sessionCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  sessionCardMeta: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  sessionMasteryBadge: {
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  sessionMasteryText: {
    color: colors.notionBlueLight,
    fontSize: 12,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
    borderWidth: 1,
  },
  difficultyBadgeBasic: {
    backgroundColor: colors.notionGreenBg,
    borderColor: colors.notionGreen,
  },
  difficultyBadgeIntermediate: {
    backgroundColor: colors.notionYellowBg,
    borderColor: colors.notionYellow,
  },
  difficultyBadgeAdvanced: {
    backgroundColor: colors.notionOrangeBg,
    borderColor: colors.notionOrange,
  },
  difficultyBadgePro: {
    backgroundColor: colors.notionPurpleBg,
    borderColor: colors.notionPurple,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  difficultyTextBasic: {
    color: colors.notionGreen,
  },
  difficultyTextIntermediate: {
    color: colors.notionYellow,
  },
  difficultyTextAdvanced: {
    color: colors.notionOrange,
  },
  difficultyTextPro: {
    color: colors.notionPurple,
  },
  reviewCardContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.notionRed,
    marginBottom: 16,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  reviewTitleBadge: {
    backgroundColor: colors.notionRedBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.notionRed,
  },
  reviewTitleBadgeText: {
    color: colors.notionRed,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reviewCounterBadge: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewCounterText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  reviewExitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reviewExitBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  reviewSubtopicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewSubtopicText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  reviewQuestionBox: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reviewQuestionLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reviewQuestionText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  reviewTrapBox: {
    backgroundColor: colors.notionRedBg,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.notionRed,
  },
  reviewBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewTrapHeaderTag: {
    color: colors.notionRed,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reviewOptionLetter: {
    color: colors.notionRed,
    fontSize: 11,
    fontWeight: '700',
  },
  reviewOptionText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 10,
  },
  reviewAutopsyLabel: {
    color: colors.notionRed,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reviewAutopsyText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  reviewPatternBox: {
    backgroundColor: colors.notionGreenBg,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.notionGreen,
  },
  reviewPatternHeaderTag: {
    color: colors.notionGreen,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reviewPatternLetter: {
    color: colors.notionGreen,
    fontSize: 11,
    fontWeight: '700',
  },
  reviewPatternText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  reviewDividerGreen: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 10,
  },
  reviewPatternDetailLabel: {
    color: colors.notionGreen,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reviewPatternDetailText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  reviewNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  reviewNavBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHover,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reviewNavBtnDisabled: {
    opacity: 0.4,
  },
  reviewNavBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewNavBtnTextDisabled: {
    color: colors.textTertiary,
  },
  reviewNavBtnPrimary: {
    backgroundColor: colors.notionBlue,
    borderColor: colors.notionBlue,
  },
  reviewNavBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewNavBtnComplete: {
    backgroundColor: colors.notionGreen,
    borderColor: colors.notionGreen,
  },
  reviewNavBtnCompleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewMistakesHudBtn: {
    backgroundColor: colors.notionRedBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: colors.notionRed,
  },
  reviewMistakesHudText: {
    color: colors.notionRed,
    fontSize: 11,
    fontWeight: '700',
  },
  headerRightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roadmapReviewMistakesBtn: {
    backgroundColor: colors.notionRedBg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.notionRed,
  },
  roadmapReviewMistakesText: {
    color: colors.notionRed,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewMistakesCompletionBtn: {
    backgroundColor: colors.notionRedBg,
    borderColor: colors.notionRed,
    marginTop: 12,
  },
  reviewMistakesCompletionBtnText: {
    color: colors.notionRed,
    fontSize: 14,
    fontWeight: '700',
  },
});
