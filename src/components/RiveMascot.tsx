import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Rive, { Alignment, Fit, RiveRef } from 'rive-react-native';
import { colors } from '../theme/colors';
import { InterviewState } from '../types';

interface RiveMascotProps {
  state: InterviewState;
  audioLevel?: number;
  size?: number;
  onPress?: () => void;
  showMascotBadge?: boolean;
  mascotType?: 'teddy' | 'coach';
}

export const RiveMascot: React.FC<RiveMascotProps> = ({
  state,
  audioLevel = 0,
  size = 280,
  onPress,
  showMascotBadge = true,
  mascotType = 'teddy',
}) => {
  const riveRef = useRef<RiveRef>(null);
  const [hasError, setHasError] = useState(false);

  const isSpeaking = state === 'AI_SPEAKING';
  const isListening = state === 'LISTENING' || state === 'USER_SPEAKING';
  const isThinking = state === 'THINKING';
  const isInterrupted = state === 'INTERRUPTED';
  const isCompleted = state === 'COMPLETED';

  useEffect(() => {
    if (!riveRef.current) return;

    try {
      if (mascotType === 'teddy') {
        if (isSpeaking) {
          riveRef.current.setInputState('Login Machine', 'isChecking', true);
          riveRef.current.setInputState('Login Machine', 'numLook', 50);
        } else if (isListening) {
          riveRef.current.setInputState('Login Machine', 'isChecking', true);
          // Look reacts dynamically to candidate audio level
          const lookAngle = Math.min(90, Math.max(10, 50 + (audioLevel - 0.5) * 60));
          riveRef.current.setInputState('Login Machine', 'numLook', lookAngle);
        } else if (isThinking) {
          riveRef.current.setInputState('Login Machine', 'isChecking', true);
          riveRef.current.setInputState('Login Machine', 'numLook', 25);
        } else if (isInterrupted) {
          riveRef.current.fireState('Login Machine', 'trigFail');
        } else if (isCompleted) {
          riveRef.current.fireState('Login Machine', 'trigSuccess');
        } else {
          riveRef.current.setInputState('Login Machine', 'isChecking', false);
        }
      } else {
        if (isSpeaking) {
          riveRef.current.play('Talking');
        } else {
          riveRef.current.play('Blinking');
        }
      }
    } catch {
      // Ignore transition exceptions gracefully
    }
  }, [state, isSpeaking, isListening, isThinking, isInterrupted, isCompleted, audioLevel, mascotType]);

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
            resourceName={mascotType === 'teddy' ? 'teddy' : 'mascot'}
            stateMachineName={mascotType === 'teddy' ? 'Login Machine' : undefined}
            artboardName={mascotType === 'teddy' ? 'Teddy' : 'Teacher'}
            animationName={mascotType === 'coach' ? (isSpeaking ? 'Talking' : 'Blinking') : undefined}
            fit={Fit.Contain}
            alignment={Alignment.Center}
            autoplay={true}
            onError={(err) => {
              console.warn('[RiveMascot Error]:', err);
              setHasError(true);
            }}
            style={styles.riveView}
          />
        ) : (
          // Elegant vector fallback in case Rive engine fails
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackEmoji}>🤖</Text>
            <Text style={styles.fallbackName}>Vity</Text>
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
