/**
 * AppIcons.tsx
 * Cohesive, modern vector icon set using react-native-svg.
 * Consistent geometry, stroke weights, and modern color palette.
 */

import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_SIZE = 20;
const DEFAULT_COLOR = '#E2E8F0';
const DEFAULT_STROKE = 2;

/**
 * 4-Point AI Spark / Star Icon
 */
export const SparklesIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Mascot Level / XP Star Icon
 */
export const StarIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Graduation / Academic Coach Icon (Coach Nova)
 */
export const CoachIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M22 10V16M2 10L12 5L22 10L12 15L2 10Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 12V17C6 17 9 20 12 20C15 20 18 17 18 17V12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Teddy Mascot Avatar Icon
 */
export const BearIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="14" r="7" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="6.5" cy="7.5" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="17.5" cy="7.5" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="10" cy="13" r="1" fill={color} />
    <Circle cx="14" cy="13" r="1" fill={color} />
    <Path
      d="M10.5 16C11 16.6 13 16.6 13.5 16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Loudspeaker Active / High Volume
 */
export const VolumeHighIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M11 5L6 9H2V15H6L11 19V5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.54 8.46C16.48 9.4 17 10.65 17 12C17 13.35 16.48 14.6 15.54 15.54"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M19.07 4.93C20.94 6.8 22 9.35 22 12C22 14.65 20.94 17.2 19.07 19.07"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Loudspeaker Low / Muted (Earpiece Mode)
 */
export const VolumeLowIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M11 5L6 9H2V15H6L11 19V5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.54 8.46C16.48 9.4 17 10.65 17 12C17 13.35 16.48 14.6 15.54 15.54"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Settings Gear Icon
 */
export const SettingsIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.4 15A1.65 1.65 0 0019.73 16.82L20.1 17.2A2 2 0 1117.27 20.03L16.9 19.66A1.65 1.65 0 0015.08 19.33A1.65 1.65 0 0014 20.82V21.5A2 2 0 1110 21.5V20.82A1.65 1.65 0 008.92 19.33A1.65 1.65 0 007.1 19.66L6.73 20.03A2 2 0 113.9 17.2L4.27 16.83A1.65 1.65 0 004.6 15A1.65 1.65 0 003.11 13.92H2.5A2 2 0 112.5 9.92H3.18A1.65 1.65 0 004.67 8.84A1.65 1.65 0 004.34 7.02L3.97 6.65A2 2 0 116.8 3.82L7.17 4.19A1.65 1.65 0 009 4.52A1.65 1.65 0 0010.08 3.03V2.5A2 2 0 1114.08 2.5V3.18A1.65 1.65 0 0015.16 4.67A1.65 1.65 0 0016.98 4.34L17.35 3.97A2 2 0 1120.18 6.8L19.81 7.17A1.65 1.65 0 0019.48 9A1.65 1.65 0 0020.97 10.08H21.5A2 2 0 1121.5 14.08H20.82A1.65 1.65 0 0019.4 15Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Career Target / Crosshair Icon
 */
export const TargetIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="2" fill={color} />
  </Svg>
);

/**
 * Microphone Icon (Speech / Voice)
 */
export const MicIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect
      x="8"
      y="2"
      width="8"
      height="12"
      rx="4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 10V11C19 14.866 15.866 18 12 18C8.134 18 5 14.866 5 11V10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 18V22M8 22H16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Barge-In Lightning Bolt Icon
 */
export const BoltIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Brain / Neural Thinking Icon
 */
export const BrainIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M9.5 4C8 4 6 5.5 6 7.5C4.5 7.5 3 9 3 11C3 13 4.5 14 5.5 14.5C5 15.5 5 17 6.5 18.5C8 20 10 20 10.5 19"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M14.5 4C16 4 18 5.5 18 7.5C19.5 7.5 21 9 21 11C21 13 19.5 14 18.5 14.5C19 15.5 19 17 17.5 18.5C16 20 14 20 13.5 19"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M12 4V20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * Chat Bubble / Text Mode Icon
 */
export const ChatBubbleIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.9C9.87812 3.30493 11.1801 2.99656 12.5 3H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91569 21 11V11.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Continuous Loop / Hands-Free Icon
 */
export const LoopIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M21.5 2V7H16.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.5 22V17H7.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20.49 15A9 9 0 015.64 19.36L2.5 17M3.51 9A9 9 0 0118.36 4.64L21.5 7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Close / Dismiss 'X' Icon
 */
export const CloseIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Send / Arrow Icon
 */
export const SendIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Lightbulb / Idea Icon
 */
export const BulbIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M9 18H15M10 22H14M12 2C8.13401 2 5 5.13401 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13401 15.866 2 12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Briefcase / Role Icon
 */
export const BriefcaseIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect
      x="2"
      y="7"
      width="20"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * System Architecture / Structure Icon
 */
export const ArchitectureIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Rect x="8.5" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M6.5 10V12H17.5V10M12 12V14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

/**
 * Pause Icon
 */
export const PauseIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M10 4H6V20H10V4ZM18 4H14V20H18V4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Chevron Left / Back Icon
 */
export const ChevronLeftIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Check / Verified Icon
 */
export const CheckIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Sound Wave Animated Bars (Dynamic Audio Activity)
 */
export const SoundWaveBars: React.FC<{
  level?: number;
  active?: boolean;
  color?: string;
  size?: number;
}> = ({ level = 0.5, active = true, color = '#38BDF8', size = 16 }) => {
  // 4 dynamic bars with varying heights based on audio level
  const clampedLevel = Math.max(0.15, Math.min(1.0, level));
  const h1 = active ? Math.max(3, clampedLevel * size * 0.5) : 3;
  const h2 = active ? Math.max(5, clampedLevel * size * 0.95) : 4;
  const h3 = active ? Math.max(4, clampedLevel * size * 0.75) : 3;
  const h4 = active ? Math.max(3, clampedLevel * size * 0.4) : 2;

  return (
    <Svg width={size * 1.4} height={size} viewBox="0 0 24 16" fill="none">
      <Rect x="2" y={(16 - h1) / 2} width="3" height={h1} rx="1.5" fill={color} />
      <Rect x="8" y={(16 - h2) / 2} width="3" height={h2} rx="1.5" fill={color} />
      <Rect x="14" y={(16 - h3) / 2} width="3" height={h3} rx="1.5" fill={color} />
      <Rect x="20" y={(16 - h4) / 2} width="3" height={h4} rx="1.5" fill={color} />
    </Svg>
  );
};
