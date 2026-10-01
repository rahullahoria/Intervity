/**
 * Hardware Acceleration Manager
 * Detects device GPU/NPU/CPU capabilities and provides optimized hardware offload profiles.
 * Implements a zero-crash progressive fallback architecture:
 * If a device lacks GPU or encounters driver errors, workloads gracefully route to CPU multi-threading.
 */

let NativeModules: any = {};
let Platform: any = { OS: 'ios' };
try {
  const rn = require('react-native');
  NativeModules = rn.NativeModules || {};
  Platform = rn.Platform || { OS: 'ios' };
} catch {
  // Test / Node runner
}

export type HardwareAccelerationMode = 'gpu' | 'cpu' | 'simulated';

export interface DeviceBackendInfo {
  backend: string;
  type: string;
  deviceName: string;
  maxMemorySize: number;
  metadata?: Record<string, any>;
}

export interface HardwareTelemetry {
  platform: 'ios' | 'android' | 'other';
  gpuAvailable: boolean;
  npuAvailable: boolean;
  activeLlmMode: HardwareAccelerationMode;
  activeSttMode: HardwareAccelerationMode;
  uiHardwareAccelerated: boolean;
  detectedDevices: DeviceBackendInfo[];
  llmGpuLayers: number;
  llmDeviceName?: string;
  llmFallbackReason?: string;
  sttDeviceName?: string;
  sttFallbackReason?: string;
}

export class HardwareAccelerationManager {
  private static instance: HardwareAccelerationManager | null = null;

  private telemetry: HardwareTelemetry = {
    platform: Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'other',
    gpuAvailable: false,
    npuAvailable: false,
    activeLlmMode: 'simulated',
    activeSttMode: 'simulated',
    uiHardwareAccelerated: true,
    detectedDevices: [],
    llmGpuLayers: 0,
    llmDeviceName: undefined,
    llmFallbackReason: undefined,
    sttDeviceName: undefined,
    sttFallbackReason: undefined,
  };

  private constructor() {}

  static getInstance(): HardwareAccelerationManager {
    if (!this.instance) {
      this.instance = new HardwareAccelerationManager();
    }
    return this.instance;
  }

  /**
   * Probes native subsystem to discover available hardware backends (Metal, OpenCL, Vulkan, Hexagon)
   */
  async probeHardwareCapabilities(): Promise<HardwareTelemetry> {
    try {
      // @ts-ignore
      const llamaModule = await import('llama.rn').catch(() => null);
      if (llamaModule && typeof llamaModule.getBackendDevicesInfo === 'function') {
        const devices: DeviceBackendInfo[] = await llamaModule.getBackendDevicesInfo().catch(() => []);
        this.telemetry.detectedDevices = devices;

        // Check if any GPU or iGPU device exists
        const hasGpu = devices.some(
          d => d.type?.toLowerCase().includes('gpu') ||
               d.backend?.toLowerCase().includes('metal') ||
               d.backend?.toLowerCase().includes('opencl') ||
               d.backend?.toLowerCase().includes('vulkan')
        );

        // Check if any NPU / HTP / Hexagon device exists
        const hasNpu = devices.some(
          d => d.type?.toLowerCase().includes('npu') ||
               d.type?.toLowerCase().includes('dsp') ||
               d.backend?.toLowerCase().includes('hexagon') ||
               d.backend?.toLowerCase().includes('htp')
        );

        this.telemetry.gpuAvailable = hasGpu || (Platform.OS === 'ios');
        this.telemetry.npuAvailable = hasNpu;
      } else {
        // iOS devices always feature Metal GPU; Android default check
        this.telemetry.gpuAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
      }
    } catch {
      this.telemetry.gpuAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
    }

    return { ...this.telemetry };
  }

  /**
   * Generates optimal LLM configuration prioritizing GPU acceleration
   */
  getOptimalLlmConfig(attemptGpu: boolean = true) {
    if (attemptGpu) {
      return {
        n_gpu_layers: 99, // Offload all model layers to GPU/VRAM
        flash_attn_type: 'auto' as const, // Flash attention for lower VRAM & higher throughput
        n_ctx: 2048,
        n_batch: 512,
        n_ubatch: 512,
        n_threads: 4,
        use_mlock: false,
      };
    }

    // High-performance multi-threaded CPU fallback
    return {
      n_gpu_layers: 0,
      flash_attn_type: 'off' as const,
      n_ctx: 2048,
      n_batch: 512,
      n_ubatch: 512,
      n_threads: 4, // Saturates performance cores without thermal throttling
      use_mlock: false,
    };
  }

  /**
   * Generates optimal STT (Whisper) configuration prioritizing GPU acceleration
   */
  getOptimalSttConfig(attemptGpu: boolean = true) {
    if (attemptGpu) {
      return {
        useGpu: true,
        useCoreMLIos: Platform.OS === 'ios',
        useFlashAttn: true,
        maxThreads: 2, // Offloaded matrix ops leave CPU threads free
      };
    }

    // High-performance CPU fallback using ARM NEON / AVX SIMD
    return {
      useGpu: false,
      useCoreMLIos: false,
      useFlashAttn: false,
      maxThreads: 4,
    };
  }

  updateLlmStatus(
    mode: HardwareAccelerationMode,
    options?: {
      gpuLayers?: number;
      deviceName?: string;
      fallbackReason?: string;
    }
  ): void {
    this.telemetry.activeLlmMode = mode;
    if (options?.gpuLayers !== undefined) this.telemetry.llmGpuLayers = options.gpuLayers;
    if (options?.deviceName !== undefined) this.telemetry.llmDeviceName = options.deviceName;
    if (options?.fallbackReason !== undefined) this.telemetry.llmFallbackReason = options.fallbackReason;
    if (mode === 'gpu') this.telemetry.gpuAvailable = true;
  }

  updateSttStatus(
    mode: HardwareAccelerationMode,
    options?: {
      deviceName?: string;
      fallbackReason?: string;
    }
  ): void {
    this.telemetry.activeSttMode = mode;
    if (options?.deviceName !== undefined) this.telemetry.sttDeviceName = options.deviceName;
    if (options?.fallbackReason !== undefined) this.telemetry.sttFallbackReason = options.fallbackReason;
    if (mode === 'gpu') this.telemetry.gpuAvailable = true;
  }

  getTelemetry(): HardwareTelemetry {
    return { ...this.telemetry };
  }
}
