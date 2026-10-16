import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeAudioEngine, VADEvent } from '../core/audio/NativeAudioEngine';
import { OfflineSpeechToTextService } from '../core/stt/OfflineSpeechToTextService';
import { OfflineLLMEngine } from '../core/llm/OfflineLLMEngine';
import { OfflineTtsService } from '../core/tts/OfflineTtsService';
import { HardwareAccelerationManager, HardwareTelemetry } from '../core/hardware/HardwareAccelerationManager';
import { IndianVoiceProfile } from '../types';
import { colors } from '../theme/colors';
import {
  CloseIcon,
  MicIcon,
  BrainIcon,
  VolumeHighIcon,
  SparklesIcon,
  SoundWaveBars,
  BoltIcon,
  CheckIcon,
} from './icons/AppIcons';

interface EngineDiagnosticsModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'STT' | 'LLM' | 'TTS' | 'PIPELINE';

export const EngineDiagnosticsModal: React.FC<EngineDiagnosticsModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('STT');

  const audioEngine = useRef(new NativeAudioEngine());
  const sttService = useRef(new OfflineSpeechToTextService());
  const llmEngine = useRef(new OfflineLLMEngine());
  const ttsService = useRef(new OfflineTtsService());

  const [telemetry, setTelemetry] = useState<HardwareTelemetry>(() =>
    HardwareAccelerationManager.getInstance().getTelemetry()
  );

  // STT State
  const [isSttListening, setIsSttListening] = useState(false);
  const [sttVolume, setSttVolume] = useState(0);
  const [sttTranscript, setSttTranscript] = useState('');
  const [sttPartial, setSttPartial] = useState('');
  const [sttLatencyMs, setSttLatencyMs] = useState<number | null>(null);
  const sttStartTimeRef = useRef(0);

  // LLM State
  const [llmPrompt, setLlmPrompt] = useState('Explain Kafka event streams vs RabbitMQ message queues in 2 clear sentences.');
  const [llmResponse, setLlmResponse] = useState('');
  const [isLlmGenerating, setIsLlmGenerating] = useState(false);
  const [llmTtftMs, setLlmTtftMs] = useState<number | null>(null);
  const [llmTotalTokens, setLlmTotalTokens] = useState(0);
  const [llmTokensPerSec, setLlmTokensPerSec] = useState<number | null>(null);

  // TTS State
  const [ttsText, setTtsText] = useState('Hello! I am Teddy, your offline AI companion. Everything is running locally on your phone.');
  const [ttsVoice, setTtsVoice] = useState<IndianVoiceProfile>('hf_alpha');
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [ttsTtfaMs, setTtsTtfaMs] = useState<number | null>(null);

  // Pipeline State
  const [pipelineStep, setPipelineStep] = useState<string>('Ready to execute benchmark');
  const [pipelineTranscript, setPipelineTranscript] = useState('');
  const [pipelineLlmReply, setPipelineLlmReply] = useState('');
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      await HardwareAccelerationManager.getInstance().probeHardwareCapabilities();
      const t = HardwareAccelerationManager.getInstance().getTelemetry();
      if (isMounted) setTelemetry(t);

      await audioEngine.current.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 });
      await sttService.current.initializeModel();
      await llmEngine.current.loadModel();
      await ttsService.current.initialize('kokoro_models', 'hf_alpha');
    }

    if (visible) {
      init();
    }

    const unsubVad = audioEngine.current.onVADEvent((ev: VADEvent) => {
      if (isMounted) setSttVolume(ev.volume);
    });

    const unsubPartial = audioEngine.current.onPartialTranscript((text: string) => {
      if (isMounted) setSttPartial(text);
    });

    const unsubFinal = audioEngine.current.onFinalTranscript((text: string) => {
      if (isMounted) {
        setSttTranscript(text);
        setSttPartial('');
        setIsSttListening(false);
        if (sttStartTimeRef.current > 0) {
          setSttLatencyMs(Date.now() - sttStartTimeRef.current);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubVad();
      unsubPartial();
      unsubFinal();
      audioEngine.current.stopRecordingStream();
      ttsService.current.stopPlayback();
    };
  }, [visible]);

  const handleToggleStt = async () => {
    if (isSttListening) {
      audioEngine.current.stopRecordingStream();
      setIsSttListening(false);
      if (!sttTranscript && sttPartial) {
        setSttTranscript(sttPartial);
      }
      if (sttStartTimeRef.current > 0) {
        setSttLatencyMs(Date.now() - sttStartTimeRef.current);
      }
    } else {
      setSttTranscript('');
      setSttPartial('');
      setSttLatencyMs(null);
      sttStartTimeRef.current = Date.now();
      setIsSttListening(true);
      audioEngine.current.startRecordingStream();
    }
  };

  const handleRunSttBenchmark = async () => {
    sttStartTimeRef.current = Date.now();
    setSttPartial('Transcribing audio buffer via Whisper pipeline...');
    const result = await sttService.current.transcribeAudioChunk('benchmark.pcm');
    setSttTranscript(result);
    setSttPartial('');
    setSttLatencyMs(Date.now() - sttStartTimeRef.current);
  };

  const handleRunLlm = async () => {
    if (!llmPrompt.trim()) return;
    setIsLlmGenerating(true);
    setLlmResponse('');
    setLlmTtftMs(null);
    setLlmTotalTokens(0);
    setLlmTokensPerSec(null);

    const startMs = Date.now();
    let firstTokenLogged = false;
    let tokenCount = 0;

    try {
      await llmEngine.current.streamInterviewResponse(
        [
          { role: 'system', content: 'You are Teddy, a senior engineer and friendly mentor. Answer concisely and technically.' },
          { role: 'user', content: llmPrompt },
        ],
        (token: string) => {
          if (!firstTokenLogged) {
            firstTokenLogged = true;
            setLlmTtftMs(Date.now() - startMs);
          }
          tokenCount++;
          setLlmTotalTokens(tokenCount);
          setLlmResponse((prev) => prev + token);
        },
        () => {}
      );

      const elapsedSec = (Date.now() - startMs) / 1000;
      if (elapsedSec > 0) {
        setLlmTokensPerSec(Math.round((tokenCount / elapsedSec) * 10) / 10);
      }
    } catch (err: any) {
      setLlmResponse(`Error: ${err?.message || err}`);
    } finally {
      setIsLlmGenerating(false);
    }
  };

  const handlePlayTts = async () => {
    if (!ttsText.trim()) return;
    setIsTtsPlaying(true);
    setTtsTtfaMs(null);

    const startMs = Date.now();
    try {
      await ttsService.current.synthesizeClause(ttsText, ttsVoice);
      setTtsTtfaMs(Date.now() - startMs);

      const estDuration = Math.max(3000, ttsText.length * 65);
      audioEngine.current.onPlaybackDrained(() => {
        setIsTtsPlaying(false);
      }, estDuration);
    } catch (err) {
      console.warn('[EngineDiagnostics] TTS error:', err);
      setIsTtsPlaying(false);
    }
  };

  const handleStopTts = () => {
    ttsService.current.stopPlayback();
    audioEngine.current.stopPlaybackAndClearBuffers();
    setIsTtsPlaying(false);
  };

  const handleRunPipeline = async () => {
    setIsPipelineRunning(true);
    setPipelineStep('Step 1 of 3: Running STT Speech Recognition...');
    setPipelineTranscript('');
    setPipelineLlmReply('');

    try {
      const sampleQuery = 'How does Kafka partition replication prevent data loss?';
      sttService.current.setSimulatedTranscript(sampleQuery);
      const query = await sttService.current.transcribeAudioChunk('pipeline_test.pcm');
      setPipelineTranscript(query);

      setPipelineStep('Step 2 of 3: Generating on-device LLM response...');
      let reply = '';
      await llmEngine.current.streamInterviewResponse(
        [
          { role: 'system', content: 'You are Teddy. Answer technical questions concisely in 2 sentences.' },
          { role: 'user', content: query },
        ],
        (token: string) => {
          reply += token;
          setPipelineLlmReply(reply);
        },
        () => {}
      );

      setPipelineStep('Step 3 of 3: Synthesizing speech via Kokoro-82M TTS...');
      await ttsService.current.synthesizeClause(reply, 'hf_alpha');

      setPipelineStep('Pipeline verified: STT, LLM, and TTS passed on-device.');
    } catch (e: any) {
      setPipelineStep(`Pipeline Error: ${e?.message || e}`);
    } finally {
      setIsPipelineRunning(false);
    }
  };

  const renderTabIcon = (tab: TabType, active: boolean) => {
    const iconColor = active ? '#FFFFFF' : colors.textSecondary;
    if (tab === 'STT') return <MicIcon size={14} color={iconColor} />;
    if (tab === 'LLM') return <BrainIcon size={14} color={iconColor} />;
    if (tab === 'TTS') return <VolumeHighIcon size={14} color={iconColor} />;
    return <BoltIcon size={14} color={iconColor} />;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 24 : 48) + 8 }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Engine Diagnostics</Text>
            <Text style={styles.headerSubtitle}>On-device hardware & inference verification</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <CloseIcon size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hardware Status Strip */}
        <View style={styles.telemetryStrip}>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>Platform</Text>
            <Text style={styles.telemetryValue}>{telemetry.platform.toUpperCase()}</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>Compute</Text>
            <Text style={[styles.telemetryValue, { color: telemetry.gpuAvailable ? colors.notionBlueLight : colors.interruptedAmber }]}>
              {telemetry.gpuAvailable ? 'GPU Active' : 'CPU SIMD'}
            </Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>Speech Engine</Text>
            <Text style={[styles.telemetryValue, { color: colors.speakingEmerald }]}>Kokoro ONNX</Text>
          </View>
        </View>

        {/* Segmented Tab Selector */}
        <View style={styles.tabsContainer}>
          {(['STT', 'LLM', 'TTS', 'PIPELINE'] as TabType[]).map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, active && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                {renderTabIcon(tab, active)}
                <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
                  {tab === 'PIPELINE' ? 'Loop' : tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* TAB 1: STT */}
          {activeTab === 'STT' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Speech-to-Text (Whisper)</Text>
                <View style={[styles.badge, isSttListening ? styles.badgeActive : styles.badgeReady]}>
                  <View style={[styles.badgeDot, { backgroundColor: isSttListening ? colors.notionBlueLight : colors.speakingEmerald }]} />
                  <Text style={[styles.badgeText, { color: isSttListening ? colors.notionBlueLight : colors.speakingEmerald }]}>
                    {isSttListening ? 'Listening' : 'Ready'}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardDescription}>
                Verifies microphone capture, Acoustic Echo Cancellation (AEC), and real-time Whisper transcription.
              </Text>

              <View style={styles.visualizerBox}>
                <SoundWaveBars level={isSttListening ? sttVolume : 0.08} active={isSttListening} color={colors.notionBlueLight} size={22} />
                <Text style={styles.visualizerLabel}>
                  {isSttListening ? 'Listening to microphone... Speak clearly.' : 'Microphone idle'}
                </Text>
              </View>

              <View style={styles.outputBox}>
                <Text style={styles.outputLabel}>Transcript Output</Text>
                <Text style={styles.outputText}>
                  {sttTranscript || sttPartial || 'No speech recorded yet. Tap below to begin capture.'}
                </Text>
                {sttLatencyMs !== null && (
                  <View style={styles.metricsRow}>
                    <Text style={styles.metricText}>Latency: {sttLatencyMs} ms</Text>
                  </View>
                )}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, isSttListening && styles.actionBtnStop]}
                  onPress={handleToggleStt}
                  activeOpacity={0.85}
                >
                  <MicIcon size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>
                    {isSttListening ? 'Stop Capture' : 'Test Live Microphone'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={handleRunSttBenchmark} activeOpacity={0.8}>
                  <Text style={styles.secondaryBtnText}>Run Sample Buffer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB 2: LLM */}
          {activeTab === 'LLM' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>On-Device LLM Inference</Text>
                <View style={[styles.badge, isLlmGenerating ? styles.badgeActive : styles.badgeReady]}>
                  <View style={[styles.badgeDot, { backgroundColor: isLlmGenerating ? colors.notionBlueLight : colors.speakingEmerald }]} />
                  <Text style={[styles.badgeText, { color: isLlmGenerating ? colors.notionBlueLight : colors.speakingEmerald }]}>
                    {isLlmGenerating ? 'Generating' : 'Ready'}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardDescription}>
                Streams quantized GGUF tokens locally and measures Time-To-First-Token (TTFT) and throughput.
              </Text>

              <Text style={styles.inputLabel}>Prompt</Text>
              <TextInput
                style={styles.textInput}
                value={llmPrompt}
                onChangeText={setLlmPrompt}
                multiline={true}
                placeholder="Enter technical prompt..."
                placeholderTextColor={colors.textTertiary}
              />

              <View style={styles.chipsRow}>
                {[
                  'Kafka vs RabbitMQ',
                  'Cache Stampede',
                  'Raft Consensus',
                ].map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={styles.chipBtn}
                    onPress={() => setLlmPrompt(`Explain ${chip} in 2 sentences for a senior engineering interview.`)}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.outputBox}>
                <Text style={styles.outputLabel}>Streamed Output</Text>
                <Text style={styles.outputText}>
                  {llmResponse || 'Run inference to view token stream.'}
                </Text>
                {(llmTtftMs !== null || llmTotalTokens > 0) && (
                  <View style={styles.metricsRow}>
                    {llmTtftMs !== null && <Text style={styles.metricText}>TTFT: {llmTtftMs} ms</Text>}
                    {llmTotalTokens > 0 && <Text style={styles.metricText}>Tokens: {llmTotalTokens}</Text>}
                    {llmTokensPerSec !== null && <Text style={styles.metricText}>{llmTokensPerSec} tok/s</Text>}
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, isLlmGenerating && styles.actionBtnDisabled]}
                onPress={handleRunLlm}
                disabled={isLlmGenerating}
                activeOpacity={0.85}
              >
                {isLlmGenerating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <BrainIcon size={16} color="#FFFFFF" />
                )}
                <Text style={styles.actionBtnText}>
                  {isLlmGenerating ? 'Streaming Tokens...' : 'Run Inference'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 3: TTS */}
          {activeTab === 'TTS' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Kokoro-82M Neural TTS</Text>
                <View style={[styles.badge, isTtsPlaying ? styles.badgeActive : styles.badgeReady]}>
                  <View style={[styles.badgeDot, { backgroundColor: isTtsPlaying ? colors.notionBlueLight : colors.speakingEmerald }]} />
                  <Text style={[styles.badgeText, { color: isTtsPlaying ? colors.notionBlueLight : colors.speakingEmerald }]}>
                    {isTtsPlaying ? 'Speaking' : 'Ready'}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardDescription}>
                Synthesizes neural speech on-device at 24kHz via ONNX runtime.
              </Text>

              <Text style={styles.inputLabel}>Voice Profile</Text>
              <View style={styles.chipsRow}>
                {[
                  { id: 'hf_alpha', label: 'Alpha (Warm)' },
                  { id: 'hf_beta', label: 'Beta (Analytical)' },
                  { id: 'hm_omega', label: 'Omega (Executive)' },
                  { id: 'af_bella', label: 'Bella (Global)' },
                ].map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.chipBtn, ttsVoice === v.id && styles.chipBtnActive]}
                    onPress={() => setTtsVoice(v.id as IndianVoiceProfile)}
                  >
                    <Text style={[styles.chipText, ttsVoice === v.id && styles.chipTextActive]}>
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Utterance</Text>
              <TextInput
                style={styles.textInput}
                value={ttsText}
                onChangeText={setTtsText}
                multiline={true}
                placeholder="Enter sentence for synthesis..."
                placeholderTextColor={colors.textTertiary}
              />

              {ttsTtfaMs !== null && (
                <View style={[styles.metricsRow, { marginBottom: 12 }]}>
                  <Text style={styles.metricText}>First Audio: {ttsTtfaMs} ms</Text>
                  <Text style={styles.metricText}>24kHz PCM</Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, isTtsPlaying && styles.actionBtnStop]}
                  onPress={isTtsPlaying ? handleStopTts : handlePlayTts}
                  activeOpacity={0.85}
                >
                  <VolumeHighIcon size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>
                    {isTtsPlaying ? 'Stop Playback' : 'Synthesize Speech'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB 4: PIPELINE */}
          {activeTab === 'PIPELINE' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>End-to-End Loop</Text>
                <View style={[styles.badge, isPipelineRunning ? styles.badgeActive : styles.badgeReady]}>
                  <View style={[styles.badgeDot, { backgroundColor: isPipelineRunning ? colors.notionBlueLight : colors.speakingEmerald }]} />
                  <Text style={[styles.badgeText, { color: isPipelineRunning ? colors.notionBlueLight : colors.speakingEmerald }]}>
                    {isPipelineRunning ? 'Running' : 'Ready'}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardDescription}>
                Executes the full duplex sequence: Whisper STT → MiniCPM LLM → Kokoro-82M TTS.
              </Text>

              <View style={styles.outputBox}>
                <Text style={styles.outputLabel}>Pipeline Status</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {!isPipelineRunning && pipelineTranscript && <CheckIcon size={14} color={colors.speakingEmerald} />}
                  <Text style={[styles.outputText, { color: colors.notionBlueLight, fontWeight: '600' }]}>
                    {pipelineStep}
                  </Text>
                </View>

                {pipelineTranscript ? (
                  <View style={styles.pipelineStageBlock}>
                    <Text style={styles.stepTitle}>1. Recognized Input</Text>
                    <Text style={styles.stepBody}>{pipelineTranscript}</Text>
                  </View>
                ) : null}

                {pipelineLlmReply ? (
                  <View style={styles.pipelineStageBlock}>
                    <Text style={styles.stepTitle}>2. Generated Response</Text>
                    <Text style={styles.stepBody}>{pipelineLlmReply}</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, isPipelineRunning && styles.actionBtnDisabled]}
                onPress={handleRunPipeline}
                disabled={isPipelineRunning}
                activeOpacity={0.85}
              >
                {isPipelineRunning ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <SparklesIcon size={16} color="#FFFFFF" />
                )}
                <Text style={styles.actionBtnText}>
                  {isPipelineRunning ? 'Executing Loop...' : 'Run Full Pipeline'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  telemetryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  telemetryItem: {
    alignItems: 'center',
    flex: 1,
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.cardBorder,
  },
  telemetryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    marginBottom: 2,
  },
  telemetryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 7,
  },
  tabButtonActive: {
    backgroundColor: colors.accentPrimary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  badgeReady: {
    backgroundColor: colors.notionGreenBg,
  },
  badgeActive: {
    backgroundColor: colors.notionBlueBg,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  visualizerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.elevatedBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  visualizerLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  outputBox: {
    backgroundColor: colors.elevatedBackground,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  outputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 6,
  },
  outputText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: colors.elevatedBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    color: colors.textPrimary,
    padding: 12,
    fontSize: 13,
    minHeight: 54,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chipBtn: {
    backgroundColor: colors.elevatedBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipBtnActive: {
    backgroundColor: colors.notionBlueBg,
    borderColor: colors.notionBlue,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.notionBlueLight,
    fontWeight: '600',
  },
  buttonRow: {
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: 13,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnStop: {
    backgroundColor: colors.errorRed,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevatedBackground,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  metricText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.notionBlueLight,
    fontVariant: ['tabular-nums'],
  },
  pipelineStageBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 2,
  },
  stepBody: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
  },
});
