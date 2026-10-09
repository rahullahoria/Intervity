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
} from 'react-native';
import { OfflineResumeParser } from '../core/resume/OfflineResumeParser';
import { IndianVoiceProfile, InterviewOptions, InterviewerPersona } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface ResumeSetupScreenProps {
  navigation: any;
}

const SAMPLE_RESUME_TEXT = `
Rahul Sharma
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
- Refactored legacy React Native bridge to modern JSI host objects, eliminating bridge serializations and boosting list render speeds from 38 FPS to 60 FPS.
`;

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
        <Text style={styles.appTag}>ON-DEVICE RESUME INGESTION</Text>
        <Text style={typography.h1}>Interview Setup</Text>
        <Text style={[typography.body, { marginBottom: 18 }]}>
          Your resume is parsed 100% locally on your smartphone. No data ever leaves your device.
        </Text>

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
          <Text style={styles.label}>Interviewer Voice & Persona (Kokoro en-IN)</Text>
          <View style={styles.personaGrid}>
            <TouchableOpacity
              style={[styles.personaCard, voiceProfile === 'hf_alpha' && styles.personaCardActive]}
              onPress={() => {
                setVoiceProfile('hf_alpha');
                setPersona('bengaluru_tech_lead');
              }}
            >
              <Text style={styles.personaName}>hf_alpha (Bengaluru Lead)</Text>
              <Text style={styles.personaDesc}>Neutral corporate Bangalore accent. Technical & engaging.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.personaCard, voiceProfile === 'hm_omega' && styles.personaCardActive]}
              onPress={() => {
                setVoiceProfile('hm_omega');
                setPersona('skeptical_architect');
              }}
            >
              <Text style={styles.personaName}>hm_omega (VP Engineering)</Text>
              <Text style={styles.personaDesc}>Authoritative, deep cadence. Probes scale & trade-offs.</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Extracted Profile Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={typography.h3}>Extracted Profile Preview</Text>
            <Text style={styles.badgeText}>On-Device NLP</Text>
          </View>

          <Text style={styles.candidateName}>{parsed.candidateName} • {parsed.yearsOfExperience}+ YOE</Text>

          <Text style={styles.subHeader}>Detected Technical Skills:</Text>
          <View style={styles.chipsWrap}>
            {parsed.skills.map((skill, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{skill}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.subHeader, { marginTop: 10 }]}>Recommended Probing Areas:</Text>
          <Text style={typography.caption}>
            {parsed.recommendedInterviewTopics.join(' • ')}
          </Text>
        </View>

        {/* Raw Resume Text Editor */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Resume Context</Text>
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
        <TouchableOpacity style={styles.launchBtn} onPress={startInterview}>
          <Text style={styles.launchBtnText}>Launch Voice Interview 🎙️</Text>
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
  appTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.listeningCyan,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
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
    borderColor: colors.listeningCyan,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  personaName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  personaDesc: {
    ...typography.caption,
  },
  previewCard: {
    backgroundColor: colors.elevatedBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 18,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.speakingEmerald,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.listeningCyan,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 12,
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
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  persistentBottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  launchBtn: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  launchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
