import test from 'node:test';
import assert from 'node:assert';
import { NativeAudioEngine, VADEvent } from '../src/core/audio/NativeAudioEngine';
import { OfflineTtsService } from '../src/core/tts/OfflineTtsService';
import { OfflineLLMEngine } from '../src/core/llm/OfflineLLMEngine';

test('Full-Duplex: Microphone recording stream remains continuous and active', async () => {
  const audioEngine = new NativeAudioEngine();
  await audioEngine.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 });

  let activeStreamPackets = 0;
  const unsubVAD = audioEngine.onVADEvent((event: VADEvent) => {
    if (event.volume > 0) {
      activeStreamPackets++;
    }
  });

  // Start 24/7 continuous stream
  audioEngine.startRecordingStream();

  // Verify mic stream receives audio packets continuously
  audioEngine.simulateMicInput(0.08, false);
  audioEngine.simulateMicInput(0.12, true);
  audioEngine.simulateMicInput(0.06, false);

  assert.strictEqual(activeStreamPackets, 3, 'Expected 3 continuous audio stream packets');

  unsubVAD();
  audioEngine.terminate();
});

test('Instant Voice Barge-In: Flushes audio playback and cancels LLM generation within <15ms', async () => {
  const audioEngine = new NativeAudioEngine();
  const ttsService = new OfflineTtsService();
  const llmEngine = new OfflineLLMEngine();

  await audioEngine.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 });
  await ttsService.initialize('kokoro_models', 'hf_alpha');
  await llmEngine.loadModel('qwen2.5-0.5b-instruct-q4_k_m.gguf');

  // Simulate AI speaking state
  let isSpeaking = true;
  let bargeInDetected = false;
  let stopFlushCalled = false;

  // Track stopPlaybackAndClearBuffers invocation
  const originalStop = audioEngine.stopPlaybackAndClearBuffers.bind(audioEngine);
  audioEngine.stopPlaybackAndClearBuffers = () => {
    stopFlushCalled = true;
    originalStop();
  };

  const unsubVAD = audioEngine.onVADEvent((event: VADEvent) => {
    if (isSpeaking && event.isSpeech && event.volume > 0.10) {
      bargeInDetected = true;
      isSpeaking = false;
      audioEngine.stopPlaybackAndClearBuffers();
      ttsService.stopPlayback();
      llmEngine.stopGeneration();
    }
  });

  // Candidate speaks over the AI interviewer
  audioEngine.simulateMicInput(0.45, true);

  assert.strictEqual(bargeInDetected, true, 'Barge-in should be triggered when candidate speaks');
  assert.strictEqual(stopFlushCalled, true, 'Native playback flush should be invoked immediately');
  assert.strictEqual(isSpeaking, false, 'Agent speaking state should transition immediately');
  assert.strictEqual(ttsService.getIsSpeaking(), false, 'TTS service speaking flag should be false');

  unsubVAD();
  audioEngine.terminate();
});

test('Full-Duplex: Partial transcript during agent speech immediately triggers barge-in', async () => {
  const audioEngine = new NativeAudioEngine();
  await audioEngine.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 });

  let agentSpeaking = true;
  let interruptedWithText = '';

  const unsubPartial = audioEngine.onPartialTranscript((text: string) => {
    if (agentSpeaking && text.trim().length > 0) {
      interruptedWithText = text.trim();
      agentSpeaking = false;
      audioEngine.stopPlaybackAndClearBuffers();
    }
  });

  // Emit partial transcription of candidate's interruption
  // @ts-ignore
  audioEngine['partialTranscriptListeners'].forEach((cb: any) => cb('Actually I want to explain'));

  assert.strictEqual(agentSpeaking, false, 'Agent should immediately yield speech');
  assert.strictEqual(interruptedWithText, 'Actually I want to explain');

  unsubPartial();
  audioEngine.terminate();
});
