/**
 * Model Downloads Hook
 * Manages state and progress for on-device GGUF / ONNX models
 */

import { useEffect, useState, useMemo } from 'react';
import { ModelAsset } from '../types';
import { ModelAssetManager } from '../core/models/ModelAssetManager';

const globalAssetManager = new ModelAssetManager();

export function useModelDownloads() {
  const [models, setModels] = useState<ModelAsset[]>(globalAssetManager.getModels());

  useEffect(() => {
    const unsub = globalAssetManager.subscribeProgress((updated) => {
      setModels([...updated]);
    });
    return unsub;
  }, []);

  const totalBytes = useMemo(() => globalAssetManager.getTotalRequiredBytes(), []);
  const downloadedBytes = useMemo(() => globalAssetManager.getTotalDownloadedBytes(), [models]);
  const progressPercent = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
  const isReady = useMemo(() => globalAssetManager.areAllModelsReady(), [models]);

  return {
    models,
    totalBytes,
    downloadedBytes,
    progressPercent,
    isReady,
    startDownload: (id: string) => globalAssetManager.startDownload(id),
    downloadAll: () => globalAssetManager.downloadAll(),
    clearStorage: () => globalAssetManager.clearStorage(),
  };
}
