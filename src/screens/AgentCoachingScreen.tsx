/**
 * Agent Coaching Screen: Question-Driven Learning (QBL) Masterclass
 *
 * Studio UI/UX Edition:
 * - Precision obsidian/zinc dark surface hierarchy (#09090B / #141419 / #22222A)
 * - Uncluttered top navigation bar with direct bridge to Voice Mock Interviews & Competency Matrix
 * - Non-truncating multi-line tactile option cards with keycap badges
 * - Structured diagnostic feedback cards (Why it works/fails, Correct pattern, Key mental model)
 * - Interactive Sub-topic Curriculum Sheet & Session History Drawer
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
  SendIcon,
  CloseIcon,
  TargetIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  PlayIcon,
  ClockIcon,
  LayersIcon,
  AlertCircleIcon,
  CheckIcon,
  BulbIcon,
  TrophyIcon,
  MicIcon,
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
  modulesLabel?: string;
}

const MASTERCLASS_TRACKS: MasterclassTrack[] = [
  {
    id: 'Node.js: Zero to Hero',
    title: 'Node.js: Zero to Hero Masterclass',
    badge: 'Zero → Hero',
    description: 'Event Loop & libuv phases, V8 GC & memory, Streams backpressure, Worker Threads & security',
    accentColor: colors.notionGreen,
    tag: 'Runtime Internals',
    modulesLabel: '5 chapters • 20 modules',
  },
  {
    id: 'Distributed Systems',
    title: 'High-Scale Distributed Systems',
    badge: 'Staff / L6',
    description: 'PACELC trade-offs, Raft consensus, Byzantine resilience & p99 SLA defense',
    accentColor: colors.notionBlueLight,
    tag: 'Consensus & Scale',
  },
  {
    id: 'Kafka & Event Streaming',
    title: 'Kafka & Event Streaming',
    badge: 'Data Platform',
    description: 'Partition ISR quorums, consumer rebalancing & exactly-once semantics',
    accentColor: colors.notionPurple,
    tag: 'Event Architecture',
  },
  {
    id: 'React Native Architecture',
    title: 'React Native & Mobile Performance',
    badge: '60 FPS JSI',
    description: 'Fabric renderer, TurboModules, Hermes bytecode & offline SQLite sync',
    accentColor: colors.notionGreen,
    tag: 'Client Architecture',
  },
  {
    id: 'SQL Indexing & Sharding',
    title: 'SQL Indexing & Sharding',
    badge: 'Storage',
    description: 'B+Tree access paths, write-ahead logs (WAL), composite indexes & locks',
    accentColor: colors.notionOrange,
    tag: 'Database Internals',
  },
  {
    id: 'System Design & Microservices',
    title: 'System Design at Scale',
    badge: 'Principal',
    description: 'Probabilistic caching (XFetch), idempotence, rate limiting & circuit breakers',
    accentColor: colors.notionRed,
    tag: 'Microservices',
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
    chatMessages,
    isThinking,
    isInitializing,
    latestSessionToResume,
    modelStatus,
    mascotLevel,
    mascotXp,
    startNewTopic,
    resumeSession,
    selectOption,
    advanceToNextQuestion,
    currentTurnResult,
    selectedOptionId,
    revealedHintsCount,
    revealNextHint,
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

  useEffect(() => {
    if (currentQuestion) {
      setShowAllOptions(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (currentTurnResult) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [currentTurnResult]);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [isReviewSessionActive, currentMistakeIndex]);

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

  const formatDifficultyLabel = (diff?: string) => {
    if (diff === 'basic') return 'Foundational';
    if (diff === 'intermediate') return 'Intermediate';
    if (diff === 'advanced') return 'Advanced';
    if (diff === 'pro') return 'Staff Tier';
    return 'Core';
  };

  const getDifficultyColor = (diff?: string) => {
    if (diff === 'basic') return colors.notionGreen;
    if (diff === 'intermediate') return colors.notionYellow;
    if (diff === 'advanced') return colors.notionOrange;
    return colors.notionPurple;
  };

  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0,
    44
  ) + 6;

  return (
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={true} />

      {/* 1. Studio Top Navigation Bar */}
      <View style={[styles.topHeader, { paddingTop: topPadding }]}>
        {!session ? (
          /* Hub Header: Brand Identity + Level Progress + Quick Actions */
          <View style={styles.headerRow}>
            <View style={styles.brandCluster}>
              <Image
                source={require('../assets/images/teddy_logo.png')}
                style={styles.brandAvatar}
                resizeMode="cover"
              />
              <View style={styles.brandTextCol}>
                <View style={styles.brandTitleRow}>
                  <Text style={styles.brandTitle}>Intervity</Text>
                  <View style={styles.levelPill}>
                    <Text style={styles.levelPillText}>Lv. {mascotLevel}</Text>
                  </View>
                </View>
                <View style={styles.xpRow}>
                  <View style={styles.xpTrackMini}>
                    <View
                      style={[
                        styles.xpFillMini,
                        { width: `${Math.max(6, Math.min(100, mascotXp % 100))}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.xpMetaText}>{mascotXp % 100}/100 XP</Text>
                </View>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.mockNavBtn}
                onPress={() => navigation.navigate('Dashboard')}
                activeOpacity={0.8}
                accessibilityLabel="Voice Mock Interview Dashboard"
              >
                <MicIcon size={13} color={colors.notionBlueLight} />
                <Text style={styles.mockNavBtnText}>Mock</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setIsSessionsModalVisible(true)}
                activeOpacity={0.8}
                accessibilityLabel="Past Sessions"
              >
                <ClockIcon size={16} color={colors.textSecondary} />
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
        ) : (
          /* Active Session Header: Back to Hub + Topic Context + Curriculum & Review Actions */
          <View>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.sessionBackCluster}
                onPress={resetToTrackSelection}
                activeOpacity={0.75}
                accessibilityLabel="Back to tracks"
              >
                <View style={styles.backIconWrap}>
                  <ChevronLeftIcon size={16} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeTopicName} numberOfLines={1}>
                    {session.topicName}
                  </Text>
                  <Text style={styles.activeModuleSubtitle} numberOfLines={1}>
                    {currentSubtopic
                      ? `${currentSubtopic.chapterTitle ? `${currentSubtopic.chapterTitle} • ` : ''}Module ${session.currentSubtopicIndex + 1} of ${session.subtopics.length} • ${currentSubtopic.title}`
                      : `${session.overallMasteryPercentage}% Mastered`}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.headerActions}>
                {mistakesCount > 0 && !isReviewSessionActive && (
                  <TouchableOpacity
                    style={styles.reviewMistakesHudBtn}
                    onPress={startMistakeReview}
                    activeOpacity={0.8}
                    accessibilityLabel={`Review ${mistakesCount} mistakes`}
                  >
                    <View style={styles.reviewDot} />
                    <Text style={styles.reviewMistakesHudText}>
                      Review ({mistakesCount})
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.roadmapBtn}
                  onPress={() => setIsRoadmapVisible(true)}
                  activeOpacity={0.8}
                  accessibilityLabel="View Roadmap"
                >
                  <LayersIcon size={13} color={colors.textSecondary} />
                  <Text style={styles.roadmapBtnText}>Roadmap</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => navigation.navigate('ModelManager')}
                  activeOpacity={0.8}
                  accessibilityLabel="Settings"
                >
                  <SettingsIcon size={15} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Compact Segmented Concept Progress Bar */}
            {currentSubtopic && (currentQuestion || isReviewSessionActive) && (
              <View style={styles.segmentedProgressRow}>
                <View style={styles.segmentsWrap}>
                  {Array.from({ length: currentSubtopic.totalConcepts || 3 }, (_, idx) => idx + 1).map((step) => {
                    const isMastered = currentSubtopic.conceptsMastered >= step;
                    const isCurrent = currentSubtopic.conceptsMastered + 1 === step;
                    return (
                      <View
                        key={step}
                        style={[
                          styles.segmentTrack,
                          isMastered && styles.segmentTrackMastered,
                          !isMastered && isCurrent && styles.segmentTrackCurrent,
                        ]}
                      />
                    );
                  })}
                </View>
                <Text style={styles.segmentPercentText}>
                  {currentSubtopic.masteryPercentage}% module • {session.overallMasteryPercentage}% total
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Inline Model Download Banner */}
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
      </View>

      {/* 2. Main Content Stream (Scrollable) */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScroll}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: insets.bottom + 84 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isInitializing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.notionBlueLight} />
            <Text style={styles.loadingText}>Initializing learning engine...</Text>
          </View>
        )}

        {/* HUB VIEW: When no session is active */}
        {!session && !isThinking && (
          <View style={styles.welcomeContainer}>
            {/* Mentor Companion Hero Card */}
            <View style={styles.mentorHeroCard}>
              <View style={styles.mascotAvatarWrap}>
                <RiveMascot
                  emotion={teddyEmotion === 'speaking' ? 'idle' : teddyEmotion}
                  mascotType="teddy"
                  size={64}
                  showMascotBadge={false}
                />
              </View>
              <View style={styles.mentorHeroContent}>
                <View style={styles.mentorTitleRow}>
                  <Text style={styles.mentorNameText}>Teddy</Text>
                  <View style={styles.mentorStatusPill}>
                    <View style={styles.mentorStatusDot} />
                    <Text style={styles.mentorStatusText}>AI Mentor</Text>
                  </View>
                </View>
                <Text style={styles.mentorGreetingText}>
                  Choose an architecture track below to practice real-world engineering trade-offs, or type any custom topic.
                </Text>
              </View>
            </View>

            {/* Resume Last Session Banner */}
            {latestSessionToResume && (
              <TouchableOpacity
                style={styles.resumeHeroCard}
                onPress={() => resumeSession(latestSessionToResume.sessionId)}
                activeOpacity={0.82}
              >
                <View style={styles.resumeHeroIconContainer}>
                  <PlayIcon size={15} color={colors.notionBlueLight} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.resumeBadgeRow}>
                    <Text style={styles.resumeTagText}>Continue Session</Text>
                    <Text style={styles.resumePercentBadge}>
                      {latestSessionToResume.overallMasteryPercentage}%
                    </Text>
                  </View>
                  <Text style={styles.resumeTopicTitle} numberOfLines={1}>
                    {latestSessionToResume.topicName}
                  </Text>
                  <View style={styles.resumeMiniBarTrack}>
                    <View
                      style={[
                        styles.resumeMiniBarFill,
                        { width: `${Math.max(4, latestSessionToResume.overallMasteryPercentage)}%` },
                      ]}
                    />
                  </View>
                </View>
                <ChevronRightIcon size={16} color={colors.textTertiary} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            )}

            {/* Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Architecture Tracks</Text>
              <Text style={styles.sectionHeaderMeta}>Zero to Hero & Staff tracks</Text>
            </View>

            {/* Masterclass Track Cards */}
            <View style={styles.tracksGrid}>
              {MASTERCLASS_TRACKS.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.trackCard}
                  onPress={() => startNewTopic(track.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.trackCardHeader}>
                    <View style={styles.trackTagContainer}>
                      <View style={[styles.trackCategoryDot, { backgroundColor: track.accentColor }]} />
                      <Text style={styles.trackTagText}>{track.tag}</Text>
                    </View>
                    <View style={styles.trackBadgePill}>
                      <Text style={styles.trackBadgeText}>{track.badge}</Text>
                    </View>
                  </View>

                  <Text style={styles.trackCardTitle}>{track.title}</Text>
                  <Text style={styles.trackCardDesc} numberOfLines={2}>
                    {track.description}
                  </Text>

                  <View style={styles.trackCardFooter}>
                    <Text style={styles.trackSubtopicsCount}>
                      {track.modulesLabel || '5 modules • 15 concepts'}
                    </Text>
                    <View style={styles.trackStartAction}>
                      <Text style={styles.trackActionText}>Start</Text>
                      <ArrowRightIcon size={13} color={colors.notionBlueLight} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ACTIVE SESSION VIEW */}
        {session && (
          <View style={styles.sessionStreamContainer}>
            {/* Compact Mentor Prompt Strip (shown while pondering question, hidden during feedback to maximize space) */}
            {!currentTurnResult && !isReviewSessionActive && (
              <View style={styles.compactMentorBar}>
                <View style={styles.compactMascotWrap}>
                  <RiveMascot
                    emotion={isThinking ? 'speaking' : 'idle'}
                    mascotType="teddy"
                    size={42}
                    showMascotBadge={false}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.compactMentorLabel}>
                    {isThinking ? 'Formulating next scenario...' : 'Scenario Analysis'}
                  </Text>
                  <Text style={styles.compactMentorText} numberOfLines={1}>
                    {isThinking
                      ? 'Synthesizing engineering trade-offs and edge cases'
                      : 'Evaluate the operational constraints and select the strongest pattern.'}
                  </Text>
                </View>
              </View>
            )}

            {/* Free-form Discussion / Hints */}
            {chatMessages
              .filter(
                (msg) =>
                  msg.id.startsWith('msg_user_chat_') ||
                  msg.id.startsWith('msg_teddy_chat_') ||
                  msg.id.startsWith('msg_chat_')
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

            {/* Active Question Card */}
            {!isReviewSessionActive && currentQuestion && (
              <View style={styles.questionCardContainer}>
                <View style={styles.questionCardHeader}>
                  <View style={styles.badgeRow}>
                    <View style={styles.conceptPill}>
                      <Text style={styles.conceptPillText}>
                        Concept {currentQuestion.conceptIndex} of {currentSubtopic?.totalConcepts || 3}
                      </Text>
                    </View>
                    {currentQuestion.difficulty && (
                      <View style={styles.difficultyBadge}>
                        <View
                          style={[
                            styles.difficultyDot,
                            { backgroundColor: getDifficultyColor(currentQuestion.difficulty) },
                          ]}
                        />
                        <Text style={styles.difficultyText}>
                          {formatDifficultyLabel(currentQuestion.difficulty)}
                        </Text>
                      </View>
                    )}
                    {currentQuestion.cognitiveLevel && (
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>
                          Bloom: {currentQuestion.cognitiveLevel}
                        </Text>
                      </View>
                    )}
                  </View>
                  {currentQuestion.isReinforcement && (
                    <View style={styles.reinforcementBadge}>
                      <TargetIcon size={11} color={colors.notionOrange} />
                      <Text style={styles.reinforcementBadgeText}>Reinforcement</Text>
                    </View>
                  )}
                </View>

                {currentQuestion.learningObjective && (
                  <View style={styles.learningObjectiveBanner}>
                    <Text style={styles.learningObjectiveLabel}>Learning Objective</Text>
                    <Text style={styles.learningObjectiveText} numberOfLines={2}>
                      {currentQuestion.learningObjective}
                    </Text>
                  </View>
                )}

                <Text style={styles.questionScenarioText}>
                  {currentQuestion.questionText}
                </Text>

                {/* Interactive 3-Tier Progressive Hints (available before answering) */}
                {!currentTurnResult && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                  <View style={styles.hintsSection}>
                    {revealedHintsCount > 0 && (
                      <View style={styles.revealedHintsList}>
                        {currentQuestion.hints.slice(0, revealedHintsCount).map((hint, idx) => (
                          <View key={idx} style={styles.hintItemBox}>
                            <BulbIcon size={13} color={colors.notionYellow} style={{ marginTop: 2 }} />
                            <Text style={styles.hintItemText}>
                              <Text style={styles.hintTierLabel}>Hint {idx + 1}: </Text>
                              {hint}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {revealedHintsCount < currentQuestion.hints.length && (
                      <TouchableOpacity
                        style={styles.revealHintBtn}
                        onPress={revealNextHint}
                        activeOpacity={0.75}
                        accessibilityLabel="Reveal progressive hint"
                      >
                        <BulbIcon size={13} color={colors.notionBlueLight} />
                        <Text style={styles.revealHintBtnText}>
                          {revealedHintsCount === 0
                            ? `Need a nudge? Reveal Hint 1 of ${currentQuestion.hints.length}`
                            : `Reveal Hint ${revealedHintsCount + 1} of ${currentQuestion.hints.length}`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Interactive Multiple-Choice Options */}
                <View style={styles.optionsList}>
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    const hasSelected = !!selectedOptionId;
                    const isEvaluated = !!currentTurnResult;
                    const isCorrect = opt.isCorrect;

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
                          {isEvaluated && (isSelected || isCorrect) ? (
                            isCorrect ? (
                              <CheckIcon size={13} color="#FFFFFF" strokeWidth={2.5} />
                            ) : (
                              <CloseIcon size={13} color="#FFFFFF" strokeWidth={2.5} />
                            )
                          ) : (
                            <Text
                              style={[
                                styles.optionLetterText,
                                isSelected && styles.optionLetterTextSelected,
                              ]}
                            >
                              {opt.id}
                            </Text>
                          )}
                        </View>

                        <View style={styles.optionTextColumn}>
                          <Text style={styles.optionContentText}>{opt.text}</Text>
                          {isEvaluated && isSelected && !isCorrect && (
                            <Text style={styles.wrongIndicatorTag}>Your selection</Text>
                          )}
                          {isEvaluated && isCorrect && (
                            <Text style={styles.correctIndicatorTag}>Optimal choice</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Toggle to view all options if collapsed */}
                  {currentTurnResult && currentQuestion.options.length > 2 && (
                    <TouchableOpacity
                      style={styles.toggleOptionsBtn}
                      onPress={() => setShowAllOptions((prev) => !prev)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.toggleOptionsBtnText}>
                        {showAllOptions
                          ? 'Hide other choices'
                          : `Show all ${currentQuestion.options.length} choices`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Structured Diagnostic Breakdown Card */}
                {currentTurnResult && (
                  <View
                    style={[
                      styles.feedbackCard,
                      currentTurnResult.isCorrect ? styles.feedbackCardCorrect : styles.feedbackCardWrong,
                    ]}
                  >
                    <View style={styles.feedbackHeaderRow}>
                      <View style={styles.feedbackTitleCluster}>
                        <View
                          style={[
                            styles.feedbackIconCircle,
                            {
                              backgroundColor: currentTurnResult.isCorrect
                                ? colors.notionGreen
                                : colors.notionRed,
                            },
                          ]}
                        >
                          {currentTurnResult.isCorrect ? (
                            <CheckIcon size={12} color="#FFFFFF" strokeWidth={2.5} />
                          ) : (
                            <AlertCircleIcon size={13} color="#FFFFFF" strokeWidth={2.2} />
                          )}
                        </View>
                        <Text style={styles.feedbackTitleText}>
                          {currentTurnResult.isCorrect ? 'Correct Analysis' : 'Architectural Trap'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.feedbackStatusBadge,
                          currentTurnResult.isCorrect ? styles.feedbackStatusCorrect : styles.feedbackStatusWrong,
                        ]}
                      >
                        <Text
                          style={[
                            styles.feedbackStatusBadgeText,
                            {
                              color: currentTurnResult.isCorrect
                                ? colors.notionGreen
                                : colors.notionRed,
                            },
                          ]}
                        >
                          +{currentTurnResult.xpAwarded} XP
                        </Text>
                      </View>
                    </View>

                    {/* Why selected option works or fails */}
                    <Text style={styles.feedbackBodyText}>
                      {currentTurnResult.selectedOption.explanation}
                    </Text>

                    {/* If wrong, highlight the authoritative option explanation */}
                    {!currentTurnResult.isCorrect && (
                      <View style={styles.correctPatternCallout}>
                        <Text style={styles.correctPatternLabel}>
                          Why Option {currentTurnResult.correctOption.id} is preferred
                        </Text>
                        <Text style={styles.correctPatternBody}>
                          {currentTurnResult.correctOption.explanation}
                        </Text>
                      </View>
                    )}

                    {/* Mental Model / Takeaway */}
                    {(currentQuestion.coachingTip || currentQuestion.explanation) && (
                      <View style={styles.mentalModelBox}>
                        <BulbIcon size={15} color={colors.notionBlueLight} style={{ marginTop: 1 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.mentalModelLabel}>Key Takeaway</Text>
                          <Text style={styles.mentalModelBody}>
                            {currentQuestion.coachingTip || currentQuestion.explanation}
                          </Text>
                          {currentQuestion.sourceReference && (
                            <Text style={styles.sourceReferenceText}>
                              Source: {currentQuestion.sourceReference}
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Primary Continue Button */}
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
                        ? session.currentSubtopicIndex === session.subtopics.length - 1
                          ? 'Complete Track & View Summary'
                          : 'Continue to Next Module'
                        : currentTurnResult.isCorrect
                        ? `Continue to Concept ${Math.min(currentSubtopic?.totalConcepts || 3, (currentSubtopic?.conceptsMastered || 0) + 1)}`
                        : 'Practice Reinforcement Scenario'}
                    </Text>
                    <ArrowRightIcon size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Mistake Review Session Card */}
            {isReviewSessionActive && currentMistake && (
              <View style={styles.reviewCardContainer}>
                <View style={styles.reviewHeaderRow}>
                  <View style={styles.reviewHeaderLeft}>
                    <View style={styles.reviewTitleBadge}>
                      <AlertCircleIcon size={12} color={colors.notionRed} />
                      <Text style={styles.reviewTitleBadgeText}>Mistake Review</Text>
                    </View>
                    <View style={styles.reviewCounterBadge}>
                      <Text style={styles.reviewCounterText}>
                        {currentMistakeIndex + 1} of {sessionMistakes.length}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.reviewExitBtn}
                    onPress={exitReviewSession}
                    activeOpacity={0.7}
                  >
                    <CloseIcon size={14} color={colors.textSecondary} />
                    <Text style={styles.reviewExitBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.reviewSubtopicRow}>
                  <Text style={styles.reviewSubtopicText} numberOfLines={1}>
                    {currentMistake.conceptTitle}
                  </Text>
                  {currentMistake.difficulty && (
                    <View style={styles.difficultyBadge}>
                      <View
                        style={[
                          styles.difficultyDot,
                          { backgroundColor: getDifficultyColor(currentMistake.difficulty) },
                        ]}
                      />
                      <Text style={styles.difficultyText}>
                        {formatDifficultyLabel(currentMistake.difficulty)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.reviewQuestionBox}>
                  <Text style={styles.reviewQuestionLabel}>Scenario</Text>
                  <Text style={styles.reviewQuestionText}>{currentMistake.questionText}</Text>
                </View>

                <View style={styles.reviewTrapBox}>
                  <View style={styles.reviewBoxHeader}>
                    <Text style={styles.reviewTrapHeaderTag}>Previous Selection</Text>
                    <Text style={styles.reviewOptionLetter}>Option {currentMistake.userSelectedOption.id}</Text>
                  </View>
                  <Text style={styles.reviewOptionText}>{currentMistake.userSelectedOption.text}</Text>
                  <View style={styles.reviewDivider} />
                  <Text style={styles.reviewAutopsyLabel}>Root-Cause Gap</Text>
                  <Text style={styles.reviewAutopsyText}>
                    {currentMistake.userSelectedOption.explanation || currentMistake.feedbackText}
                  </Text>
                </View>

                <View style={styles.reviewPatternBox}>
                  <View style={styles.reviewBoxHeader}>
                    <Text style={styles.reviewPatternHeaderTag}>Recommended Pattern</Text>
                    <Text style={styles.reviewPatternLetter}>Option {currentMistake.correctOption.id}</Text>
                  </View>
                  <Text style={styles.reviewPatternText}>{currentMistake.correctOption.text}</Text>
                  <View style={styles.reviewDividerGreen} />
                  <Text style={styles.reviewPatternDetailLabel}>Engineering Rationale</Text>
                  <Text style={styles.reviewPatternDetailText}>
                    {currentMistake.correctOption.explanation}
                  </Text>
                </View>

                <View style={styles.reviewNavRow}>
                  <TouchableOpacity
                    style={[styles.reviewNavBtn, currentMistakeIndex === 0 && styles.reviewNavBtnDisabled]}
                    onPress={previousMistake}
                    disabled={currentMistakeIndex === 0}
                    activeOpacity={0.8}
                  >
                    <ChevronLeftIcon
                      size={15}
                      color={currentMistakeIndex === 0 ? colors.textTertiary : colors.textPrimary}
                    />
                    <Text
                      style={[
                        styles.reviewNavBtnText,
                        currentMistakeIndex === 0 && styles.reviewNavBtnTextDisabled,
                      ]}
                    >
                      Previous
                    </Text>
                  </TouchableOpacity>

                  {currentMistakeIndex < sessionMistakes.length - 1 ? (
                    <TouchableOpacity
                      style={[styles.reviewNavBtn, styles.reviewNavBtnPrimary]}
                      onPress={nextMistake}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.reviewNavBtnPrimaryText}>Next</Text>
                      <ChevronRightIcon size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.reviewNavBtn, styles.reviewNavBtnComplete]}
                      onPress={exitReviewSession}
                      activeOpacity={0.8}
                    >
                      <CheckIcon size={15} color="#FFFFFF" />
                      <Text style={styles.reviewNavBtnCompleteText}>Finish Review</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Masterclass 100% Completion Card */}
            {!currentQuestion && !isReviewSessionActive && !isThinking && (session.overallMasteryPercentage === 100 || session.status === 'COMPLETED') && (
              <View style={styles.completionCard}>
                <View style={styles.completionIconCircle}>
                  <TrophyIcon size={28} color={colors.notionYellow} />
                </View>
                <Text style={styles.completionTitle}>Track Completed</Text>
                <Text style={styles.completionDesc}>
                  You have mastered all {session.subtopics.length} modules of {session.topicName}.
                </Text>

                {mistakesCount > 0 && (
                  <TouchableOpacity
                    style={[styles.continueBtn, styles.reviewMistakesCompletionBtn, { width: '100%' }]}
                    onPress={startMistakeReview}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.reviewMistakesCompletionBtnText}>
                      Review {mistakesCount} Recorded Trap{mistakesCount > 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.continueBtn, styles.continueBtnCorrect, { marginTop: 10, width: '100%' }]}
                  onPress={() => setIsRoadmapVisible(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueBtnText}>View Curriculum Breakdown</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.continueBtn, styles.completionActionBtnSecondary, { marginTop: 10, width: '100%' }]}
                  onPress={resetToTrackSelection}
                  activeOpacity={0.85}
                >
                  <Text style={styles.completionActionBtnSecondaryText}>Explore Another Track</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.continueBtn, styles.completionActionBtnDashboard, { marginTop: 10, width: '100%' }]}
                  onPress={() => navigation.navigate('Dashboard')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.completionActionBtnDashboardText}>Open Competency Dashboard</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Thinking Indicator */}
            {isThinking && (
              <View style={styles.thinkingContainer}>
                <ActivityIndicator size="small" color={colors.notionBlueLight} style={{ marginRight: 10 }} />
                <Text style={styles.thinkingLabel}>Synthesizing next scenario...</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* 3. Bottom Input Bar */}
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
              ? 'Or type any custom engineering topic...'
              : 'Ask Teddy for a hint or deeper clarification...'
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
          accessibilityLabel="Send message"
        >
          <SendIcon
            size={17}
            color={inputText.trim() && !isThinking ? '#FFFFFF' : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {/* 4. Sub-topic Roadmap Modal Sheet */}
      <Modal
        visible={isRoadmapVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRoadmapVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.sheetGrabber} />
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Track Curriculum</Text>
                <Text style={styles.modalSubtitle}>
                  {session?.topicName} • {session?.subtopics.length || 5} modules
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsRoadmapVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityLabel="Close roadmap"
              >
                <CloseIcon size={18} color={colors.textSecondary} />
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
                <AlertCircleIcon size={15} color={colors.notionRed} />
                <Text style={styles.roadmapReviewMistakesText}>
                  Review {mistakesCount} Recorded Trap{mistakesCount > 1 ? 's' : ''}
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
                        {isCompleted ? (
                          <CheckIcon size={12} color="#FFFFFF" strokeWidth={2.5} />
                        ) : (
                          <Text style={styles.roadmapIndexText}>{idx + 1}</Text>
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        {sub.chapterTitle && (
                          <Text style={styles.roadmapChapterTag}>{sub.chapterTitle}</Text>
                        )}
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
                              backgroundColor: isCompleted ? colors.successGreen : colors.notionBlue,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.roadmapMasteryText}>
                        {sub.conceptsMastered}/{sub.totalConcepts} concepts ({sub.masteryPercentage}%)
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. Past Sessions Picker Modal Sheet */}
      <Modal
        visible={isSessionsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSessionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.sheetGrabber} />
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Session History</Text>
                <Text style={styles.modalSubtitle}>
                  Resume an in-progress track or review completed modules
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSessionsModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityLabel="Close session history"
              >
                <CloseIcon size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
              {pastSessions.length === 0 ? (
                <View style={styles.emptySessionsBox}>
                  <Text style={styles.emptySessionsText}>
                    No saved sessions yet. Select a track on the home screen to begin.
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
                        {s.subtopics.length} modules • Updated{' '}
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  brandAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 10,
  },
  brandTextCol: {
    flex: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  levelPill: {
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.notionBlueLight,
    fontVariant: ['tabular-nums'],
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpTrackMini: {
    width: 72,
    height: 3,
    backgroundColor: colors.cardBorder,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  xpFillMini: {
    height: '100%',
    backgroundColor: colors.notionBlue,
  },
  xpMetaText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  sessionBackCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  backIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activeTopicName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  activeModuleSubtitle: {
    color: colors.textTertiary,
    fontSize: 11,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mockNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.28)',
  },
  mockNavBtnText: {
    color: colors.notionBlueLight,
    fontSize: 12,
    fontWeight: '600',
  },
  roadmapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roadmapBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  reviewMistakesHudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.notionRedBg,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  reviewDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.notionRed,
  },
  reviewMistakesHudText: {
    color: colors.notionRed,
    fontSize: 11,
    fontWeight: '600',
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
  segmentedProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  segmentsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 12,
  },
  segmentTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
  },
  segmentTrackMastered: {
    backgroundColor: colors.notionGreen,
  },
  segmentTrackCurrent: {
    backgroundColor: colors.notionBlue,
  },
  segmentPercentText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
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
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 10,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  welcomeContainer: {
    gap: 14,
  },
  mentorHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  mascotAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.elevatedBackground,
  },
  mentorHeroContent: {
    flex: 1,
    marginLeft: 14,
  },
  mentorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  mentorNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  mentorStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.elevatedBackground,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  mentorStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.notionGreen,
    marginRight: 5,
  },
  mentorStatusText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  mentorGreetingText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  resumeHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.35)',
  },
  resumeHeroIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.notionBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  resumeTagText: {
    color: colors.notionBlueLight,
    fontSize: 11,
    fontWeight: '600',
  },
  resumePercentBadge: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  resumeTopicTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  resumeMiniBarTrack: {
    height: 3,
    backgroundColor: colors.cardBorder,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  resumeMiniBarFill: {
    height: '100%',
    backgroundColor: colors.notionBlue,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionHeaderMeta: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  tracksGrid: {
    gap: 10,
  },
  trackCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  trackCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trackTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackCategoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trackTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  trackBadgePill: {
    backgroundColor: colors.elevatedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  trackBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  trackCardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  trackCardDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  trackCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  trackSubtopicsCount: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  trackStartAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.notionBlueLight,
  },
  sessionStreamContainer: {
    gap: 12,
  },
  compactMentorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  compactMascotWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.elevatedBackground,
  },
  compactMentorLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.notionBlueLight,
    marginBottom: 1,
  },
  compactMentorText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  questionCardContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  questionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conceptPill: {
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  conceptPillText: {
    color: colors.notionBlueLight,
    fontSize: 11,
    fontWeight: '600',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.elevatedBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  difficultyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  reinforcementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.notionOrangeBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reinforcementBadgeText: {
    color: colors.notionOrange,
    fontSize: 11,
    fontWeight: '600',
  },
  questionScenarioText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: -0.1,
    marginBottom: 16,
  },
  optionsList: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.elevatedBackground,
    borderRadius: 10,
    padding: 13,
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
  optionButtonEvaluatedCompact: {
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  optionLetterBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    marginTop: 1,
  },
  optionLetterSelected: {
    backgroundColor: colors.notionBlue,
    borderColor: colors.notionBlue,
  },
  optionLetterCorrect: {
    backgroundColor: colors.notionGreen,
    borderColor: colors.notionGreen,
  },
  optionLetterWrong: {
    backgroundColor: colors.notionRed,
    borderColor: colors.notionRed,
  },
  optionLetterRevealCorrect: {
    backgroundColor: colors.notionGreen,
    borderColor: colors.notionGreen,
  },
  optionLetterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  optionLetterTextSelected: {
    color: '#FFFFFF',
  },
  optionTextColumn: {
    flex: 1,
  },
  optionContentText: {
    color: colors.textPrimary,
    fontSize: 13.5,
    lineHeight: 19,
  },
  correctIndicatorTag: {
    color: colors.notionGreen,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  wrongIndicatorTag: {
    color: colors.notionRed,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  toggleOptionsBtn: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  toggleOptionsBtnText: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  feedbackCard: {
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    marginTop: 12,
    backgroundColor: colors.elevatedBackground,
  },
  feedbackCardCorrect: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  feedbackCardWrong: {
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feedbackTitleCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackTitleText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  feedbackStatusCorrect: {
    backgroundColor: colors.notionGreenBg,
  },
  feedbackStatusWrong: {
    backgroundColor: colors.notionRedBg,
  },
  feedbackStatusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  feedbackBodyText: {
    color: colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 20,
  },
  correctPatternCallout: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.notionGreenBg,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.notionGreen,
  },
  correctPatternLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.notionGreen,
    marginBottom: 3,
  },
  correctPatternBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textPrimary,
  },
  mentalModelBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  mentalModelLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.notionBlueLight,
    marginBottom: 2,
  },
  mentalModelBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.notionBlue,
  },
  continueBtnCorrect: {
    backgroundColor: colors.notionBlue,
  },
  continueBtnReinforce: {
    backgroundColor: colors.notionBlue,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  completionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: 12,
  },
  completionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.notionYellowBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  completionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 6,
    textAlign: 'center',
  },
  completionDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  reviewMistakesCompletionBtn: {
    backgroundColor: colors.notionRedBg,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  reviewMistakesCompletionBtnText: {
    color: colors.notionRed,
    fontSize: 14,
    fontWeight: '600',
  },
  completionActionBtnSecondary: {
    backgroundColor: colors.elevatedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  completionActionBtnSecondaryText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  completionActionBtnDashboard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  completionActionBtnDashboardText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
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
    borderRadius: 10,
  },
  chatBubbleTeddy: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chatBubbleUser: {
    backgroundColor: colors.notionBlue,
  },
  chatText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  chatTextTeddy: {
    color: colors.textPrimary,
  },
  chatTextUser: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  thinkingLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.notionBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '82%',
    borderTopWidth: 1,
    borderColor: colors.cardBorder,
  },
  sheetGrabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapReviewMistakesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.notionRedBg,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  roadmapReviewMistakesText: {
    color: colors.notionRed,
    fontSize: 13,
    fontWeight: '600',
  },
  roadmapList: {
    marginTop: 14,
  },
  roadmapItemCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roadmapItemCurrent: {
    borderColor: 'rgba(79, 110, 247, 0.45)',
  },
  roadmapItemCompleted: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  roadmapItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  roadmapIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.elevatedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  roadmapIndexCurrent: {
    backgroundColor: colors.notionBlue,
    borderColor: colors.notionBlue,
  },
  roadmapIndexCompleted: {
    backgroundColor: colors.notionGreen,
    borderColor: colors.notionGreen,
  },
  roadmapIndexText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  roadmapItemTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  roadmapItemDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  roadmapProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  roadmapTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.background,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 10,
  },
  roadmapFill: {
    height: '100%',
  },
  roadmapMasteryText: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  sessionsList: {
    marginTop: 14,
  },
  emptySessionsBox: {
    paddingVertical: 32,
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
    padding: 14,
    borderRadius: 12,
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
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionCardMeta: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  sessionMasteryBadge: {
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  sessionMasteryText: {
    color: colors.notionBlueLight,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  reviewCardContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    gap: 8,
    flex: 1,
  },
  reviewTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.notionRedBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reviewTitleBadgeText: {
    color: colors.notionRed,
    fontSize: 11,
    fontWeight: '600',
  },
  reviewCounterBadge: {
    backgroundColor: colors.elevatedBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reviewCounterText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  reviewExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.elevatedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reviewExitBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  reviewSubtopicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewSubtopicText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  reviewQuestionBox: {
    backgroundColor: colors.elevatedBackground,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 10,
  },
  reviewQuestionLabel: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewQuestionText: {
    color: colors.textPrimary,
    fontSize: 13.5,
    lineHeight: 20,
  },
  reviewTrapBox: {
    backgroundColor: colors.notionRedBg,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    marginBottom: 10,
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
    fontWeight: '600',
  },
  reviewOptionLetter: {
    color: colors.notionRed,
    fontSize: 11,
    fontWeight: '600',
  },
  reviewOptionText: {
    color: colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 19,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    marginVertical: 8,
  },
  reviewAutopsyLabel: {
    color: colors.notionRed,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  reviewAutopsyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  reviewPatternBox: {
    backgroundColor: colors.notionGreenBg,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 14,
  },
  reviewPatternHeaderTag: {
    color: colors.notionGreen,
    fontSize: 11,
    fontWeight: '600',
  },
  reviewPatternLetter: {
    color: colors.notionGreen,
    fontSize: 11,
    fontWeight: '600',
  },
  reviewPatternText: {
    color: colors.textPrimary,
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 19,
  },
  reviewDividerGreen: {
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    marginVertical: 8,
  },
  reviewPatternDetailLabel: {
    color: colors.notionGreen,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  reviewPatternDetailText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  reviewNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  reviewNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.elevatedBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reviewNavBtnDisabled: {
    opacity: 0.4,
  },
  reviewNavBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: '600',
  },
  reviewNavBtnComplete: {
    backgroundColor: colors.notionGreen,
    borderColor: colors.notionGreen,
  },
  reviewNavBtnCompleteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  learningObjectiveBanner: {
    backgroundColor: colors.elevatedBackground,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginBottom: 12,
    borderLeftWidth: 2.5,
    borderLeftColor: colors.notionBlueLight,
  },
  learningObjectiveLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.notionBlueLight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  learningObjectiveText: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  hintsSection: {
    marginBottom: 14,
    gap: 8,
  },
  revealedHintsList: {
    gap: 6,
  },
  hintItemBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.notionYellowBg,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  hintTierLabel: {
    fontWeight: '700',
    color: colors.notionYellow,
  },
  hintItemText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  revealHintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.notionBlueBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.28)',
  },
  revealHintBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.notionBlueLight,
  },
  sourceReferenceText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 5,
  },
  roadmapChapterTag: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.notionBlueLight,
    marginBottom: 2,
  },
});
