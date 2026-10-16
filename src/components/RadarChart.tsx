/**
 * Multi-Axis Radar Chart Component
 * Visualizes candidate mastery across 5-6 core engineering disciplines using precision SVG geometry
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';
import { CandidateSkill } from '../types';
import { colors } from '../theme/colors';

interface RadarChartProps {
  skills: CandidateSkill[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ skills, size = 260 }) => {
  const displaySkills = skills.length >= 3 ? skills.slice(0, 6) : [
    { skill_name: 'Frameworks', current_score: 75 },
    { skill_name: 'System Design', current_score: 65 },
    { skill_name: 'Algorithms', current_score: 80 },
    { skill_name: 'Concurrency', current_score: 55 },
    { skill_name: 'Communication', current_score: 85 },
  ];

  const totalAxes = displaySkills.length;
  const center = size / 2;
  const maxRadius = size * 0.30;

  const scorePoints = displaySkills.map((item, index) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const radius = (Math.max(12, item.current_score) / 100) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const getGridPolygonPoints = (level: number) => {
    return displaySkills
      .map((_, index) => {
        const angle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
        const r = maxRadius * level;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Concentric Polygonal Web Rings */}
        {gridLevels.map((lvl, idx) => (
          <Polygon
            key={idx}
            points={getGridPolygonPoints(lvl)}
            stroke={colors.radarGrid}
            strokeWidth={idx === gridLevels.length - 1 ? '1.25' : '1'}
            strokeDasharray={idx < gridLevels.length - 1 ? '3, 3' : undefined}
            fill="none"
          />
        ))}

        {/* Axis Spokes */}
        {displaySkills.map((_, index) => {
          const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
          const endX = center + maxRadius * Math.cos(angle);
          const endY = center + maxRadius * Math.sin(angle);
          return (
            <Line
              key={index}
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke={colors.radarGrid}
              strokeWidth="1"
            />
          );
        })}

        {/* Candidate Skill Polygon */}
        <Polygon
          points={scorePoints}
          fill={colors.radarPolygonFill}
          stroke={colors.radarPolygonStroke}
          strokeWidth="2"
        />

        {/* Data Point Nodes */}
        {displaySkills.map((item, index) => {
          const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
          const radius = (Math.max(12, item.current_score) / 100) * maxRadius;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <React.Fragment key={index}>
              <Circle
                cx={x}
                cy={y}
                r="4.5"
                fill={colors.radarPolygonStroke}
              />
              <Circle
                cx={x}
                cy={y}
                r="2"
                fill={colors.background}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Axis Labels with generous width & 2-line support to prevent truncation */}
      {displaySkills.map((item, index) => {
        const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const labelRadius = maxRadius + 30;
        const labelWidth = 96;
        const x = center + labelRadius * cosA - labelWidth / 2;
        const y = center + labelRadius * sinA - (Math.abs(sinA) > 0.8 ? (sinA < 0 ? 18 : 6) : 14);

        return (
          <View key={index} style={[styles.labelWrapper, { width: labelWidth, left: x, top: y }]}>
            <Text style={styles.labelText} numberOfLines={2}>
              {item.skill_name}
            </Text>
            <Text style={styles.scoreText}>
              {Math.round(item.current_score)}%
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  labelWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: -0.1,
  },
  scoreText: {
    color: colors.notionBlueLight,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
});
