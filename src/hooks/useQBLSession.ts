/**
 * useQBLSession Hook
 * 
 * Orchestrates the Question-Driven Learning (QBL) session lifecycle:
 * - App launch check for previous sessions
 * - Resume previous session vs Start new skill
 * - Agent 5+ sub-topic planning
 * - 4-option multiple choice presentation
 * - Instant error analysis (why wrong + correct answer + mental model)
 * - 100% subtopic mastery gate (3 concepts mastered)
 * - Teddy mascot emotions (celebrating, puzzled, thinking, speaking)
 * - Pure text-first loop (zero STT / zero TTS)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { QBLEngine } from '../core/qbl/QBLEngine';
import { ModelAssetManager } from '../core/models/ModelAssetManager';
import { SQLiteClient } from '../database/SQLiteClient';
import {
  QBLSession,
  QBLSubtopic,
  QBLQuestion,
  QBLTurnResult,
  QBLMistakeReviewItem,
} from '../types';


export interface QBLChatMessage {
  id: string;
  sender: 'teddy' | 'user';
  text: string;
  timestamp: number;
  question?: QBLQuestion;
  selectedOptionId?: string;
  isCorrect?: boolean;
  isFeedback?: boolean;
  subtopicTitle?: string;
  subtopicMastery?: number;
}

export function useQBLSession() {
  const [session, setSession] = useState<QBLSession | null>(null);
  const [pastSessions, setPastSessions] = useState<QBLSession[]>([]);
  const [currentSubtopic, setCurrentSubtopic] = useState<QBLSubtopic | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QBLQuestion | null>(null);
  const [currentTurnResult, setCurrentTurnResult] = useState<QBLTurnResult | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [teddyEmotion, setTeddyEmotion] = useState<'idle' | 'speaking' | 'thinking' | 'celebrating' | 'puzzled'>('idle');
  const [teddyDialogue, setTeddyDialogue] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<QBLChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [latestSessionToResume, setLatestSessionToResume] = useState<QBLSession | null>(null);
  const [sessionMistakes, setSessionMistakes] = useState<QBLMistakeReviewItem[]>([]);
  const [currentMistakeIndex, setCurrentMistakeIndex] = useState<number>(0);
  const [isReviewSessionActive, setIsReviewSessionActive] = useState<boolean>(false);

  // Model Asset Status
  const [modelStatus, setModelStatus] = useState<{
    isReady: boolean;
    isDownloading: boolean;
    progress: number;
    statusText: string;
  }>({
    isReady: true,
    isDownloading: false,
    progress: 100,
    statusText: 'Teddy is ready to learn!',
  });

  // Mascot Progression
  const [mascotLevel, setMascotLevel] = useState<number>(1);
  const [mascotXp, setMascotXp] = useState<number>(0);
  const [mascotTier, setMascotTier] = useState<string>('Warm Friend & Coding Buddy');

  const qblEngine = useRef(new QBLEngine());

  // 1. Initial Boot & Past Session Discovery
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        setIsInitializing(true);
        await SQLiteClient.getInstance().initialize();

        // Check LLM model readiness
        const assetManager = ModelAssetManager.getInstance();
        const miniCpm = assetManager.getModel('minicpm5_2b');
        if (miniCpm && miniCpm.isDownloading) {
          setModelStatus({
            isReady: false,
            isDownloading: true,
            progress: Math.round((miniCpm.downloadedBytes / miniCpm.sizeBytes) * 100) || 0,
            statusText: 'Teddy is getting his thinking cap ready...',
          });
        } else {
          setModelStatus({
            isReady: true,
            isDownloading: false,
            progress: 100,
            statusText: 'Teddy is ready to learn!',
          });
        }

        assetManager.subscribeProgress((models) => {
          const m = models.find((item) => item.id === 'minicpm5_2b');
          if (m && isMounted) {
            const pct = Math.round((m.downloadedBytes / m.sizeBytes) * 100);
            setModelStatus({
              isReady: m.isDownloaded || !m.isDownloading,
              isDownloading: m.isDownloading,
              progress: pct,
              statusText: m.isDownloaded
                ? 'Teddy is ready to learn!'
                : 'Teddy is getting his thinking cap ready...',
            });
          }
        });


        // Fetch past sessions from SQLite
        const allSessions = await qblEngine.current.getAllSessions();
        const latest = await qblEngine.current.getLatestSession();

        if (isMounted) {
          setPastSessions(allSessions);
          setLatestSessionToResume(latest);

          // Initial greeting from Teddy
          if (latest) {
            const greeting = `Hey there! Welcome back! 😊\n\nDo you want to continue your last session on "${latest.topicName}" (${latest.overallMasteryPercentage}% complete), or would you like to master a brand new skill?`;
            setTeddyDialogue(greeting);
            setTeddyEmotion('idle');
            setChatMessages([
              {
                id: `msg_init_${Date.now()}`,
                sender: 'teddy',
                text: greeting,
                timestamp: Date.now(),
              },
            ]);
          } else {
            const greeting = `Hey friend! I'm Teddy, your learning buddy! 🐻\n\nWhat skill or topic would you like to master today? Tell me below, or pick one of the suggestions!`;
            setTeddyDialogue(greeting);
            setTeddyEmotion('idle');
            setChatMessages([
              {
                id: `msg_init_${Date.now()}`,
                sender: 'teddy',
                text: greeting,
                timestamp: Date.now(),
              },
            ]);
          }
          setIsInitializing(false);
        }
      } catch (err) {
        console.warn('[useQBLSession] Init error:', err);
        if (isMounted) setIsInitializing(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Start a New Topic Flow
  const startNewTopic = useCallback(async (topicName: string) => {
    if (!topicName.trim()) return;

    setIsThinking(true);
    setTeddyEmotion('speaking'); // Teddy talks while LLM is generating output
    const userMsgText = `Let's learn: ${topicName.trim()}`;

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        sender: 'user',
        text: userMsgText,
        timestamp: Date.now(),
      },
    ]);

    const planningText = `Awesome topic! Let me break "${topicName.trim()}" down into a 5+ sub-topic masterclass roadmap... 🗺️`;
    setTeddyDialogue(planningText);

    try {
      const newSession = await qblEngine.current.createNewSession(topicName.trim());
      setSession(newSession);
      setLatestSessionToResume(newSession);
      const allSessions = await qblEngine.current.getAllSessions();
      setPastSessions(allSessions);
      setSessionMistakes([]);
      setCurrentMistakeIndex(0);
      setIsReviewSessionActive(false);

      const firstSubtopic = newSession.subtopics[0];
      setCurrentSubtopic(firstSubtopic);

      const introText = `Here is our masterclass roadmap for "${topicName.trim()}"! We'll cover 5 in-depth sub-topics step-by-step.\n\nLet's start with Sub-topic 1: "${firstSubtopic.title}"! Here is your first question to test concept 1:`;
      setTeddyDialogue(introText);

      // Generate question for concept 1
      const q1 = await qblEngine.current.generateQuestion(newSession.topicName, firstSubtopic, 1, false);
      setCurrentQuestion(q1);
      setTeddyEmotion('idle'); // Question is ready, Teddy stops talking!

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_plan_${Date.now()}`,
          sender: 'teddy',
          text: introText,
          timestamp: Date.now(),
          subtopicTitle: firstSubtopic.title,
          subtopicMastery: 0,
        },
        {
          id: `msg_q_${Date.now()}`,
          sender: 'teddy',
          text: q1.questionText,
          timestamp: Date.now(),
          question: q1,
          subtopicTitle: firstSubtopic.title,
        },
      ]);
    } catch (err) {
      console.warn('[useQBLSession] startNewTopic error:', err);
    } finally {
      setIsThinking(false);
      setTeddyEmotion('idle');
    }
  }, []);

  // 3. Resume Previous Session Flow
  const resumeSession = useCallback(async (targetSessionId: string) => {
    setIsThinking(true);
    setTeddyEmotion('speaking'); // Teddy talks while LLM is generating output

    try {
      const loaded = await qblEngine.current.resumeSession(targetSessionId);
      if (!loaded) return;

      setSession(loaded);
      const pastMistakes = await qblEngine.current.getMistakesForSession(loaded.sessionId);
      setSessionMistakes(pastMistakes);
      setCurrentMistakeIndex(0);
      setIsReviewSessionActive(false);

      // Check if session is already completed to avoid getting stuck in a loop on the last question!
      const isCompleted =
        loaded.status === 'COMPLETED' ||
        loaded.overallMasteryPercentage === 100 ||
        (loaded.subtopics.length > 0 && loaded.subtopics.every((s) => s.status === 'COMPLETED' || s.masteryPercentage === 100));

      if (isCompleted) {
        loaded.currentSubtopicIndex = loaded.subtopics.length - 1;
        const lastSub = loaded.subtopics[loaded.subtopics.length - 1];
        setCurrentSubtopic(lastSub);
        setCurrentQuestion(null);
        setSelectedOptionId(null);
        setCurrentTurnResult(null);

        if (pastMistakes.length > 0) {
          const reviewMsg = `🏆 Resuming completed masterclass on "${loaded.topicName}"!\n\nReviewing ${pastMistakes.length} tricky trap${pastMistakes.length > 1 ? 's' : ''} to solidify your mental models! 🔍`;
          setTeddyDialogue(reviewMsg);
          setTeddyEmotion('puzzled');
          setIsReviewSessionActive(true);
        } else {
          const completeMsg = `🏆 Welcome back! You have 100% completed all ${loaded.subtopics.length} sub-topics of "${loaded.topicName}" with zero mistakes! You are an elite architect! 🌟`;
          setTeddyDialogue(completeMsg);
          setTeddyEmotion('celebrating');
        }
        return;
      }

      // Find first uncompleted subtopic, or default to last subtopic
      let activeSubIndex = loaded.subtopics.findIndex((s) => s.status !== 'COMPLETED');
      if (activeSubIndex === -1) activeSubIndex = loaded.subtopics.length - 1;

      loaded.currentSubtopicIndex = activeSubIndex;
      const activeSubtopic = loaded.subtopics[activeSubIndex];
      setCurrentSubtopic(activeSubtopic);

      const conceptToTest = Math.min(3, activeSubtopic.conceptsMastered + 1);

      const resumeMsg = `Resuming "${loaded.topicName}"! 🎯\nWe are currently at Sub-topic ${activeSubIndex + 1}/${loaded.subtopics.length}: "${activeSubtopic.title}" (${activeSubtopic.masteryPercentage}% mastered).\n\nHere is your next concept question:`;
      setTeddyDialogue(resumeMsg);

      const nextQ = await qblEngine.current.generateQuestion(
        loaded.topicName,
        activeSubtopic,
        conceptToTest,
        false
      );
      setCurrentQuestion(nextQ);
      setTeddyEmotion('idle'); // Question ready, Teddy stops talking!

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_resume_${Date.now()}`,
          sender: 'teddy',
          text: resumeMsg,
          timestamp: Date.now(),
          subtopicTitle: activeSubtopic.title,
          subtopicMastery: activeSubtopic.masteryPercentage,
        },
        {
          id: `msg_q_${Date.now()}`,
          sender: 'teddy',
          text: nextQ.questionText,
          timestamp: Date.now(),
          question: nextQ,
          subtopicTitle: activeSubtopic.title,
        },
      ]);
    } catch (err) {
      console.warn('[useQBLSession] resumeSession error:', err);
    } finally {
      setIsThinking(false);
      setTeddyEmotion('idle');
    }
  }, []);

  // 4. Handle Option Selection (QBL Core Loop: Evaluate Reasoning & Reveal Diagnostics)
  const selectOption = useCallback(async (optionId: string) => {
    if (!session || !currentSubtopic || !currentQuestion || isThinking || currentTurnResult) return;

    setSelectedOptionId(optionId);
    setIsThinking(true);
    setTeddyEmotion('speaking'); // Teddy talks while LLM evaluates and prepares diagnostics

    const chosenOption = currentQuestion.options.find((o) => o.id === optionId);
    const chosenText = chosenOption ? `Option ${optionId}: ${chosenOption.text}` : `Option ${optionId}`;

    // Append user selection message to transcript
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg_user_opt_${Date.now()}`,
        sender: 'user',
        text: chosenText,
        timestamp: Date.now(),
        selectedOptionId: optionId,
      },
    ]);

    try {
      const outcome: QBLTurnResult = await qblEngine.current.evaluateAnswer(
        session,
        currentSubtopic,
        currentQuestion,
        optionId
      );

      // Mascot Progression & XP
      setMascotXp((prev) => {
        const nextXp = prev + outcome.xpAwarded;
        if (nextXp >= mascotLevel * 100) {
          setMascotLevel((lvl) => lvl + 1);
          setMascotTier('Insightful Senior Mentor');
        }
        return nextXp;
      });

      // Update Teddy dialogue & emotion
      setTeddyEmotion(outcome.teddyEmotion);
      setTeddyDialogue(outcome.feedbackText);
      setCurrentTurnResult(outcome);

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_feedback_${Date.now()}`,
          sender: 'teddy',
          text: outcome.feedbackText,
          timestamp: Date.now(),
          isFeedback: true,
          isCorrect: outcome.isCorrect,
          subtopicTitle: currentSubtopic.title,
          subtopicMastery: outcome.subtopicMastery,
        },
      ]);

      if (!outcome.isCorrect) {
        const refreshedMistakes = await qblEngine.current.getMistakesForSession(session.sessionId);
        setSessionMistakes(refreshedMistakes);
      }
    } catch (err) {
      console.warn('[useQBLSession] selectOption error:', err);
    } finally {
      setIsThinking(false);
    }
  }, [session, currentSubtopic, currentQuestion, isThinking, currentTurnResult, mascotLevel]);

  // 5. Advance to Next Question (Continue Button Tap: Next Concept, Drill, or Subtopic)
  const advanceToNextQuestion = useCallback(async () => {
    if (!session || !currentSubtopic || !currentQuestion || !currentTurnResult || isThinking) return;

    const outcome = currentTurnResult;
    setIsThinking(true);
    setTeddyEmotion('speaking'); // Teddy talks while formulating next question

    try {
      if (outcome.isCorrect) {
        if (outcome.isSubtopicCompleted) {
          // Subtopic reached 100% mastery!
          const nextIndex = session.currentSubtopicIndex + 1;
          if (nextIndex < session.subtopics.length) {
            session.currentSubtopicIndex = nextIndex;
            const nextSubtopic = session.subtopics[nextIndex];
            nextSubtopic.status = 'IN_PROGRESS';
            setCurrentSubtopic(nextSubtopic);
            setSession({ ...session });
            await qblEngine.current.getRepository().saveSession(session);

            const nextSubMsg = `🎉 Congratulations on hitting 100% on "${currentSubtopic.title}"!\n\nMoving on to Sub-topic ${nextIndex + 1}/${session.subtopics.length}: "${nextSubtopic.title}". Let's test Concept #1!`;
            setTeddyDialogue(nextSubMsg);

            const nextQ = await qblEngine.current.generateQuestion(session.topicName, nextSubtopic, 1, false);
            setCurrentQuestion(nextQ);
            setTeddyEmotion('idle');

            setChatMessages((prev) => [
              ...prev,
              {
                id: `msg_sub_advance_${Date.now()}`,
                sender: 'teddy',
                text: nextSubMsg,
                timestamp: Date.now(),
                subtopicTitle: nextSubtopic.title,
                subtopicMastery: 0,
              },
              {
                id: `msg_q_${Date.now()}`,
                sender: 'teddy',
                text: nextQ.questionText,
                timestamp: Date.now(),
                question: nextQ,
                subtopicTitle: nextSubtopic.title,
              },
            ]);
          } else {
            // Whole topic complete!
            session.status = 'COMPLETED';
            session.overallMasteryPercentage = 100;
            await qblEngine.current.getRepository().saveSession(session);
            setSession({ ...session });

            const mistakes = await qblEngine.current.getMistakesForSession(session.sessionId);
            setSessionMistakes(mistakes);
            setCurrentQuestion(null);

            // Refresh latest session & past sessions
            const allSessions = await qblEngine.current.getAllSessions();
            const latest = await qblEngine.current.getLatestSession();
            setPastSessions(allSessions);
            setLatestSessionToResume(latest);

            if (mistakes.length > 0) {
              const reviewIntroMsg = `🏆 Topic Complete! You covered all ${session.subtopics.length} sub-topics of "${session.topicName}"!\n\nTo lock in your intuition, let's step through a dedicated Review Session for the ${mistakes.length} tricky trap${mistakes.length > 1 ? 's' : ''} you encountered! 🔍`;
              setTeddyDialogue(reviewIntroMsg);
              setTeddyEmotion('puzzled');
              setCurrentMistakeIndex(0);
              setIsReviewSessionActive(true);

              setChatMessages((prev) => [
                ...prev,
                {
                  id: `msg_review_start_${Date.now()}`,
                  sender: 'teddy',
                  text: reviewIntroMsg,
                  timestamp: Date.now(),
                },
              ]);
            } else {
              const completeMsg = `🏆 FLAWLESS VICTORY! You have achieved 100% mastery across all ${session.subtopics.length} sub-topics of "${session.topicName}" with ZERO mistakes! You are a masterclass architect! 🌟`;
              setTeddyDialogue(completeMsg);
              setTeddyEmotion('celebrating');

              setChatMessages((prev) => [
                ...prev,
                {
                  id: `msg_complete_${Date.now()}`,
                  sender: 'teddy',
                  text: completeMsg,
                  timestamp: Date.now(),
                },
              ]);
            }
          }
        } else {
          // Advance to next concept within the same subtopic
          const nextConcept = currentSubtopic.conceptsMastered + 1;
          const progressMsg = `Awesome! You are at ${currentSubtopic.masteryPercentage}% for "${currentSubtopic.title}". Let's master Concept #${nextConcept}:`;
          setTeddyDialogue(progressMsg);

          const nextQ = await qblEngine.current.generateQuestion(
            session.topicName,
            currentSubtopic,
            nextConcept,
            false
          );
          setCurrentQuestion(nextQ);
          setTeddyEmotion('idle');

          setChatMessages((prev) => [
            ...prev,
            {
              id: `msg_q_${Date.now()}`,
              sender: 'teddy',
              text: `${progressMsg}\n\n${nextQ.questionText}`,
              timestamp: Date.now(),
              question: nextQ,
              subtopicTitle: currentSubtopic.title,
              subtopicMastery: currentSubtopic.masteryPercentage,
            },
          ]);
        }
      } else {
        // Wrong answer: generate a reinforcement question for this exact concept!
        const reinforcementQ = await qblEngine.current.generateQuestion(
          session.topicName,
          currentSubtopic,
          currentQuestion.conceptIndex,
          true,
          outcome.selectedOption?.text
        );
        setCurrentQuestion(reinforcementQ);
        setTeddyEmotion('idle');

        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg_reinforce_q_${Date.now()}`,
            sender: 'teddy',
            text: `🎯 Reinforcement Drill (Mastery: ${currentSubtopic.masteryPercentage}%):\n\n${reinforcementQ.questionText}`,
            timestamp: Date.now(),
            question: reinforcementQ,
            subtopicTitle: currentSubtopic.title,
            subtopicMastery: currentSubtopic.masteryPercentage,
          },
        ]);
      }

      // Clear evaluated turn state for fresh question
      setSelectedOptionId(null);
      setCurrentTurnResult(null);
    } catch (err) {
      console.warn('[useQBLSession] advanceToNextQuestion error:', err);
    } finally {
      setIsThinking(false);
    }
  }, [session, currentSubtopic, currentQuestion, currentTurnResult, isThinking]);

  // 6. Free-form Text / Conversational Inquiries
  const sendChatMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isThinking) return;

    // If no session is active yet, treat the user's text as the topic name!
    if (!session) {
      await startNewTopic(userText.trim());
      return;
    }

    setIsThinking(true);
    setTeddyEmotion('speaking'); // Teddy talks while LLM generates response

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg_chat_${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: Date.now(),
      },
    ]);

    try {
      const response = await qblEngine.current.answerFreeformQuestion(
        userText,
        currentQuestion || undefined,
        currentSubtopic || undefined
      );

      setTeddyDialogue(response);
      setTeddyEmotion('idle'); // Generation complete, Teddy stops talking!

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_teddy_chat_${Date.now()}`,
          sender: 'teddy',
          text: response,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      console.warn('[useQBLSession] sendChatMessage error:', err);
    } finally {
      setIsThinking(false);
      setTeddyEmotion('idle');
    }
  }, [session, currentQuestion, currentSubtopic, isThinking, startNewTopic]);

  // 7. Mistake Review Session Controls
  const startMistakeReview = useCallback(async () => {
    if (!session) return;
    const mistakes = await qblEngine.current.getMistakesForSession(session.sessionId);
    setSessionMistakes(mistakes);
    if (mistakes.length > 0) {
      setCurrentMistakeIndex(0);
      setIsReviewSessionActive(true);
      setTeddyEmotion('puzzled');
      const item = mistakes[0];
      const reviewMsg = `Reviewing Trap 1 of ${mistakes.length}: "${item.conceptTitle}"\n\nLet's dissect why your choice was tricky and solidify the authoritative mental model! 🔍`;
      setTeddyDialogue(reviewMsg);
    }
  }, [session]);

  const nextMistake = useCallback(() => {
    setCurrentMistakeIndex((prev) => {
      const nextIdx = Math.min(prev + 1, sessionMistakes.length - 1);
      const item = sessionMistakes[nextIdx];
      setTeddyDialogue(`Trap ${nextIdx + 1} of ${sessionMistakes.length}: "${item?.conceptTitle || 'Tricky Concept'}" 🔍`);
      return nextIdx;
    });
  }, [sessionMistakes]);

  const previousMistake = useCallback(() => {
    setCurrentMistakeIndex((prev) => {
      const prevIdx = Math.max(prev - 1, 0);
      const item = sessionMistakes[prevIdx];
      setTeddyDialogue(`Trap ${prevIdx + 1} of ${sessionMistakes.length}: "${item?.conceptTitle || 'Tricky Concept'}" 🔍`);
      return prevIdx;
    });
  }, [sessionMistakes]);

  const exitReviewSession = useCallback(() => {
    setIsReviewSessionActive(false);
    setTeddyEmotion('celebrating');
    const exitMsg = `Mistake review complete! You've analyzed every trap and converted mistakes into rock-solid mastery! 🚀`;
    setTeddyDialogue(exitMsg);
  }, []);

  const resetToTrackSelection = useCallback(() => {
    setSession(null);
    setCurrentSubtopic(null);
    setCurrentQuestion(null);
    setCurrentTurnResult(null);
    setSelectedOptionId(null);
    setIsReviewSessionActive(false);
    setSessionMistakes([]);
    setCurrentMistakeIndex(0);
    setTeddyEmotion('idle');
    setTeddyDialogue("Welcome! Ready to level up your engineering depth through Question-Driven Learning? 🐻");
  }, []);

  return {
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
    currentMistake: sessionMistakes[currentMistakeIndex] || null,
    mistakesCount: sessionMistakes.length,
    startMistakeReview,
    nextMistake,
    previousMistake,
    exitReviewSession,
    resetToTrackSelection,
  };
}
