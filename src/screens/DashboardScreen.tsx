/**
 * Dashboard / Home Screen
 * Displays candidate mastery level, multi-discipline radar chart, weakest skills, and quick actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSkillMastery } from '../hooks/useSkillMastery';
import { RadarChart } from '../components/RadarChart';
import {
  SettingsIcon,
  MicIcon,
  BoltIcon,
  BookOpenIcon,
  UserIcon,
  ArrowRightIcon,
} from '../components/icons/AppIcons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { skills, weakestSkills } = useSkillMastery();

  const averageScore =
    skills.length > 0
      ? Math.round(skills.reduce((sum, s) => sum + s.current_score, 0) / skills.length)
      : 68;

  let overallLevel = 'Developing • L3';
  let levelTone = colors.notionOrange;
  let levelBg = colors.notionOrangeBg;
  if (averageScore >= 90) {
    overallLevel = 'Staff • L6';
    levelTone = colors.notionGreen;
    levelBg = colors.notionGreenBg;
  } else if (averageScore >= 80) {
    overallLevel = 'Senior • L5';
    levelTone = colors.notionGreen;
    levelBg = colors.notionGreenBg;
  } else if (averageScore >= 60) {
    overallLevel = 'Proficient • L4';
    levelTone = colors.notionBlueLight;
    levelBg = colors.notionBlueBg;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Studio Top Navigation Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandGroup}>
          <TouchableOpacity
            style={styles.modeSwitchPill}
            onPress={() => navigation.navigate('AgentCoaching')}
            activeOpacity={0.75}
          >
            <BookOpenIcon size={13} color={colors.notionBlueLight} />
            <Text style={styles.modeSwitchText}>Masterclass</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Competency Matrix</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('VoiceEnrollment')}
            activeOpacity={0.75}
            accessibilityLabel="Voice Calibration"
          >
            <UserIcon size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('ModelManager')}
            activeOpacity={0.75}
            accessibilityLabel="Engine & Model Settings"
          >
            <SettingsIcon size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Candidate Readiness Telemetry Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelCardTop}>
            <View style={styles.levelMetaCol}>
              <Text style={styles.levelLabel}>On-Device Readiness Index</Text>
              <View style={[styles.levelBadge, { backgroundColor: levelBg }]}>
                <View style={[styles.levelDot, { backgroundColor: levelTone }]} />
                <Text style={[styles.levelBadgeText, { color: levelTone }]}>{overallLevel}</Text>
              </View>
            </View>

            <View style={styles.scoreBlock}>
              <Text style={styles.scoreNumber}>{averageScore}</Text>
              <Text style={styles.scoreScale}>/100</Text>
            </View>
          </View>

          <View style={styles.readinessTrack}>
            <View
              style={[
                styles.readinessFill,
                { width: `${Math.min(100, Math.max(8, averageScore))}%` },
              ]}
            />
          </View>

          <View style={styles.readinessFooter}>
            <Text style={styles.readinessFootnote}>
              Weighted across {skills.length || 6} core engineering dimensions
            </Text>
            <Text style={styles.readinessTarget}>Target: 85+ for L5</Text>
          </View>
        </View>

        {/* Skill Mastery Radar Chart */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Discipline Distribution</Text>
              <Text style={styles.sectionSubtitle}>
                Updated after every interview turn via Bayesian EMA
              </Text>
            </View>
          </View>

          <RadarChart skills={skills} size={256} />
        </View>

        {/* Spaced Repetition Focus: Weakest Skills */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Priority Focus Areas</Text>
              <Text style={styles.sectionSubtitle}>
                Probed automatically in your next mock interview
              </Text>
            </View>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>Spaced Repetition</Text>
            </View>
          </View>

          <View style={styles.weakSkillsList}>
            {weakestSkills.map((item, idx) => {
              const score = Math.round(item.current_score);
              const barColor =
                score >= 75
                  ? colors.notionGreen
                  : score >= 60
                  ? colors.notionBlueLight
                  : colors.notionOrange;

              return (
                <View key={idx} style={styles.weakSkillRow}>
                  <View style={styles.weakSkillInfo}>
                    <View style={styles.weakSkillTitleRow}>
                      <Text style={styles.weakSkillName}>{item.skill_name}</Text>
                      <Text style={styles.weakSkillScore}>{score}/100</Text>
                    </View>
                    <View style={styles.skillMiniTrack}>
                      <View
                        style={[
                          styles.skillMiniFill,
                          { width: `${Math.max(8, Math.min(100, score))}%`, backgroundColor: barColor },
                        ]}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.drillMiniBtn}
                    onPress={() =>
                      navigation.navigate('MistakeDrill', {
                        drillType: 'MISTAKE_CORRECTION',
                        targetSkillId: item.skill_id,
                        skillName: item.skill_name,
                      })
                    }
                    activeOpacity={0.75}
                  >
                    <BoltIcon size={12} color={colors.notionBlueLight} />
                    <Text style={styles.drillMiniBtnText}>Drill</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom Action Bar */}
      <View style={styles.persistentBottomBar}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('ResumeSetup')}
          activeOpacity={0.85}
        >
          <MicIcon size={17} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Start Mock Interview</Text>
          <ArrowRightIcon size={15} color="rgba(255,255,255,0.75)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('MistakeDrill', { drillType: 'ZERO_FILLER' })}
          activeOpacity={0.75}
        >
          <BoltIcon size={14} color={colors.textSecondary} />
          <Text style={styles.secondaryBtnText}>Zero-Filler Reflex Drill</Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modeSwitchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.notionBlueBg,
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.25)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  modeSwitchText: {
    color: colors.notionBlueLight,
    fontSize: 11,
    fontWeight: '600',
  },
  screenTitle: {
    ...typography.h3,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 32,
    gap: 16,
  },
  levelCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
  },
  levelCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  levelMetaCol: {
    gap: 6,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  scoreScale: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: '600',
    marginLeft: 2,
  },
  readinessTrack: {
    height: 5,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  readinessFill: {
    height: '100%',
    backgroundColor: colors.notionBlue,
    borderRadius: 3,
  },
  readinessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readinessFootnote: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  readinessTarget: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  sectionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pillBadge: {
    backgroundColor: colors.notionOrangeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.notionOrange,
  },
  weakSkillsList: {
    marginTop: 8,
    gap: 8,
  },
  weakSkillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    padding: 12,
    gap: 14,
  },
  weakSkillInfo: {
    flex: 1,
    gap: 6,
  },
  weakSkillTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weakSkillName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  weakSkillScore: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  skillMiniTrack: {
    height: 4,
    backgroundColor: colors.cardBackground,
    borderRadius: 2,
    overflow: 'hidden',
  },
  skillMiniFill: {
    height: '100%',
    borderRadius: 2,
  },
  drillMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.notionBlueBg,
    borderColor: 'rgba(79, 110, 247, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },
  drillMiniBtnText: {
    color: colors.notionBlueLight,
    fontSize: 12,
    fontWeight: '600',
  },
  persistentBottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.notionBlue,
    paddingVertical: 14,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 12,
    borderRadius: 10,
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
