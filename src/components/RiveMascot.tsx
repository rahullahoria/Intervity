import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
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
  size = 240,
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

  useEffect(() => {
    if (!isRiveReady || !riveRef.current) return;

    const timer = setTimeout(() => {
      if (!riveRef.current) return;
      try {
        const tag = riveRef.current.viewTag ? riveRef.current.viewTag() : null;
        if (tag === null) return;

        if (isSpeaking) {
          riveRef.current.setInputState('State Machine 1', 'Talk', true);
          riveRef.current.setInputState('State Machine 1', 'Hear', false);
          riveRef.current.setInputState('State Machine 1', 'Check', false);
        } else if (isListening) {
          riveRef.current.setInputState('State Machine 1', 'Talk', false);
          riveRef.current.setInputState('State Machine 1', 'Hear', true);
          riveRef.current.setInputState('State Machine 1', 'Check', false);
          const lookAngle = Math.min(90, Math.max(10, 50 + (audioLevel - 0.5) * 60));
          riveRef.current.setInputState('State Machine 1', 'Look', Math.round(lookAngle));
        } else if (isThinking) {
          riveRef.current.setInputState('State Machine 1', 'Talk', false);
          riveRef.current.setInputState('State Machine 1', 'Hear', false);
          riveRef.current.setInputState('State Machine 1', 'Check', true);
          riveRef.current.setInputState('State Machine 1', 'Look', 25);
        } else if (isInterrupted) {
          riveRef.current.setInputState('State Machine 1', 'Talk', false);
          riveRef.current.fireState('State Machine 1', 'fail');
        } else if (isCompleted) {
          riveRef.current.setInputState('State Machine 1', 'Talk', false);
          riveRef.current.fireState('State Machine 1', 'success');
        } else {
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

  const stateAccentColor = isSpeaking
    ? colors.speakingEmerald
    : isListening
    ? colors.listeningCyan
    : isThinking
    ? colors.thinkingViolet
    : isInterrupted
    ? colors.interruptedAmber
    : colors.cardBorder;

  const dotColor = isSpeaking
    ? colors.speakingEmerald
    : isListening
    ? colors.listeningCyan
    : isThinking
    ? colors.thinkingViolet
    : isInterrupted
    ? colors.interruptedAmber
    : colors.notionBlueLight;

  const mascotTagText = isSpeaking
    ? 'Interviewer Speaking'
    : isListening
    ? 'Listening Active'
    : isThinking
    ? 'Evaluating Response'
    : isInterrupted
    ? 'Yielding Turn'
    : 'Mentor Ready';

  const dynamicRadius = Math.max(12, Math.min(28, Math.round(size * 0.22)));

  if (isFullScreen) {
    return (
      <View style={[styles.fullScreenContainer, { backgroundColor: mascotType === 'teddy' ? '#d6e2ea' : colors.background }]}>
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
              <Image
                source={require('../assets/images/teddy_logo.png')}
                style={{ width: 140, height: 140, borderRadius: 70 }}
                resizeMode="cover"
              />
              <Text style={styles.fallbackName}>Teddy</Text>
            </View>
          )}

          {(isSpeaking || isListening) && (
            <View
              style={[
                styles.fullScreenGlowRing,
                {
                  borderColor: stateAccentColor,
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
    <View style={[styles.outerContainer, { width: size, height: size + (showMascotBadge ? 38 : 0) }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.mascotCard,
          {
            width: size,
            height: size,
            borderRadius: dynamicRadius,
            borderColor: stateAccentColor,
          },
        ]}
      >
        {!hasError ? (
          <Rive
            ref={riveRef}
            resourceName={mascotType === 'coach' ? 'mascot' : 'teddy'}
            stateMachineName="State Machine 1"
            artboardName="Artboard"
            fit={Fit.Cover}
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
          <View style={styles.fallbackContainer}>
            <Image
              source={require('../assets/images/teddy_logo.png')}
              style={{ width: size * 0.76, height: size * 0.76, borderRadius: (size * 0.76) / 2 }}
              resizeMode="cover"
            />
          </View>
        )}

        {(isSpeaking || isListening) && (
          <View
            style={[
              styles.audioPulseRing,
              {
                borderRadius: dynamicRadius + 4,
                borderColor: stateAccentColor,
                opacity: Math.min(0.75, 0.25 + (audioLevel || 0.15)),
                transform: [{ scale: 1 + Math.min(0.1, (audioLevel || 0.05) * 0.2) }],
              },
            ]}
          />
        )}
      </TouchableOpacity>

      {showMascotBadge && (
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
          <Text style={styles.statusBadgeText}>
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
    borderWidth: 3,
    pointerEvents: 'none',
  },
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riveView: {
    width: '100%',
    height: '100%',
  },
  audioPulseRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderWidth: 1.5,
    pointerEvents: 'none',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardBackground,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
});
