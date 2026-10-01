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
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useModelDownloads } from '../hooks/useModelDownloads';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ChevronLeftIcon, CheckIcon } from '../components/icons/AppIcons';
import { HardwareAccelerationManager, HardwareTelemetry } from '../core/hardware/HardwareAccelerationManager';

interface ModelManagerScreenProps {
  navigation: any;
}

export const ModelManagerScreen: React.FC<ModelManagerScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={18} color="#38BDF8" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.appTag}>ON-DEVICE AI ASSET MANAGER</Text>
          <View style={{ width: 40 }} />
        </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
