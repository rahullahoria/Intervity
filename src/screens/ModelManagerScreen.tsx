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
import { ChevronLeftIcon, CheckIcon, SparklesIcon } from '../components/icons/AppIcons';
import { HardwareAccelerationManager, HardwareTelemetry } from '../core/hardware/HardwareAccelerationManager';
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
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 48
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
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeftIcon size={18} color="#38BDF8" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.appTag}>ON-DEVICE AI ASSET MANAGER</Text>
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
        <Text style={typography.h1}>Offline Model Weights</Text>
        <Text style={[typography.body, { marginBottom: 18 }]}>
          These models run directly on your smartphone NPU & GPU with zero cloud dependencies and zero latency.
        </Text>

        {/* Global Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Total Local Storage</Text>
            <Text style={styles.progressPercentText}>{progressPercent}%</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <Text style={typography.caption}>
            {formatMB(downloadedBytes)} MB of {formatMB(totalBytes)} MB downloaded to DocumentDirectory
          </Text>
        </View>

        {/* Hardware Acceleration & Compute Status Card */}
        <View style={styles.hardwareCard}>
          <View style={styles.hardwareHeaderRow}>
            <Text style={styles.hardwareCardTitle}>HARDWARE COMPUTE ENGINE</Text>
            <View style={[
              styles.hardwareBadge,
              telemetry.gpuAvailable ? styles.gpuBadgeActive : styles.cpuBadgeActive
            ]}>
              <Text style={styles.hardwareBadgeText}>
                {telemetry.gpuAvailable ? 'GPU ACCELERATED' : 'CPU MULTI-THREADED'}
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
                {telemetry.platform === 'ios' ? 'Apple Metal & Neural' : 'Android OpenCL / ARM NEON'}
              </Text>
            </View>
          </View>

          <Text style={styles.hardwareNote}>
            Zero-Crash Architecture: Devices without dedicated GPU automatically route tensor workloads to CPU multi-threading.
          </Text>
        </View>

        {/* Individual Engine Diagnostics Trigger */}
        <TouchableOpacity
          style={styles.diagnosticsBtn}
          onPress={() => setIsDiagnosticsOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.diagnosticsIconWrap}>
            <SparklesIcon size={18} color="#38BDF8" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.diagnosticsBtnTitle}>Test STT, LLM & TTS Individually</Text>
            <Text style={styles.diagnosticsBtnSubtitle}>Live phone mic, token stream & speech tests</Text>
          </View>
          <Text style={styles.diagnosticsBtnArrow}>➔</Text>
        </TouchableOpacity>

        {/* Model Asset List */}
        {models.map((model) => {
          const modelPercent = Math.round((model.downloadedBytes / model.sizeBytes) * 100);

          return (
            <View key={model.id} style={styles.modelCard}>
              <View style={styles.modelHeaderRow}>
                <Text style={typography.bodyBold}>{model.name}</Text>
                <Text style={styles.modelSizeText}>{formatMB(model.sizeBytes)} MB</Text>
              </View>

              <Text style={styles.fileNameText}>File: {model.localFileName}</Text>

              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${modelPercent}%` }]} />
              </View>

              <View style={styles.modelFooterRow}>
                <View style={styles.modelStatusRow}>
                  {model.isDownloaded && <CheckIcon size={14} color="#10B981" />}
                  <Text style={[typography.caption, model.isDownloaded && { color: '#10B981', fontWeight: '600' }]}>
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
            <TouchableOpacity style={styles.downloadAllBtn} onPress={downloadAll}>
              <Text style={styles.downloadAllBtnText}>Download All AI Models ({formatMB(totalBytes)} MB)</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.readyBanner}>
              <Text style={styles.readyBannerText}>✓ 100% Offline AI Engines Ready!</Text>
            </View>
          )}

          <TouchableOpacity style={styles.clearBtn} onPress={clearStorage}>
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
  diagnosticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    padding: 14,
    marginBottom: 18,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  diagnosticsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagnosticsBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  diagnosticsBtnSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  diagnosticsBtnArrow: {
    fontSize: 16,
    color: '#38BDF8',
    fontWeight: '700',
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#161E30',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  appTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.listeningCyan,
    letterSpacing: 1.2,
  },
  headerRightSpacer: {
    minWidth: 64,
  },
  progressCard: {
    backgroundColor: colors.elevatedBackground,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 18,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    ...typography.h3,
  },
  progressPercentText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.listeningCyan,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.listeningCyan,
  },
  hardwareCard: {
    backgroundColor: colors.elevatedBackground,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 16,
  },
  hardwareHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hardwareCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#38BDF8',
  },
  hardwareBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gpuBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  cpuBadgeActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  hardwareBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E0E7FF',
  },
  hardwareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  hardwareGridItem: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  hardwareLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  hardwareValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hardwareNote: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  modelCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 12,
  },
  modelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelSizeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  fileNameText: {
    ...typography.caption,
    marginTop: 2,
    marginBottom: 6,
  },
  modelFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  modelStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadSmallBtn: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  downloadSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    marginTop: 18,
    gap: 12,
  },
  downloadAllBtn: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  downloadAllBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  readyBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: colors.speakingEmerald,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  readyBannerText: {
    color: colors.speakingEmerald,
    fontSize: 15,
    fontWeight: '700',
  },
  clearBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearBtnText: {
    color: colors.textTertiary,
    fontSize: 13,
  },
});
