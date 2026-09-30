package com.offlineinterview.audio

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.util.Log

class VoiceAudioEngineModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val engine = AndroidVoiceAudioEngine(reactContext)

    override fun getName(): String = "AndroidVoiceAudioEngine"

    companion object {
        private const val TAG = "VoiceAudioEngineMod"
    }

    init {
        engine.onPlaybackFinishedCallback = {
            sendEvent("onPlaybackFinished", null)
        }
        engine.onAudioVolumeCallback = { volume ->
            val map = Arguments.createMap().apply {
                putDouble("volume", volume.toDouble())
            }
            sendEvent("onAudioVolume", map)
        }
        engine.onSpeechDetectedCallback = {
            sendEvent("onSpeechDetected", null)
        }
        engine.onPartialTranscriptCallback = { text ->
            val map = Arguments.createMap().apply {
                putString("text", text)
            }
            sendEvent("onPartialTranscript", map)
        }
        engine.onFinalTranscriptCallback = { text ->
            val map = Arguments.createMap().apply {
                putString("text", text)
            }
            sendEvent("onFinalTranscript", map)
        }
        engine.onEndOfSpeechCallback = {
            sendEvent("onEndOfSpeech", null)
        }
    }

    private fun sendEvent(eventName: String, params: Any?) {
        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            Log.w(TAG, "sendEvent error: ${e.message}")
        }
    }

    @ReactMethod
    fun initializeAEC(sampleRate: Int, bufferSizeFrames: Int, promise: Promise) {
        try {
            val success = engine.initializeAEC(sampleRate, bufferSizeFrames)
            promise.resolve(success)
        } catch (e: Exception) {
            Log.e(TAG, "initializeAEC error: ${e.message}", e)
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun initKokoro(modelDir: String, promise: Promise) {
        try {
            val success = engine.initKokoro(modelDir)
            promise.resolve(success)
        } catch (e: Exception) {
            Log.e(TAG, "initKokoro error: ${e.message}", e)
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun speakText(text: String, voiceName: String, promise: Promise) {
        try {
            engine.speakText(text, voiceName)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "speakText error: ${e.message}", e)
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun stopPlaybackAndFlush() {
        try {
            engine.stopPlaybackAndFlush()
        } catch (e: Exception) {
            Log.e(TAG, "stopPlaybackAndFlush error: ${e.message}", e)
        }
    }

    @ReactMethod
    fun startRecording() {
        try {
            engine.startListeningForSpeech()
        } catch (e: Exception) {
            Log.e(TAG, "startRecording error: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stopRecording() {
        try {
            engine.stopListeningForSpeech()
        } catch (e: Exception) {
            Log.e(TAG, "stopRecording error: ${e.message}", e)
        }
    }

    @ReactMethod
    fun enqueueAudioSamples(samples: ReadableArray) {
        try {
            val byteArray = ByteArray(samples.size())
            for (i in 0 until samples.size()) {
                byteArray[i] = samples.getInt(i).toByte()
            }
            engine.enqueueAudioSamples(byteArray)
        } catch (e: Exception) {
            Log.e(TAG, "enqueueAudioSamples error: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stopPlaybackInstantly() {
        try {
            engine.stopPlaybackInstantly()
        } catch (e: Exception) {
            Log.e(TAG, "stopPlaybackInstantly error: ${e.message}", e)
        }
    }

    @ReactMethod
    fun setSpeakerphone(enable: Boolean, promise: Promise) {
        try {
            if (enable) {
                engine.routeToLoudspeaker()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "setSpeakerphone error: ${e.message}", e)
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun releaseEngine() {
        try {
            engine.release()
        } catch (e: Exception) {
            Log.e(TAG, "releaseEngine error: ${e.message}", e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }
}
