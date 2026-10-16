/**
 * AppIcons.tsx
 * Precision geometric vector icon set using react-native-svg.
 * Consistent 1.75px stroke weight, rounded caps/joins, and studio-grade proportions.
 */

import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_SIZE = 18;
const DEFAULT_COLOR = '#F4F4F6';
const DEFAULT_STROKE = 1.75;

export const SparklesIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 3L14.1 9.9L21 12L14.1 14.1L12 21L9.9 14.1L3 12L9.9 9.9L12 3Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const StarIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4L12 2.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

export const BearIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="13.5" r="6.5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="6.5" cy="7.5" r="2.5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="17.5" cy="7.5" r="2.5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="9.8" cy="12.5" r="1" fill={color} />
    <Circle cx="14.2" cy="12.5" r="1" fill={color} />
    <Path
      d="M10.5 15.5C11 16.1 13 16.1 13.5 15.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const OrbIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth={strokeWidth} opacity={0.65} />
    <Path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

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

export const SettingsIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M19.4 15A1.65 1.65 0 0019.73 16.82L20.1 17.2A2 2 0 1117.27 20.03L16.9 19.66A1.65 1.65 0 0015.08 19.33A1.65 1.65 0 0014 20.82V21.5A2 2 0 1110 21.5V20.82A1.65 1.65 0 008.92 19.33A1.65 1.65 0 007.1 19.66L6.73 20.03A2 2 0 113.9 17.2L4.27 16.83A1.65 1.65 0 004.6 15A1.65 1.65 0 003.11 13.92H2.5A2 2 0 112.5 9.92H3.18A1.65 1.65 0 004.67 8.84A1.65 1.65 0 004.34 7.02L3.97 6.65A2 2 0 116.8 3.82L7.17 4.19A1.65 1.65 0 009 4.52A1.65 1.65 0 0010.08 3.03V2.5A2 2 0 1114.08 2.5V3.18A1.65 1.65 0 0015.16 4.67A1.65 1.65 0 0016.98 4.34L17.35 3.97A2 2 0 1120.18 6.8L19.81 7.17A1.65 1.65 0 0019.48 9A1.65 1.65 0 0020.97 10.08H21.5A2 2 0 1121.5 14.08H20.82A1.65 1.65 0 0019.4 15Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TargetIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
);

export const MicIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect
      x="9"
      y="2"
      width="6"
      height="11"
      rx="3"
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

export const BoltIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M13 2L4 14H12L11 22L20 10H12L13 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

export const RefreshIcon = LoopIcon;

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

export const SendIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M5 12H19M19 12L13 6M19 12L13 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M5 12H19M19 12L13 6M19 12L13 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

export const PlayIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M6 4L20 12L6 20V4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
    />
  </Svg>
);

export const StopIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect
      x="6"
      y="6"
      width="12"
      height="12"
      rx="2"
      stroke={color}
      strokeWidth={strokeWidth}
      fill={color}
    />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M12 7V12L15 14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const KeyboardIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="2.5"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Line x1="6" y1="9" x2="6.01" y2="9" stroke={color} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
    <Line x1="10" y1="9" x2="10.01" y2="9" stroke={color} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
    <Line x1="14" y1="9" x2="14.01" y2="9" stroke={color} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
    <Line x1="18" y1="9" x2="18.01" y2="9" stroke={color} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
    <Line x1="8" y1="15" x2="16" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M20 20L16.35 16.35" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const AlertCircleIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="8" x2="12" y2="12.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1" fill={color} />
  </Svg>
);

export const TrophyIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M6 9H4.5C3.12 9 2 7.88 2 6.5V5H6M18 9H19.5C20.88 9 22 7.88 22 6.5V5H18M6 4H18V10C18 13.31 15.31 16 12 16C8.69 16 6 13.31 6 10V4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 16V20M8 20H16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M2 4H8C10.21 4 12 5.79 12 8V20C12 18.34 10.66 17 9 17H2V4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 4H16C13.79 4 12 5.79 12 8V20C12 18.34 13.34 17 15 17H22V4Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LayersIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12L12 17L22 12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 17L12 22L22 17"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ActivityIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M22 12H18L15 21L9 3L6 12H2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CpuIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect x="5" y="5" width="14" height="14" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <Rect x="9" y="9" width="6" height="6" rx="1" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M9 2V5M15 2V5M9 19V22M15 19V22M2 9H5M2 15H5M19 9H22M19 15H22"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const BulbIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M9 18H15M10 21H14M12 3C8.69 3 6 5.69 6 9C6 11.22 7.21 13.16 9 14.2V16C9 16.55 9.45 17 10 17H14C14.55 17 15 16.55 15 16V14.2C16.79 13.16 18 11.22 18 9C18 5.69 15.31 3 12 3Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

export const SoundWaveBars: React.FC<{
  level?: number;
  active?: boolean;
  color?: string;
  size?: number;
}> = ({ level = 0.5, active = true, color = '#7B93FF', size = 16 }) => {
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

export const DeviceMobileIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Rect
      x="5"
      y="2"
      width="14"
      height="20"
      rx="3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M12 18H12.01" stroke={color} strokeWidth={strokeWidth + 1} strokeLinecap="round" />
    <Path d="M9 5H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const UsersGroupIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserIcon: React.FC<IconProps> = ({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

