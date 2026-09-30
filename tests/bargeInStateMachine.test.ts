import test from 'node:test';
import assert from 'node:assert';
import { NativeAudioEngine } from '../src/core/audio/NativeAudioEngine';
import { OfflineLLMEngine } from '../src/core/llm/OfflineLLMEngine';

test('Barge-In Interruption Abort and Zero-Latency Flush', async () => {
  const audioEngine = new NativeAudioEngine();
  const llmEngine = new OfflineLLMEngine();

  await audioEngine.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 });
  await llmEngine.loadModel('mock_minicpm.gguf');

  let vadTriggered = false;
  const unsubVAD = audioEngine.onVADEvent((evt) => {
    if (evt.isSpeech && evt.volume > 0.4) {
      vadTriggered = true;
    }
  });

  // Candidate interrupts while AI is generating
  audioEngine.simulateMicInput(0.85, true);
  assert.strictEqual(vadTriggered, true);

  // Test zero-latency audio flush
  audioEngine.stopPlaybackAndClearBuffers();

  // Test atomic LLM cancellation token
  let tokensGenerated = 0;
  const streamingPromise = llmEngine.streamInterviewResponse(
    [{ role: 'user', content: 'Tell me about distributed caching.' }],
    (_token) => {
      tokensGenerated++;
      if (tokensGenerated === 2) {
        // Trigger atomic barge-in stop
        llmEngine.stopGeneration();
      }
    },
    (_clause) => {}
  );

  const finalResponse = await streamingPromise;
  assert.ok(typeof finalResponse === 'string');
  assert.ok(tokensGenerated <= 4, `Expected LLM stream to abort promptly, generated ${tokensGenerated} tokens`);

  audioEngine.terminate();
  unsubVAD();
});
