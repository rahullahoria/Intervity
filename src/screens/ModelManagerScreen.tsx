/**
 * Model Manager Screen
 * Manages downloading, checksum verification, and local disk persistence for quantized on-device models
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useModelDownloads } from '../hooks/useModelDownloads';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  SparklesIcon,
  CpuIcon,
} from '../components/icons/AppIcons';
import {
  HardwareAccelerationManager,
  HardwareTelemetry,
} from '../core/hardware/HardwareAccelerationManager';
import { EngineDiagnosticsModal } from '../components/EngineDiagnosticsModal';

interface ModelManagerScreenProps {
  navigation: any;
}

export const ModelManagerScreen: React.FC<ModelManagerScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const {
    models,
    totalBytes,
    downloadedBytes,
    progressPercent,
    isReady,
    startDownload,
    downloadAll,
    clearStorage,
  } = useModelDownloads();

  const [telemetry, setTelemetry] = useState<HardwareTelemetry>(() =>
    HardwareAccelerationManager.getInstance().getTelemetry()
  );

  useEffect(() => {
    HardwareAccelerationManager.getInstance()
      .probeHardwareCapabilities()
      .then((t) => setTelemetry(t))
      .catch(() => {});
  }, []);

  const formatMB = (bytes: number) => Math.round(bytes / (1024 * 1024));

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 28 : 48
  );
  const bottomInset = Math.max(insets.bottom, 24);

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={true} />

      {/* Top Header - Protected from Dynamic Island & Notch Collision */}
      <View style={[styles.topHeader, { paddingTop: topInset + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeftIcon size={16} color={colors.textSecondary} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Engine & Model Weights</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: bottomInset + 48 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroHeader}>
          <Text style={typography.h1}>On-Device AI Runtime</Text>
          <Text style={styles.heroSubtitle}>
            Quantized models execute directly on your device NPU & GPU with zero cloud latency.
          </Text>
        </View>

        {/* Global Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Local Weight Storage</Text>
            <Text style={styles.progressPercentText}>{progressPercent}%</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <Text style={styles.storageCaption}>
            {formatMB(downloadedBytes)} MB of {formatMB(totalBytes)} MB cached in DocumentDirectory
          </Text>
        </View>

        {/* Hardware Acceleration & Compute Status Card */}
        <View style={styles.hardwareCard}>
          <View style={styles.hardwareHeaderRow}>
            <View style={styles.hardwareTitleGroup}>
              <CpuIcon size={15} color={colors.notionBlueLight} />
              <Text style={styles.hardwareCardTitle}>Hardware Compute Engine</Text>
            </View>
            <View
              style={[
                styles.hardwareBadge,
                telemetry.gpuAvailable ? styles.gpuBadgeActive : styles.cpuBadgeActive,
              ]}
            >
              <View
                style={[
                  styles.hardwareDot,
                  {
                    backgroundColor: telemetry.gpuAvailable
                      ? colors.speakingEmerald
                      : colors.interruptedAmber,
                  },
                ]}
              />
              <Text
                style={[
                  styles.hardwareBadgeText,
                  {
                    color: telemetry.gpuAvailable
                      ? colors.speakingEmerald
                      : colors.interruptedAmber,
                  },
                ]}
              >
                {telemetry.gpuAvailable ? 'GPU Accelerated' : 'CPU Multi-Threaded'}
              </Text>
            </View>
          </View>

          <View style={styles.hardwareGrid}>
            <View style={styles.hardwareGridItem}>
              <Text style={styles.hardwareLabel}>LLM Engine (MiniCPM5)</Text>
              <Text style={styles.hardwareValue}>
                {telemetry.activeLlmMode === 'gpu'
                  ? 'GPU (99 Layers Offloaded)'
                  : telemetry.activeLlmMode === 'cpu'
                  ? 'CPU Fallback (NEON SIMD)'
                  : 'Auto GPU / CPU Fallback'}
              </Text>
            </View>
            <View style={styles.hardwareGridItem}>
              <Text style={styles.hardwareLabel}>Whisper STT</Text>
              <Text style={styles.hardwareValue}>
                {telemetry.activeSttMode === 'gpu'
                  ? 'GPU / CoreML (Low-Latency)'
                  : telemetry.activeSttMode === 'cpu'
                  ? 'CPU Fallback (4 Threads)'
                  : 'Auto GPU / CPU Fallback'}
              </Text>
            </View>
            <View style={styles.hardwareGridItem}>
              <Text style={styles.hardwareLabel}>Mascot & UI Rendering</Text>
              <Text style={styles.hardwareValue}>GPU Hardware Compositor</Text>
            </View>
            <View style={styles.hardwareGridItem}>
              <Text style={styles.hardwareLabel}>Architecture</Text>
              <Text style={styles.hardwareValue}>
                {telemetry.platform === 'ios'
                  ? 'Apple Metal & Neural'
                  : 'Android OpenCL / ARM NEON'}
              </Text>
            </View>
          </View>

          <Text style={styles.hardwareNote}>
            Zero-Crash Fallback: Devices without dedicated GPU automatically route tensor workloads to SIMD multi-threading.
          </Text>
        </View>

        {/* Individual Engine Diagnostics Trigger */}
        <TouchableOpacity
          style={styles.diagnosticsBtn}
          onPress={() => setIsDiagnosticsOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.diagnosticsIconWrap}>
            <SparklesIcon size={17} color={colors.notionBlueLight} />
          </View>
          <View style={styles.diagnosticsTextCol}>
            <Text style={styles.diagnosticsBtnTitle}>Interactive Engine Diagnostics</Text>
            <Text style={styles.diagnosticsBtnSubtitle}>
              Verify live microphone STT, LLM token streaming & Kokoro TTS
            </Text>
          </View>
          <ChevronRightIcon size={16} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* Model Asset List */}
        <Text style={styles.sectionHeaderLabel}>Quantized Model Assets</Text>
        {models.map((model) => {
          const modelPercent = Math.round((model.downloadedBytes / model.sizeBytes) * 100);

          return (
            <View key={model.id} style={styles.modelCard}>
              <View style={styles.modelHeaderRow}>
                <Text style={styles.modelNameText}>{model.name}</Text>
                <Text style={styles.modelSizeText}>{formatMB(model.sizeBytes)} MB</Text>
              </View>

              <Text style={styles.fileNameText}>{model.localFileName}</Text>

              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${modelPercent}%` }]} />
              </View>

              <View style={styles.modelFooterRow}>
                <View style={styles.modelStatusRow}>
                  {model.isDownloaded && <CheckIcon size={13} color={colors.speakingEmerald} />}
                  <Text
                    style={[
                      styles.modelStatusText,
                      model.isDownloaded && { color: colors.speakingEmerald, fontWeight: '600' },
                    ]}
                  >
                    {model.isDownloaded
                      ? 'Verified & Locked in RAM'
                      : model.isDownloading
                      ? `Downloading: ${modelPercent}%`
                      : 'Pending Download'}
                  </Text>
                </View>

                {!model.isDownloaded && !model.isDownloading ? (
                  <TouchableOpacity
                    style={styles.downloadSmallBtn}
                    onPress={() => startDownload(model.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.downloadSmallBtnText}>Download</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}

        {/* Action Controls */}
        <View style={styles.actionsContainer}>
          {!isReady ? (
            <TouchableOpacity
              style={styles.downloadAllBtn}
              onPress={downloadAll}
              activeOpacity={0.85}
            >
              <Text style={styles.downloadAllBtnText}>
                Download All Models ({formatMB(totalBytes)} MB)
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.readyBanner}>
              <CheckIcon size={15} color={colors.speakingEmerald} />
              <Text style={styles.readyBannerText}>All Offline AI Engines Verified & Ready</Text>
            </View>
          )}

          <TouchableOpacity style={styles.clearBtn} onPress={clearStorage} activeOpacity={0.75}>
            <Text style={styles.clearBtnText}>Reclaim Local Disk Storage</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Interactive Diagnostics Modal */}
      <EngineDiagnosticsModal
        visible={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
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
  topHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  headerRightSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  heroHeader: {
    marginBottom: 18,
  },
  heroSubtitle: {
    ...typography.body,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressPercentText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.notionBlueLight,
    fontVariant: ['tabular-nums'],
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.notionBlue,
    borderRadius: 3,
  },
  storageCaption: {
    fontSize: 11,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  hardwareCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  hardwareHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hardwareTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hardwareCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hardwareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hardwareDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gpuBadgeActive: {
    backgroundColor: colors.notionGreenBg,
  },
  cpuBadgeActive: {
    backgroundColor: colors.notionOrangeBg,
  },
  hardwareBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  hardwareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  hardwareGridItem: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  hardwareLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 3,
  },
  hardwareValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hardwareNote: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  diagnosticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 20,
  },
  diagnosticsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.notionBlueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagnosticsTextCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  diagnosticsBtnTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  diagnosticsBtnSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeaderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  modelCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 10,
  },
  modelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modelSizeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  fileNameText: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
    marginBottom: 4,
  },
  modelFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  modelStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modelStatusText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  downloadSmallBtn: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  downloadSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 14,
    gap: 10,
  },
  downloadAllBtn: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  downloadAllBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  readyBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.notionGreenBg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingVertical: 13,
    borderRadius: 10,
  },
  readyBannerText: {
    color: colors.speakingEmerald,
    fontSize: 13,
    fontWeight: '600',
  },
  clearBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearBtnText: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: '500',
  },
});
