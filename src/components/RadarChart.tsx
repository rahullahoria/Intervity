/**
 * Multi-Axis Radar Chart Component
 * Visualizes candidate mastery across 5-6 core engineering disciplines using SVG
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
  const maxRadius = size * 0.38;

  // Compute polygon points for candidate scores
  const scorePoints = displaySkills.map((item, index) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const radius = (item.current_score / 100) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Compute grid circles / webs (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Web Rings */}
        {gridLevels.map((lvl, idx) => (
          <Circle
            key={idx}
            cx={center}
            cy={center}
            r={maxRadius * lvl}
            stroke={colors.radarGrid}
            strokeWidth="1"
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
          strokeWidth="2.5"
        />

        {/* Data Point Nodes */}
        {displaySkills.map((item, index) => {
          const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
          const radius = (item.current_score / 100) * maxRadius;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={colors.radarPolygonStroke}
            />
          );
        })}
      </Svg>

      {/* Axis Labels */}
      {displaySkills.map((item, index) => {
        const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
        const labelRadius = maxRadius + 22;
        const x = center + labelRadius * Math.cos(angle) - 40;
        const y = center + labelRadius * Math.sin(angle) - 10;

        return (
          <View key={index} style={[styles.labelWrapper, { left: x, top: y }]}>
            <Text style={styles.labelText} numberOfLines={1}>
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
    marginVertical: 8,
  },
  labelWrapper: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },
  labelText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreText: {
    color: colors.textTertiary,
    fontSize: 9,
    fontWeight: '700',
  },
});
