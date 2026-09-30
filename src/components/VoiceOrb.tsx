/**
 * Dynamic 3D Fluid Voice Orb Canvas
 * Inspired by Siri & Hume AI: Real-time reactive audio visualizer reacting to full-duplex states
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { InterviewState } from '../types';
import { colors } from '../theme/colors';

interface VoiceOrbProps {
  state: InterviewState;
  audioLevel?: number; // 0.0 to 1.0
  size?: number;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  audioLevel = 0,
  size = 240,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  // Pulse & rotation animations
  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    let rotateLoop: Animated.CompositeAnimation | null = null;

    if (state === 'LISTENING') {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
    } else if (state === 'THINKING') {
      rotateLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotateLoop.start();
    } else if (state === 'INTERRUPTED') {
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1.4,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (pulseLoop) pulseLoop.stop();
      if (rotateLoop) rotateLoop.stop();
    };
  }, [state]);

  // Determine state-based color schemes
  let primaryColor = colors.listeningCyan;
  let glowColor = colors.listeningGlow;
  let scaleMultiplier = 1;

  if (state === 'USER_SPEAKING') {
    primaryColor = colors.speakingEmerald;
    glowColor = colors.speakingGlow;
    scaleMultiplier = 1 + audioLevel * 0.45;
  } else if (state === 'THINKING') {
    primaryColor = colors.thinkingViolet;
    glowColor = colors.thinkingGlow;
    scaleMultiplier = 1.05;
  } else if (state === 'AI_SPEAKING') {
    primaryColor = colors.listeningCyan;
    glowColor = 'rgba(6, 182, 212, 0.4)';
    scaleMultiplier = 1.1 + Math.sin(Date.now() / 200) * 0.08;
  } else if (state === 'INTERRUPTED') {
    primaryColor = colors.interruptedAmber;
    glowColor = colors.interruptedGlow;
    scaleMultiplier = 1.25;
  }

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const center = size / 2;
  const radius = size * 0.36;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Glow Halo */}
      <View
        style={[
          styles.glowHalo,
          {
            width: size * 0.95,
            height: size * 0.95,
            borderRadius: (size * 0.95) / 2,
            backgroundColor: glowColor,
            transform: [{ scale: scaleMultiplier }],
          },
        ]}
      />

      {/* SVG Fluid Orb with Radial Gradients */}
      <Animated.View
        style={[
          styles.orbWrapper,
          {
            transform: [
              { scale: pulseAnim },
              { scale: scaleMultiplier },
              { rotate: state === 'THINKING' ? spin : '0deg' },
            ],
          },
        ]}
      >
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="orbGrad" cx="35%" cy="35%" r="65%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <Stop offset="40%" stopColor={primaryColor} stopOpacity="0.9" />
              <Stop offset="85%" stopColor="#0B1120" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#030712" stopOpacity="1" />
            </RadialGradient>
          </Defs>

          {/* Core Sphere */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#orbGrad)"
          />

          {/* Thin Concentric Orbital Ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius * 1.18}
            stroke={primaryColor}
            strokeWidth="1.5"
            strokeDasharray="6, 8"
            opacity={state === 'THINKING' ? 0.9 : 0.4}
            fill="none"
          />

          {/* Secondary Acoustic Ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius * 1.32}
            stroke={primaryColor}
            strokeWidth="1"
            opacity={state === 'AI_SPEAKING' || state === 'USER_SPEAKING' ? 0.6 : 0.15}
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowHalo: {
    position: 'absolute',
    opacity: 0.8,
  },
  orbWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
