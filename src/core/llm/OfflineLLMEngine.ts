/**
 * Offline LLM Engine running MiniCPM5-2B GGUF via llama.rn
 * Implements token-level streaming with human clause segmentation for low TTFT (<500ms)
 */

let NativeModules: any = {};
try {
  const rn = require('react-native');
  NativeModules = rn.NativeModules || {};
} catch {
  // Node / Bun test runner
}

import { HardwareAccelerationManager, HardwareAccelerationMode } from '../hardware/HardwareAccelerationManager';

export class OfflineLLMEngine {
  private llamaContext: any = null;
  private isLoaded = false;
  private abortSignal = false;
  private accelerationMode: HardwareAccelerationMode = 'simulated';

  getAccelerationMode(): HardwareAccelerationMode {
    return this.accelerationMode;
  }

  getLlamaContext(): any {
    return this.llamaContext;
  }

  async loadModel(modelNameOrPath: string = 'MiniCPM5-2B-Q4_K_M.gguf'): Promise<boolean> {
    if (this.isLoaded) return true;

    const docPath = NativeModules?.OPSQLite?.getConstants?.()?.IOS_DOCUMENT_PATH || '';
    const resolvedPath = docPath && !modelNameOrPath.startsWith('/')
      ? `${docPath}/${modelNameOrPath}`
      : modelNameOrPath;

    try {
      // @ts-ignore
      const llamaModule = await import('llama.rn').catch(() => null);
      if (llamaModule && llamaModule.initLlama) {
        const hwManager = HardwareAccelerationManager.getInstance();
        await hwManager.probeHardwareCapabilities();

        // 1. Attempt GPU Acceleration first (Metal on iOS, OpenCL/Vulkan on Android)
        const gpuConfig = hwManager.getOptimalLlmConfig(true);
        try {
          console.log('[OfflineLLMEngine] Attempting GPU-accelerated initialization (n_gpu_layers=99)...');
          this.llamaContext = await llamaModule.initLlama({
            model: resolvedPath,
            ...gpuConfig,
          });

          const isGpu = !!this.llamaContext.gpu;
          const devices = this.llamaContext.devices || [];
          const reasonNoGPU = this.llamaContext.reasonNoGPU || '';

          if (isGpu) {
            console.log('[OfflineLLMEngine] Successfully initialized with GPU acceleration! Devices:', devices);
            hwManager.updateLlmStatus('gpu', {
              gpuLayers: 99,
              deviceName: devices.join(', ') || 'Native GPU',
            });
            this.accelerationMode = 'gpu';
          } else {
            console.log(`[OfflineLLMEngine] Device initialized in CPU mode (reason: ${reasonNoGPU || 'No GPU backend'})`);
            hwManager.updateLlmStatus('cpu', {
              gpuLayers: 0,
              fallbackReason: reasonNoGPU || 'Device hardware has no GPU backend',
            });
            this.accelerationMode = 'cpu';
          }

          this.isLoaded = true;
          return true;
        } catch (gpuErr: any) {
          console.warn('[OfflineLLMEngine] GPU init failed or unsupported; initiating CPU fallback:', gpuErr?.message || gpuErr);

          // 2. Safe CPU-Only Multi-Threaded Fallback
          const cpuConfig = hwManager.getOptimalLlmConfig(false);
          this.llamaContext = await llamaModule.initLlama({
            model: resolvedPath,
            ...cpuConfig,
          });

          console.log('[OfflineLLMEngine] Initialized successfully in CPU fallback mode');
          hwManager.updateLlmStatus('cpu', {
            gpuLayers: 0,
            fallbackReason: gpuErr?.message || 'GPU allocation failed, routed to CPU',
          });
          this.accelerationMode = 'cpu';
          this.isLoaded = true;
          return true;
        }
      }
    } catch (err) {
      console.warn('[OfflineLLMEngine] react-native-llama native initialization failed; falling back to simulated engine:', err);
    }

    HardwareAccelerationManager.getInstance().updateLlmStatus('simulated');
    this.accelerationMode = 'simulated';
    this.isLoaded = true;
    return true;
  }

  async streamInterviewResponse(
    conversation: Array<{ role: string; content: string }>,
    onTokenCallback: (token: string) => void,
    onClauseComplete: (clause: string) => void
  ): Promise<string> {
    if (!this.isLoaded) throw new Error('LLM Engine not loaded');
    this.abortSignal = false;

    let fullResponse = '';
    let currentClauseBuffer = '';
    const clauseDelimiters = ['.', '?', '!', ';', '\n'];

    if (this.llamaContext) {
      await this.llamaContext.completion(
        {
          messages: conversation,
          n_predict: 256,
          temperature: 0.7,
          top_p: 0.9,
          stop: ['<|im_end|>', '<|endoftext|>', 'Candidate:']
        },
        (data: { token: string }) => {
          if (this.abortSignal) return;

          const token = data.token;
          fullResponse += token;
          currentClauseBuffer += token;
          onTokenCallback(token);

          for (const delimiter of clauseDelimiters) {
            if (currentClauseBuffer.includes(delimiter)) {
              const parts = currentClauseBuffer.split(delimiter);
              const readyClause = parts[0] + delimiter;
              currentClauseBuffer = parts.slice(1).join(delimiter);
              onClauseComplete(readyClause.trim());
              break;
            }
          }
        }
      );

      if (currentClauseBuffer.trim().length > 0 && !this.abortSignal) {
        onClauseComplete(currentClauseBuffer.trim());
      }

      return fullResponse;
    }

    // High-fidelity simulated responses for offline testing
    const simulatedAnswers = [
      "That is an interesting trade-off regarding Redis caching. Could you explain how you prevented cache stampedes and dog-piling when keys expired during peak sales traffic?",
      "Understood. When deploying microservices at scale, how did you manage distributed transactions and eventual consistency across those services?",
      "Good point. In React Native, how did you profile frame drops and optimize the JS-native bridge to maintain 60 FPS during heavy list renders?",
      "Thanks for clarifying that. What specific metrics did you track to verify the latency improvement after introducing Kafka into that architecture?"
    ];

    const chosenResponse = simulatedAnswers[Math.floor(Math.random() * simulatedAnswers.length)];
    const words = chosenResponse.split(' ');

    for (let i = 0; i < words.length; i++) {
      if (this.abortSignal) break;

      const word = words[i] + ' ';
      fullResponse += word;
      currentClauseBuffer += word;
      onTokenCallback(word);

      // Simulate token generation latency (~25ms per token)
      await new Promise(r => setTimeout(r, 25));

      for (const delimiter of clauseDelimiters) {
        if (currentClauseBuffer.includes(delimiter)) {
          const parts = currentClauseBuffer.split(delimiter);
          const readyClause = parts[0] + delimiter;
          currentClauseBuffer = parts.slice(1).join(delimiter);
          onClauseComplete(readyClause.trim());
          break;
        }
      }
    }

    if (currentClauseBuffer.trim().length > 0 && !this.abortSignal) {
      onClauseComplete(currentClauseBuffer.trim());
    }

    return fullResponse;
  }

  stopGeneration(): void {
    this.abortSignal = true;
    if (this.llamaContext && this.llamaContext.stopCompletion) {
      this.llamaContext.stopCompletion();
    }
  }

  async release(): Promise<void> {
    if (this.llamaContext) {
      await this.llamaContext.release();
      this.llamaContext = null;
    }
    this.isLoaded = false;
  }
}
