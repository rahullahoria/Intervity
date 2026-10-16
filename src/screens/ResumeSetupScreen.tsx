/**
 * Resume Setup Screen
 * On-device resume ingestion, skill extraction, persona selection (en-IN voices), and target role setup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { OfflineResumeParser } from '../core/resume/OfflineResumeParser';
import { IndianVoiceProfile, InterviewOptions, InterviewerPersona } from '../types';
import {
  ChevronLeftIcon,
  MicIcon,
  CheckIcon,
  ArrowRightIcon,
  CpuIcon,
} from '../components/icons/AppIcons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface ResumeSetupScreenProps {
  navigation: any;
}

const SAMPLE_RESUME_TEXT = `Rahul Sharma
Staff Software Engineer | Bengaluru, India
Education: B.Tech in Computer Science, IIT Bombay (CGPA: 8.8/10)

Summary:
6+ years experience architecting high-throughput distributed systems and React Native mobile applications.
Current CTC: 48 LPA. Notice Period: Immediate joiner.

Core Technical Skills:
React Native, TypeScript, JSI, C++, Kafka, Redis, PostgreSQL, Distributed Systems, Concurrency, Docker.

Experience:
Staff Software Engineer at Unicorn Startup (Bengaluru)
- Architected full-duplex on-device audio streaming engine handling 40k concurrent connections with sub-300ms p99 latency.
- Implemented distributed Redis caching with probabilistic early expiration (XFetch) to prevent cache stampedes during flash sales.
- Refactored legacy React Native bridge to modern JSI host objects, eliminating bridge serializations and boosting list render speeds from 38 FPS to 60 FPS.`;

export const ResumeSetupScreen: React.FC<ResumeSetupScreenProps> = ({ navigation }) => {
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME_TEXT);
  const [targetRole, setTargetRole] = useState('Senior Staff React Native Engineer');
  const [voiceProfile, setVoiceProfile] = useState<IndianVoiceProfile>('hf_alpha');
  const [persona, setPersona] = useState<InterviewerPersona>('bengaluru_tech_lead');

  const parsed = OfflineResumeParser.parseResumeText(resumeText);

  const startInterview = () => {
    const interviewOptions: InterviewOptions = {
      resume: parsed,
      targetRole,
      dialect: 'en-IN',
      voiceProfile,
      interviewerPersona: persona,
      targetLevel: 'Senior / Staff Engineer (L5-L6)',
    };

    navigation.navigate('InterviewSession', { interviewOptions });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <ChevronLeftIcon size={16} color={colors.textSecondary} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Interview Configuration</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroHeader}>
          <Text style={typography.h1}>Context & Persona</Text>
          <Text style={styles.heroSubtitle}>
            Your resume is parsed locally on-device to tailor technical follow-ups.
          </Text>
        </View>

        {/* Target Role Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Engineering Role</Text>
          <TextInput
            style={styles.textInput}
            value={targetRole}
            onChangeText={setTargetRole}
            placeholder="e.g. Senior Backend Engineer"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Interviewer Persona & Voice Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Interviewer Persona & Acoustic Model</Text>
          <View style={styles.personaGrid}>
            <TouchableOpacity
              style={[styles.personaCard, voiceProfile === 'hf_alpha' && styles.personaCardActive]}
              onPress={() => {
                setVoiceProfile('hf_alpha');
                setPersona('bengaluru_tech_lead');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.personaTopRow}>
                <View style={styles.personaTitleGroup}>
                  <Text style={styles.personaName}>Bengaluru Tech Lead</Text>
                  <View style={styles.voiceCodePill}>
                    <Text style={styles.voiceCodeText}>hf_alpha • en-IN</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    voiceProfile === 'hf_alpha' && styles.radioOuterActive,
                  ]}
                >
                  {voiceProfile === 'hf_alpha' && <CheckIcon size={11} color="#FFFFFF" />}
                </View>
              </View>
              <Text style={styles.personaDesc}>
                Measured corporate Bangalore cadence. Focuses on practical system architecture and execution depth.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.personaCard, voiceProfile === 'hm_omega' && styles.personaCardActive]}
              onPress={() => {
                setVoiceProfile('hm_omega');
                setPersona('skeptical_architect');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.personaTopRow}>
                <View style={styles.personaTitleGroup}>
                  <Text style={styles.personaName}>Principal / VP Engineering</Text>
                  <View style={styles.voiceCodePill}>
                    <Text style={styles.voiceCodeText}>hm_omega • en-IN</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    voiceProfile === 'hm_omega' && styles.radioOuterActive,
                  ]}
                >
                  {voiceProfile === 'hm_omega' && <CheckIcon size={11} color="#FFFFFF" />}
                </View>
              </View>
              <Text style={styles.personaDesc}>
                Direct, analytical bar-raiser. Challenges failure modes, tail latency, and L6 trade-offs.
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Extracted Profile Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewTitleRow}>
              <CpuIcon size={14} color={colors.notionBlueLight} />
              <Text style={styles.previewTitle}>Extracted Candidate Profile</Text>
            </View>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>On-Device NLP</Text>
            </View>
          </View>

          <Text style={styles.candidateName}>
            {parsed.candidateName} • {parsed.yearsOfExperience}+ Years Experience
          </Text>

          <Text style={styles.subHeader}>Detected Technical Stack</Text>
          <View style={styles.chipsWrap}>
            {parsed.skills.map((skill, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{skill}</Text>
              </View>
            ))}
          </View>

          <View style={styles.probingSection}>
            <Text style={styles.subHeader}>Scheduled Probing Domains</Text>
            <Text style={styles.probingText}>
              {parsed.recommendedInterviewTopics.join('  •  ')}
            </Text>
          </View>
        </View>

        {/* Raw Resume Text Editor */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Raw Resume Source</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={resumeText}
            onChangeText={setResumeText}
            multiline
            numberOfLines={8}
            placeholder="Paste candidate resume text here..."
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </ScrollView>

      {/* Pinned Launch Button Bar */}
      <View style={styles.persistentBottomBar}>
        <TouchableOpacity style={styles.launchBtn} onPress={startInterview} activeOpacity={0.85}>
          <MicIcon size={17} color="#FFFFFF" />
          <Text style={styles.launchBtnText}>Launch Voice Interview</Text>
          <ArrowRightIcon size={15} color="rgba(255,255,255,0.75)" />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  topBarSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 36,
  },
  heroHeader: {
    marginBottom: 20,
  },
  heroSubtitle: {
    ...typography.body,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    height: 140,
    textAlignVertical: 'top',
    fontSize: 12,
    lineHeight: 18,
  },
  personaGrid: {
    gap: 10,
  },
  personaCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
  },
  personaCardActive: {
    borderColor: colors.notionBlue,
    backgroundColor: colors.notionBlueBg,
  },
  personaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  personaTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  personaName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  voiceCodePill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  voiceCodeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    backgroundColor: colors.notionBlue,
    borderColor: colors.notionBlue,
  },
  personaDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  previewCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 18,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  badgePill: {
    backgroundColor: colors.notionGreenBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.speakingEmerald,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.notionBlueLight,
    marginBottom: 12,
  },
  subHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  probingSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  probingText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  persistentBottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  launchBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    paddingVertical: 15,
    borderRadius: 10,
  },
  launchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
