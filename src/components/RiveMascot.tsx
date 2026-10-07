import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Rive, { Alignment, Fit, RiveRef } from 'rive-react-native';
import { colors } from '../theme/colors';
import { InterviewState } from '../types';

interface RiveMascotProps {
  state?: InterviewState;
  emotion?: 'idle' | 'speaking' | 'thinking' | 'celebrating' | 'puzzled';
  audioLevel?: number;
  size?: number;
  onPress?: () => void;
  showMascotBadge?: boolean;
  mascotType?: 'teddy' | 'coach';
  isFullScreen?: boolean;
}

export const RiveMascot: React.FC<RiveMascotProps> = ({
  state = 'READY',
  emotion,
  audioLevel = 0,
  size = 280,
  onPress,
  showMascotBadge = true,
  mascotType = 'teddy',
  isFullScreen = false,
}) => {
  const riveRef = useRef<RiveRef>(null);
  const [hasError, setHasError] = useState(false);
  const [isRiveReady, setIsRiveReady] = useState(false);

  const isSpeaking = emotion ? emotion === 'speaking' : state === 'AI_SPEAKING';
  const isListening = state === 'LISTENING' || state === 'USER_SPEAKING';
  const isThinking = emotion ? emotion === 'thinking' : state === 'THINKING';
  const isInterrupted = emotion ? emotion === 'puzzled' : state === 'INTERRUPTED';
  const isCompleted = emotion ? emotion === 'celebrating' : state === 'COMPLETED';

  // 1. Handle declarative/imperative updates for state machine & animations
  useEffect(() => {
    if (!isRiveReady || !riveRef.current) return;

    const timer = setTimeout(() => {
      if (!riveRef.current) return;
      try {
        const tag = riveRef.current.viewTag ? riveRef.current.viewTag() : null;
        if (tag === null) return;

        if (isSpeaking) {
          // Teddy Talking animation: animate mouth moving
          riveRef.current.setInputState('State Machine 1', 'Talk', true);
          riveRef.current.setInputState('State Machine 1', 'Hear', false);
          riveRef.current.setInputState('State Machine 1', 'Check', false);
        } else if (isListening) {
          // Teddy Hearing/Listening animation: attentively listening to candidate
          riveRef.current.setInputState('State Machine 1', 'Talk', false);
          riveRef.current.setInputState('State Machine 1', 'Hear', true);
          riveRef.current.setInputState('State Machine 1', 'Check', false);
          // Gaze reacts dynamically to candidate audio level (10 to 90 degrees)
          const lookAngle = Math.min(90, Math.max(10, 50 + (audioLevel - 0.5) * 60));
          riveRef.current.setInputState('State Machine 1', 'Look', Math.round(lookAngle));
        } else if (isThinking) {
          // Teddy Thinking animation: contemplative check pose
          riveRef.current.setInputState('State Machine 1', 'Talk', false);
          riveRef.current.setInputState('State Machine 1', 'Hear', false);
          riveRef.current.setInputState('State Machine 1', 'Check', true);
          riveRef.current.setInputState('State Machine 1', 'Look', 25);
        } else if (isInterrupted) {
          // Interrupted: puzzled / surprise trigger
          riveRef.current.setInputState('State Machine 1', 'Talk', false);
          riveRef.current.fireState('State Machine 1', 'fail');
        } else if (isCompleted) {
          // Completed: celebratory success gesture
          riveRef.current.setInputState('State Machine 1', 'Talk', false);
          riveRef.current.fireState('State Machine 1', 'success');
        } else {
          // Idle state
          riveRef.current.setInputState('State Machine 1', 'Talk', false);
          riveRef.current.setInputState('State Machine 1', 'Hear', false);
          riveRef.current.setInputState('State Machine 1', 'Check', false);
        }
      } catch {
        // Ignore transition exceptions gracefully
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [isRiveReady, state, isSpeaking, isListening, isThinking, isInterrupted, isCompleted, audioLevel, mascotType]);

  // Periodic head/gaze motion while speaking
  useEffect(() => {
    if (!isRiveReady || !isSpeaking) return;

    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      const angle = Math.round(50 + Math.sin(tick * 0.7) * 16);
      try {
        if (!riveRef.current) return;
        const tag = riveRef.current.viewTag ? riveRef.current.viewTag() : null;
        if (tag === null) return;
        riveRef.current.setInputState('State Machine 1', 'Talk', true);
        riveRef.current.setInputState('State Machine 1', 'Look', angle);
      } catch (_e) {
        // Ignore Rive input state sync errors
      }
    }, 200);

    return () => {
      clearInterval(interval);
      try {
        if (riveRef.current && riveRef.current.viewTag && riveRef.current.viewTag() !== null) {
          riveRef.current.setInputState('State Machine 1', 'Talk', false);
        }
      } catch {}
    };
  }, [isRiveReady, isSpeaking]);

  // Glow border color based on conversational state
  const stateBorderColor = isSpeaking
    ? colors.speakingEmerald
    : isListening
    ? colors.listeningCyan
    : isThinking
    ? colors.thinkingViolet
    : isInterrupted
    ? colors.interruptedAmber
    : 'rgba(99, 102, 241, 0.4)';

  const mascotTagText = isSpeaking
    ? '🎙️ Intervity Coach Speaking'
    : isListening
    ? '👂 Attentively Listening...'
    : isThinking
    ? '🧠 Analyzing System Architecture...'
    : isInterrupted
    ? '⚡ Yielding Turn (Barge-In)'
    : '✨ AI Mentor Ready';

  if (isFullScreen) {
    return (
      <View style={[styles.fullScreenContainer, { backgroundColor: mascotType === 'teddy' ? '#d6e2ea' : '#0B0F19' }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onPress}
          style={StyleSheet.absoluteFillObject}
        >
          {!hasError ? (
            <Rive
              ref={riveRef}
              resourceName={mascotType === 'coach' ? 'mascot' : 'teddy'}
              stateMachineName="State Machine 1"
              artboardName="Artboard"
              fit={Fit.Contain}
              alignment={Alignment.Center}
              autoplay={true}
              onPlay={() => setIsRiveReady(true)}
              onError={(err) => {
                console.warn('[RiveMascot Error]:', err);
                setHasError(true);
              }}
              style={
                mascotType === 'coach'
                  ? { ...styles.riveFullScreen, transform: [{ translateY: 48 }, { scale: 0.92 }] }
                  : { ...styles.riveFullScreen, transform: [{ translateY: 24 }, { scale: 1.05 }] }
              }
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackEmoji}>🐻</Text>
              <Text style={styles.fallbackName}>Teddy</Text>
            </View>
          )}

          {/* Ambient state glow at the edges of the full screen */}
          {(isSpeaking || isListening) && (
            <View
              style={[
                styles.fullScreenGlowRing,
                {
                  borderColor: stateBorderColor,
                  opacity: Math.min(0.85, 0.2 + (audioLevel || 0.15)),
                },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.outerContainer, { width: size, height: size + (showMascotBadge ? 42 : 0) }]}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[
          styles.mascotCard,
          {
            width: size,
            height: size,
            borderColor: stateBorderColor,
            shadowColor: stateBorderColor,
          },
        ]}
      >
        {!hasError ? (
          <Rive
            ref={riveRef}
            resourceName={mascotType === 'coach' ? 'mascot' : 'teddy'}
            stateMachineName="State Machine 1"
            artboardName="Artboard"
            fit={Fit.Contain}
            alignment={Alignment.Center}
            autoplay={true}
            onPlay={() => setIsRiveReady(true)}
            onError={(err) => {
              console.warn('[RiveMascot Error]:', err);
              setHasError(true);
            }}
            style={styles.riveView}
          />
        ) : (
          // Elegant vector fallback in case Rive engine fails
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackEmoji}>🐻</Text>
            <Text style={styles.fallbackName}>Teddy</Text>
          </View>
        )}

        {/* Ambient halo ring for speaking & listening biofeedback */}
        {(isSpeaking || isListening) && (
          <View
            style={[
              styles.audioPulseRing,
              {
                borderColor: stateBorderColor,
                opacity: Math.min(0.9, 0.3 + (audioLevel || 0.2)),
                transform: [{ scale: 1 + Math.min(0.15, (audioLevel || 0.05) * 0.3) }],
              },
            ]}
          />
        )}
      </TouchableOpacity>

      {showMascotBadge && (
        <View style={[styles.statusBadge, { borderColor: stateBorderColor }]}>
          <Text style={[styles.statusBadgeText, { color: stateBorderColor }]}>
            {mascotTagText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  riveFullScreen: {
    width: '100%',
    height: '100%',
  },
  fullScreenGlowRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    pointerEvents: 'none',
  },
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotCard: {
    borderRadius: 28,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  riveView: {
    width: '100%',
    height: '100%',
  },
  audioPulseRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
    borderWidth: 2,
    pointerEvents: 'none',
  },
  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackEmoji: {
    fontSize: 72,
    marginBottom: 4,
  },
  fallbackName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
