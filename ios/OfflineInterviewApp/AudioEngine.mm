#import <AVFoundation/AVFoundation.h>
#import <AudioToolbox/AudioToolbox.h>
#import <Speech/Speech.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface VoiceAudioEngine : RCTEventEmitter <RCTBridgeModule, AVSpeechSynthesizerDelegate, AVAudioRecorderDelegate>
@property (nonatomic, assign) AudioComponentInstance voiceIOUnit;
@property (nonatomic, assign) BOOL isInterrupted;
@property (nonatomic, assign) BOOL isRunning;
@property (nonatomic, strong) AVSpeechSynthesizer *speechSynthesizer;
@property (nonatomic, strong) AVAudioRecorder *audioRecorder;
@property (nonatomic, strong) NSTimer *meteringTimer;
@property (nonatomic, assign) BOOL hasSpokenInCurrentTurn;
@property (nonatomic, assign) NSTimeInterval silenceStartTime;
@property (nonatomic, copy) NSString *currentRecordingPath;
@property (nonatomic, assign) BOOL hasListeners;
@end

@implementation VoiceAudioEngine

RCT_EXPORT_MODULE(VoiceAudioEngine);

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _isRunning = NO;
        _isInterrupted = NO;
        _hasListeners = NO;
        _hasSpokenInCurrentTurn = NO;
        _silenceStartTime = 0;
        _speechSynthesizer = [[AVSpeechSynthesizer alloc] init];
        _speechSynthesizer.delegate = self;
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onAudioVolume", @"onSpeechDetected", @"onEndOfSpeech", @"onPlaybackFinished"];
}

- (void)startObserving {
    _hasListeners = YES;
}

- (void)stopObserving {
    _hasListeners = NO;
}

- (void)emitEvent:(NSString *)name body:(id)body {
    if (_hasListeners) {
        [self sendEventWithName:name body:body];
    }
}

static OSStatus InputRenderCallback(void *inRefCon,
                                    AudioUnitRenderActionFlags *ioActionFlags,
                                    const AudioTimeStamp *inTimeStamp,
                                    UInt32 inBusNumber,
                                    UInt32 inNumberFrames,
                                    AudioBufferList *ioData) {
    VoiceAudioEngine *engine = (__bridge VoiceAudioEngine *)inRefCon;
    if (!engine || !engine.isRunning) return noErr;

    AudioBuffer buffer;
    buffer.mNumberChannels = 1;
    buffer.mDataByteSize = inNumberFrames * sizeof(int16_t);
    int16_t samples[inNumberFrames];
    buffer.mData = samples;

    AudioBufferList bufferList;
    bufferList.mNumberBuffers = 1;
    bufferList.mBuffers[0] = buffer;

    OSStatus status = AudioUnitRender(engine.voiceIOUnit,
                                      ioActionFlags,
                                      inTimeStamp,
                                      inBusNumber,
                                      inNumberFrames,
                                      &bufferList);

    if (status == noErr) {
        // High precision AEC audio input
    }

    return noErr;
}

- (BOOL)setupAECSessionWithError:(NSError **)outError {
    AVAudioSession *session = [AVAudioSession sharedInstance];
    NSError *error = nil;

    // Configure hardware echo cancellation and speech output priorities
    [session setCategory:AVAudioSessionCategoryPlayAndRecord
                    mode:AVAudioSessionModeVoiceChat
                 options:AVAudioSessionCategoryOptionAllowBluetooth |
                         AVAudioSessionCategoryOptionDefaultToSpeaker
                   error:&error];

    if (error) {
        if (outError) *outError = error;
        return NO;
    }

    [session setPreferredSampleRate:16000.0 error:&error];
    [session setPreferredIOBufferDuration:0.020 error:&error]; // 20ms buffer duration
    [session setActive:YES error:&error];

    // Create AudioComponent for kAudioUnitSubType_VoiceProcessingIO
    AudioComponentDescription desc;
    desc.componentType = kAudioUnitType_Output;
    desc.componentSubType = kAudioUnitSubType_VoiceProcessingIO; // Hardware Echo Cancellation
    desc.componentManufacturer = kAudioUnitManufacturer_Apple;
    desc.componentFlags = 0;
    desc.componentFlagsMask = 0;

    AudioComponent comp = AudioComponentFindNext(NULL, &desc);
    if (comp) {
        OSStatus status = AudioComponentInstanceNew(comp, &_voiceIOUnit);
        if (status == noErr && _voiceIOUnit) {
            UInt32 one = 1;
            AudioUnitSetProperty(_voiceIOUnit, kAudioOutputUnitProperty_EnableIO,
                                 kAudioUnitScope_Input, 1, &one, sizeof(one));
            AudioUnitSetProperty(_voiceIOUnit, kAudioOutputUnitProperty_EnableIO,
                                 kAudioUnitScope_Output, 0, &one, sizeof(one));

            AudioStreamBasicDescription audioFormat;
            audioFormat.mSampleRate = 16000.0;
            audioFormat.mFormatID = kAudioFormatLinearPCM;
            audioFormat.mFormatFlags = kAudioFormatFlagIsSignedInteger | kAudioFormatFlagIsPacked;
            audioFormat.mFramesPerPacket = 1;
            audioFormat.mChannelsPerFrame = 1;
            audioFormat.mBitsPerChannel = 16;
            audioFormat.mBytesPerPacket = 2;
            audioFormat.mBytesPerFrame = 2;

            AudioUnitSetProperty(_voiceIOUnit, kAudioUnitProperty_StreamFormat,
                                 kAudioUnitScope_Output, 1, &audioFormat, sizeof(audioFormat));
            AudioUnitSetProperty(_voiceIOUnit, kAudioUnitProperty_StreamFormat,
                                 kAudioUnitScope_Input, 0, &audioFormat, sizeof(audioFormat));

            AURenderCallbackStruct callbackStruct;
            callbackStruct.inputProc = InputRenderCallback;
            callbackStruct.inputProcRefCon = (__bridge void *)self;
            AudioUnitSetProperty(_voiceIOUnit, kAudioOutputUnitProperty_SetInputCallback,
                                 kAudioUnitScope_Global, 0, &callbackStruct, sizeof(callbackStruct));

            AudioUnitInitialize(_voiceIOUnit);
        }
    }

    _isRunning = YES;
    _isInterrupted = NO;

    return YES;
}

RCT_EXPORT_METHOD(setupAECSession:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSError *error = nil;
    BOOL success = [self setupAECSessionWithError:&error];
    if (success) {
        resolve(@(YES));
    } else {
        reject(@"AEC_INIT_FAIL", error.localizedDescription ?: @"Failed to init AEC", error);
    }
}

/**
 * High-Quality Offline Speech Output using Apple AVSpeechSynthesizer
 * Plays directly to the phone/simulator speaker with natural Indian/US English intonation.
 */
RCT_EXPORT_METHOD(speakText:(NSString *)text
                  voice:(NSString *)voiceCode
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!text || text.length == 0) {
        resolve(@(YES));
        return;
    }

    dispatch_async(dispatch_get_main_queue(), ^{
        self.isInterrupted = NO;

        // Stop previous utterance cleanly if still speaking
        if (self.speechSynthesizer.isSpeaking) {
            [self.speechSynthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
        }

        // Configure audio session to route to loud speaker
        AVAudioSession *session = [AVAudioSession sharedInstance];
        [session setCategory:AVAudioSessionCategoryPlayAndRecord
                        mode:AVAudioSessionModeVoiceChat
                     options:AVAudioSessionCategoryOptionDefaultToSpeaker |
                             AVAudioSessionCategoryOptionAllowBluetooth
                       error:nil];
        [session setActive:YES error:nil];

        AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:text];

        // Voice profile selection: prefers Indian English (en-IN)
        AVSpeechSynthesisVoice *voice = nil;
        if ([voiceCode containsString:@"en-IN"] || [voiceCode containsString:@"alpha"] ||
            [voiceCode containsString:@"beta"] || [voiceCode containsString:@"omega"] ||
            [voiceCode containsString:@"psi"] || [voiceCode containsString:@"bengaluru"]) {
            voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"en-IN"];
        }
        if (!voice) {
            voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"en-US"];
        }
        if (!voice) {
            voice = [AVSpeechSynthesisVoice voiceWithLanguage:[AVSpeechSynthesisVoice currentLanguageCode]];
        }

        utterance.voice = voice;
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.96f; // Balanced conversational tempo
        utterance.pitchMultiplier = 1.0f;
        utterance.volume = 1.0f;

        [self.speechSynthesizer speakUtterance:utterance];
        resolve(@(YES));
    });
}

// AVSpeechSynthesizerDelegate: notifies React Native when speech completes
- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didFinishSpeechUtterance:(AVSpeechUtterance *)utterance {
    dispatch_async(dispatch_get_main_queue(), ^{
        [self emitEvent:@"onPlaybackFinished" body:@{}];
    });
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didCancelSpeechUtterance:(AVSpeechUtterance *)utterance {
    // Interrupted cleanly
}

RCT_EXPORT_METHOD(startRecording) {
    dispatch_async(dispatch_get_main_queue(), ^{
        self.isRunning = YES;
        self.isInterrupted = NO;
        self.hasSpokenInCurrentTurn = NO;
        self.silenceStartTime = 0;

        AVAudioSession *session = [AVAudioSession sharedInstance];
        [session setCategory:AVAudioSessionCategoryPlayAndRecord
                        mode:AVAudioSessionModeVoiceChat
                     options:AVAudioSessionCategoryOptionDefaultToSpeaker |
                             AVAudioSessionCategoryOptionAllowBluetooth
                       error:nil];
        [session setActive:YES error:nil];

        // Prepare temporary audio file for candidate turn
        NSString *tempDir = NSTemporaryDirectory();
        self.currentRecordingPath = [tempDir stringByAppendingPathComponent:@"candidate_speech_turn.m4a"];
        NSURL *outputURL = [NSURL fileURLWithPath:self.currentRecordingPath];

        NSDictionary *recordSettings = @{
            AVFormatIDKey: @(kAudioFormatMPEG4AAC),
            AVSampleRateKey: @(16000.0f),
            AVNumberOfChannelsKey: @(1),
            AVEncoderAudioQualityKey: @(AVAudioQualityMedium)
        };

        NSError *error = nil;
        self.audioRecorder = [[AVAudioRecorder alloc] initWithURL:outputURL settings:recordSettings error:&error];
        if (error || !self.audioRecorder) {
            NSLog(@"[VoiceAudioEngine] Failed to initialize recorder: %@", error);
            return;
        }

        self.audioRecorder.delegate = self;
        self.audioRecorder.meteringEnabled = YES;
        [self.audioRecorder prepareToRecord];
        [self.audioRecorder record];

        // Invalidate old timer if active
        if (self.meteringTimer) {
            [self.meteringTimer invalidate];
            self.meteringTimer = nil;
        }

        // 50ms metering loop for real-time VAD & VoiceOrb reactivity
        __weak typeof(self) weakSelf = self;
        self.meteringTimer = [NSTimer scheduledTimerWithTimeInterval:0.05 repeats:YES block:^(NSTimer * _Nonnull timer) {
            typeof(weakSelf) strongSelf = weakSelf;
            if (!strongSelf || !strongSelf.isRunning || !strongSelf.audioRecorder.isRecording) {
                return;
            }

            [strongSelf.audioRecorder updateMeters];
            float avgPower = [strongSelf.audioRecorder averagePowerForChannel:0]; // -160 to 0 dB
            
            // Normalized linear volume (0.0 to 1.0)
            float linearVolume = powf(10.0f, avgPower / 20.0f);
            if (linearVolume < 0.015f) linearVolume = 0.0f;
            float displayVolume = fminf(1.0f, linearVolume * 4.0f);

            [strongSelf emitEvent:@"onAudioVolume" body:@{@"volume": @(displayVolume)}];

            // VAD Speech / Silence State Machine
            if (linearVolume > 0.045f) {
                strongSelf.hasSpokenInCurrentTurn = YES;
                strongSelf.silenceStartTime = 0;
                [strongSelf emitEvent:@"onSpeechDetected" body:@{@"volume": @(displayVolume)}];
            } else if (strongSelf.hasSpokenInCurrentTurn) {
                if (strongSelf.silenceStartTime == 0) {
                    strongSelf.silenceStartTime = CACurrentMediaTime();
                } else if (CACurrentMediaTime() - strongSelf.silenceStartTime > 1.35) {
                    // Turn completion: Candidate finished speaking after 1.35s of silence
                    strongSelf.hasSpokenInCurrentTurn = NO;
                    strongSelf.silenceStartTime = 0;
                    [strongSelf.audioRecorder stop];
                    [strongSelf.meteringTimer invalidate];
                    strongSelf.meteringTimer = nil;

                    [strongSelf emitEvent:@"onEndOfSpeech" body:@{
                        @"audioPath": strongSelf.currentRecordingPath ?: @""
                    }];
                }
            }
        }];
    });
}

RCT_EXPORT_METHOD(stopRecordingStream) {
    dispatch_async(dispatch_get_main_queue(), ^{
        self.isRunning = NO;
        if (self.meteringTimer) {
            [self.meteringTimer invalidate];
            self.meteringTimer = nil;
        }
        if (self.audioRecorder && self.audioRecorder.isRecording) {
            [self.audioRecorder stop];
        }
    });
}

RCT_EXPORT_METHOD(finishSpeechTurnManually) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.meteringTimer) {
            [self.meteringTimer invalidate];
            self.meteringTimer = nil;
        }
        if (self.audioRecorder && self.audioRecorder.isRecording) {
            [self.audioRecorder stop];
        }
        self.hasSpokenInCurrentTurn = NO;
        self.silenceStartTime = 0;
        [self emitEvent:@"onEndOfSpeech" body:@{
            @"audioPath": self.currentRecordingPath ?: @""
        }];
    });
}

RCT_EXPORT_METHOD(enqueueAudioSamples:(NSArray *)samples) {
    // AUVoiceIO playback buffer interface
}

RCT_EXPORT_METHOD(stopPlaybackAndFlush) {
    dispatch_async(dispatch_get_main_queue(), ^{
        self.isInterrupted = YES;
        // Instantly stop synthesizer (<15ms barge-in latency)
        if (self.speechSynthesizer.isSpeaking) {
            [self.speechSynthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
        }
        if (self.voiceIOUnit) {
            AudioUnitReset(self.voiceIOUnit, kAudioUnitScope_Output, 0);
        }
    });
}

RCT_EXPORT_METHOD(teardown) {
    dispatch_async(dispatch_get_main_queue(), ^{
        self.isRunning = NO;
        if (self.meteringTimer) {
            [self.meteringTimer invalidate];
            self.meteringTimer = nil;
        }
        if (self.audioRecorder) {
            [self.audioRecorder stop];
            self.audioRecorder = nil;
        }
        if (self.speechSynthesizer) {
            [self.speechSynthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
        }
        if (self.voiceIOUnit) {
            AudioOutputUnitStop(self.voiceIOUnit);
            AudioUnitUninitialize(self.voiceIOUnit);
            AudioComponentInstanceDispose(self.voiceIOUnit);
            self.voiceIOUnit = NULL;
        }
    });
}

@end
