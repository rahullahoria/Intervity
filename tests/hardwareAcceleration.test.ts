import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  HardwareAccelerationManager,
} from '../src/core/hardware/HardwareAccelerationManager';
import { OfflineLLMEngine } from '../src/core/llm/OfflineLLMEngine';
import { OfflineSpeechToTextService } from '../src/core/stt/OfflineSpeechToTextService';

describe('Hardware Acceleration & Compute Engine Pipeline', () => {
  let hwManager: HardwareAccelerationManager;

  beforeEach(() => {
    hwManager = HardwareAccelerationManager.getInstance();
  });

  describe('HardwareAccelerationManager Capability Detection & Profiles', () => {
    it('initializes with default telemetry safely without crashing on non-GPU environments', () => {
      const telemetry = hwManager.getTelemetry();
      assert.ok(telemetry);
      assert.strictEqual(typeof telemetry.uiHardwareAccelerated, 'boolean');
      assert.strictEqual(telemetry.uiHardwareAccelerated, true);
      assert.ok(['ios', 'android', 'other'].includes(telemetry.platform));
    });

    it('generates high-performance GPU-first configuration for LLM inference', () => {
      const gpuConfig = hwManager.getOptimalLlmConfig(true);
      assert.strictEqual(gpuConfig.n_gpu_layers, 99);
      assert.strictEqual(gpuConfig.flash_attn_type, 'auto');
      assert.strictEqual(gpuConfig.n_ctx, 2048);
      assert.strictEqual(gpuConfig.n_batch, 512);
      assert.strictEqual(gpuConfig.n_threads, 4);
    });

    it('generates safe, multi-threaded CPU fallback configuration for LLM inference', () => {
      const cpuConfig = hwManager.getOptimalLlmConfig(false);
      assert.strictEqual(cpuConfig.n_gpu_layers, 0);
      assert.strictEqual(cpuConfig.flash_attn_type, 'off');
      assert.strictEqual(cpuConfig.n_threads, 4);
      assert.strictEqual(cpuConfig.n_batch, 512);
    });

    it('generates high-performance GPU-first configuration for Whisper STT', () => {
      const gpuConfig = hwManager.getOptimalSttConfig(true);
      assert.strictEqual(gpuConfig.useGpu, true);
      assert.strictEqual(gpuConfig.useFlashAttn, true);
      assert.strictEqual(gpuConfig.maxThreads, 2);
    });

    it('generates multi-core SIMD CPU fallback configuration for Whisper STT', () => {
      const cpuConfig = hwManager.getOptimalSttConfig(false);
      assert.strictEqual(cpuConfig.useGpu, false);
      assert.strictEqual(cpuConfig.useCoreMLIos, false);
      assert.strictEqual(cpuConfig.useFlashAttn, false);
      assert.strictEqual(cpuConfig.maxThreads, 4);
    });

    it('correctly updates and retains telemetry states for LLM and STT engines', () => {
      hwManager.updateLlmStatus('gpu', {
        gpuLayers: 99,
        deviceName: 'Adreno 642L OpenCL',
      });
      hwManager.updateSttStatus('gpu', {
        deviceName: 'Whisper GPU CoreML',
      });

      const updated = hwManager.getTelemetry();
      assert.strictEqual(updated.activeLlmMode, 'gpu');
      assert.strictEqual(updated.llmGpuLayers, 99);
      assert.strictEqual(updated.llmDeviceName, 'Adreno 642L OpenCL');
      assert.strictEqual(updated.activeSttMode, 'gpu');
      assert.strictEqual(updated.gpuAvailable, true);

      // Verify fallback telemetry update
      hwManager.updateLlmStatus('cpu', {
        fallbackReason: 'Device lacks OpenCL runtime driver',
      });
      const cpuTelemetry = hwManager.getTelemetry();
      assert.strictEqual(cpuTelemetry.activeLlmMode, 'cpu');
      assert.strictEqual(cpuTelemetry.llmFallbackReason, 'Device lacks OpenCL runtime driver');
    });
  });

  describe('OfflineLLMEngine Hardware Acceleration & Zero-Crash Fallback', () => {
    it('initializes and streams responses smoothly in simulated / CPU fallback mode when native module is absent', async () => {
      const engine = new OfflineLLMEngine();
      const loaded = await engine.loadModel('MiniCPM5-2B-Q4_K_M.gguf');
      assert.strictEqual(loaded, true);
      assert.ok(['gpu', 'cpu', 'simulated'].includes(engine.getAccelerationMode()));

      let streamedText = '';
      const clauses: string[] = [];
      const result = await engine.streamInterviewResponse(
        [{ role: 'user', content: 'Tell me about Redis caching.' }],
        (token) => { streamedText += token; },
        (clause) => { clauses.push(clause); }
      );

      assert.ok(result.length > 10);
      assert.strictEqual(streamedText, result);
      assert.ok(clauses.length > 0);
    });

    it('handles stopGeneration gracefully during inference without process crashing', async () => {
      const engine = new OfflineLLMEngine();
      await engine.loadModel();
      engine.stopGeneration();
      await engine.release();
      assert.strictEqual(engine.getLlamaContext(), null);
    });
  });

  describe('OfflineSpeechToTextService Hardware Acceleration & Zero-Crash Fallback', () => {
    it('initializes STT engine and operates robustly in fallback mode', async () => {
      const stt = new OfflineSpeechToTextService();
      const initialized = await stt.initializeModel('ggml-tiny.en.bin');
      assert.strictEqual(initialized, true);
      assert.ok(['gpu', 'cpu', 'simulated'].includes(stt.getAccelerationMode()));

      stt.setSimulatedTranscript('I scaled Kubernetes clusters to handle 50k requests per second.');
      const transcript = await stt.transcribeAudioChunk('/tmp/test_chunk.pcm');
      assert.ok(transcript.includes('Kubernetes'));

      await stt.release();
      assert.strictEqual(stt.getWhisperContext(), null);
    });
  });
});
