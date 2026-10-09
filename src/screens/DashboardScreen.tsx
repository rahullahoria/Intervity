/**
 * Dashboard / Home Screen
 * Displays candidate mastery level, multi-discipline radar chart, weakest skills, and quick actions
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useSkillMastery } from '../hooks/useSkillMastery';
import { RadarChart } from '../components/RadarChart';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { skills, weakestSkills } = useSkillMastery();

  const averageScore = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + s.current_score, 0) / skills.length)
    : 68;

  let overallLevel = 'DEVELOPING (L3)';
  if (averageScore >= 90) overallLevel = 'STAFF (L6)';
  else if (averageScore >= 80) overallLevel = 'SENIOR (L5)';
  else if (averageScore >= 60) overallLevel = 'PROFICIENT (L4)';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTag}>INTERVITY • OFFLINE AI MOCK INTERVIEW</Text>
            <Text style={typography.h1}>Technical Mastery</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => navigation.navigate('ModelManager')}
          >
            <Text style={styles.settingsIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Candidate Level Banner */}
        <View style={styles.levelCard}>
          <View>
            <Text style={styles.levelLabel}>Current On-Device Ranking</Text>
            <Text style={styles.levelValue}>{overallLevel}</Text>
          </View>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{averageScore}</Text>
            <Text style={styles.scoreScale}>/100</Text>
          </View>
        </View>

        {/* Skill Mastery Radar Chart */}
        <View style={styles.sectionCard}>
          <Text style={typography.h2}>Engineering Competency Matrix</Text>
          <Text style={typography.caption}>Evaluated on-device across turns via Bayesian EMA</Text>
          <RadarChart skills={skills} size={250} />
        </View>

        {/* Spaced Repetition Focus: Weakest Skills */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={typography.h3}>Target Weaknesses</Text>
            <Text style={styles.pillText}>Adaptive Spaced Repetition</Text>
          </View>
          <Text style={[typography.caption, { marginBottom: 12 }]}>
            These areas will be dynamically probed in your next mock interview:
          </Text>

          {weakestSkills.map((item, idx) => (
            <View key={idx} style={styles.weakSkillRow}>
              <View style={styles.weakSkillInfo}>
                <Text style={typography.bodyBold}>{item.skill_name}</Text>
                <Text style={typography.caption}>Current: {Math.round(item.current_score)} / 100</Text>
              </View>
              <TouchableOpacity
                style={styles.drillMiniBtn}
                onPress={() => navigation.navigate('MistakeDrill', {
                  drillType: 'MISTAKE_CORRECTION',
                  targetSkillId: item.skill_id,
                  skillName: item.skill_name,
                })}
              >
                <Text style={styles.drillMiniBtnText}>⚡ Drill</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Persistent Bottom Action Bar */}
      <View style={styles.persistentBottomBar}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('ResumeSetup')}
        >
          <Text style={styles.primaryBtnText}>Start New Mock Interview 🎙️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('MistakeDrill', { drillType: 'ZERO_FILLER' })}
        >
          <Text style={styles.secondaryBtnText}>Zero-Filler Biofeedback Drill ⚡</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  appTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.listeningCyan,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  settingsIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIconText: {
    fontSize: 18,
  },
  levelCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.elevatedBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    padding: 18,
    marginBottom: 18,
  },
  levelLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.listeningCyan,
  },
  scoreScale: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.interruptedAmber,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  weakSkillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.elevatedBackground,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
  },
  weakSkillInfo: {
    flex: 1,
  },
  drillMiniBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: colors.accentPrimary,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  drillMiniBtnText: {
    color: colors.accentPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  persistentBottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  bottomActions: {
    marginTop: 8,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
