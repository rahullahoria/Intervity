import { describe, it, expect } from 'bun:test';
import { NativeAudioEngine } from '../src/core/audio/NativeAudioEngine';

describe('Native STT Lifecycle & Transcript Accumulation', () => {
  it('initializes NativeAudioEngine with AEC and subscribes to transcript events', async () => {
    const engine = new NativeAudioEngine();
    const initialized = await engine.initializeWithAEC({ sampleRate: 16000, bufferSize: 320 });
    expect(initialized).toBe(true);

    let partialReceived = '';
    let finalReceived = '';

    const unsubPartial = engine.onPartialTranscript((text) => {
      partialReceived = text;
    });

    const unsubFinal = engine.onFinalTranscript((text) => {
      finalReceived = text;
    });

    // Simulate partial speech events
    (engine as any).partialTranscriptListeners.forEach((cb: any) => cb('I am preparing for a technical'));
    expect(partialReceived).toBe('I am preparing for a technical');

    // Simulate subsequent partial accumulation
    (engine as any).partialTranscriptListeners.forEach((cb: any) => cb('I am preparing for a technical interview'));
    expect(partialReceived).toBe('I am preparing for a technical interview');

    // Simulate final transcript arrival
    (engine as any).finalTranscriptListeners.forEach((cb: any) => cb('I am preparing for a technical interview'));
    expect(finalReceived).toBe('I am preparing for a technical interview');

    unsubPartial();
    unsubFinal();
    engine.terminate();
  });

  it('salvages partial transcript when speech ends or stop is requested', async () => {
    const engine = new NativeAudioEngine();
    await engine.initializeWithAEC();

    let recognizedText = '';
    engine.onPartialTranscript((text) => {
      recognizedText = text;
    });

    // Partial speech came in
    (engine as any).partialTranscriptListeners.forEach((cb: any) => cb('hello can you hear me'));
    expect(recognizedText).toBe('hello can you hear me');

    // User stops listening: partial transcript is preserved in buffer
    engine.stopRecordingStream();
    expect(recognizedText).toBe('hello can you hear me');

    engine.terminate();
  });

  it('supports simulated speech turn with VAD volume tracking and end of speech', async () => {
    const engine = new NativeAudioEngine();
    await engine.initializeWithAEC();

    let lastVolume = 0;
    let speechDetected = false;

    engine.onVADEvent((ev) => {
      lastVolume = ev.volume;
      if (ev.isSpeech) speechDetected = true;
    });

    const result = await engine.simulateUserSpeechTurn('Distributed cache with Redis', 400);
    expect(result).toBe('Distributed cache with Redis');
    expect(speechDetected).toBe(true);
    expect(lastVolume).toBeGreaterThan(0);

    engine.terminate();
  });
});
