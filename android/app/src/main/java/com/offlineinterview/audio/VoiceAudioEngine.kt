package com.offlineinterview.audio

import android.annotation.SuppressLint
import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.media.audiofx.AcousticEchoCanceler
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import com.k2fsa.sherpa.onnx.OfflineTts
import com.k2fsa.sherpa.onnx.OfflineTtsConfig
import com.k2fsa.sherpa.onnx.OfflineTtsModelConfig
import com.k2fsa.sherpa.onnx.OfflineTtsKokoroModelConfig
import java.io.File
import java.util.Locale
import kotlin.math.sqrt

class AndroidVoiceAudioEngine(private val context: Context? = null) : TextToSpeech.OnInitListener {
    private var audioRecord: AudioRecord? = null
    private var audioTrack: AudioTrack? = null
    private var aec: AcousticEchoCanceler? = null
    @Volatile
    private var isRecording = false
    private var recordingThread: Thread? = null

    private var tts: TextToSpeech? = null
    @Volatile
    private var isTtsReady = false

    private var kokoroTts: OfflineTts? = null
    @Volatile
    private var isKokoroReady = false
    @Volatile
    private var isPlayingKokoro = false
    private var kokoroPlaybackThread: Thread? = null

    var onAudioBufferCallback: ((ByteArray, Float) -> Unit)? = null
    var onPlaybackFinishedCallback: (() -> Unit)? = null

    companion object {
        private const val TAG = "VoiceAudioEngine"
    }

    init {
        context?.let {
            try {
                tts = TextToSpeech(it.applicationContext, this)
            } catch (e: Exception) {
                Log.w(TAG, "TTS initialization error: ${e.message}")
            }
        }
        // Attempt early Kokoro model discovery
        try {
            initKokoro()
        } catch (e: Throwable) {
            Log.w(TAG, "Early Kokoro init warning: ${e.message}")
        }
    }

    fun initKokoro(customPath: String? = null): Boolean {
        if (isKokoroReady && kokoroTts != null) return true

        val searchDirs = mutableListOf<File>()
        customPath?.let {
            searchDirs.add(File(it))
            context?.let { ctx -> searchDirs.add(File(ctx.filesDir, it)) }
        }
        context?.let { ctx ->
            searchDirs.add(File(ctx.filesDir, "kokoro"))
            searchDirs.add(File(ctx.filesDir, "kokoro_models"))
            ctx.getExternalFilesDir(null)?.let { ext ->
                searchDirs.add(File(ext, "kokoro"))
                searchDirs.add(File(ext, "kokoro_models"))
            }
        }
        searchDirs.add(File("/storage/emulated/0/Android/data/com.goairm.intervity/files/kokoro"))
        searchDirs.add(File("/storage/emulated/0/Android/data/com.offlineinterview.app/files/kokoro"))
        searchDirs.add(File("/data/local/tmp/kokoro"))

        for (dir in searchDirs) {
            if (!dir.exists() || !dir.isDirectory) continue
            val modelFile = listOf("model.int8.onnx", "model.onnx")
                .map { File(dir, it) }
                .firstOrNull { it.exists() }
            val voicesFile = File(dir, "voices.bin")
            val tokensFile = File(dir, "tokens.txt")
            val dataDir = File(dir, "espeak-ng-data")

            if (modelFile != null && voicesFile.exists() && tokensFile.exists() && dataDir.exists()) {
                try {
                    Log.i(TAG, "Found Kokoro model assets at ${dir.absolutePath}. Initializing sherpa-onnx...")
                    val lexiconFile = File(dir, "lexicon-us-en.txt")
                    val dictDir = File(dir, "dict")

                    val kokoroConfig = OfflineTtsKokoroModelConfig().apply {
                        model = modelFile.absolutePath
                        voices = voicesFile.absolutePath
                        tokens = tokensFile.absolutePath
                        this.dataDir = dataDir.absolutePath
                        if (lexiconFile.exists()) {
                            lexicon = lexiconFile.absolutePath
                        }
                        if (dictDir.exists()) {
                            this.dictDir = dictDir.absolutePath
                        }
                        lengthScale = 1.0f
                    }

                    val modelConfig = OfflineTtsModelConfig().apply {
                        kokoro = kokoroConfig
                        numThreads = 4
                        debug = false
                        provider = "cpu"
                    }

                    val ttsConfig = OfflineTtsConfig().apply {
                        model = modelConfig
                    }

                    kokoroTts = OfflineTts(null, ttsConfig)
                    isKokoroReady = true
                    Log.i(TAG, "Kokoro-82M TTS initialized successfully with sherpa-onnx! Speakers: ${kokoroTts?.numSpeakers()}")
                    return true
                } catch (e: Throwable) {
                    Log.e(TAG, "Failed initializing Kokoro TTS from ${dir.absolutePath}: ${e.message}", e)
                }
            }
        }
        Log.d(TAG, "Kokoro model assets not ready yet in search paths.")
        return false
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isTtsReady = true
            try {
                val localeIn = Locale("en", "IN")
                val avail = tts?.isLanguageAvailable(localeIn) ?: TextToSpeech.LANG_NOT_SUPPORTED
                if (avail >= TextToSpeech.LANG_AVAILABLE) {
                    tts?.language = localeIn
                } else {
                    tts?.language = Locale.US
                }
                tts?.setSpeechRate(1.02f)
                tts?.setPitch(1.0f)

                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        Log.d(TAG, "TTS started speaking: $utteranceId")
                    }

                    override fun onDone(utteranceId: String?) {
                        Log.d(TAG, "TTS finished speaking: $utteranceId")
                        onPlaybackFinishedCallback?.invoke()
                    }

                    override fun onError(utteranceId: String?) {
                        Log.w(TAG, "TTS speech error: $utteranceId")
                        onPlaybackFinishedCallback?.invoke()
                    }
                })
            } catch (e: Exception) {
                Log.w(TAG, "TTS locale configuration error: ${e.message}")
            }
        } else {
            Log.w(TAG, "TextToSpeech init failed with status: $status")
        }
    }

    private fun getSpeakerIdForPersona(voiceName: String?): Int {
        // Kokoro speaker mappings:
        // 0: af, 1: af_bella, 2: af_nicole, 3: af_sarah, 4: af_sky
        // 5: am_adam, 6: am_michael, 7: bf_emma, 8: bf_isabella, 9: bm_george, 10: bm_lewis
        return when (voiceName) {
            "hf_alpha" -> 1 // af_bella
            "hf_beta" -> 3  // af_sarah
            "hm_omega" -> 5 // am_adam
            "hm_psi" -> 6   // am_michael
            "af_bella" -> 1
            else -> if (voiceName?.startsWith("hm_") == true) 5 else 1
        }
    }

    fun speakText(text: String, voiceName: String? = null) {
        if (isKokoroReady && kokoroTts != null) {
            speakKokoro(text, voiceName)
            return
        }
        if (initKokoro()) {
            speakKokoro(text, voiceName)
            return
        }

        // Fallback to system TTS if Kokoro is not loaded yet
        speakSystemTts(text, voiceName)
    }

    private fun speakKokoro(text: String, voiceName: String?) {
        val tts = kokoroTts ?: return
        kokoroPlaybackThread?.interrupt()
        kokoroPlaybackThread = Thread {
            try {
                isPlayingKokoro = true
                val sid = getSpeakerIdForPersona(voiceName)
                Log.i(TAG, "Synthesizing with Kokoro-82M on-device (sid=$sid, voice=$voiceName): \"$text\"")
                val startMs = System.currentTimeMillis()
                val audio = tts.generate(text, sid, 1.0f)
                val genMs = System.currentTimeMillis() - startMs
                Log.i(TAG, "Kokoro generated ${audio.samples.size} samples in ${genMs}ms (${audio.sampleRate}Hz)")

                val samples = audio.samples
                if (samples.isEmpty() || !isPlayingKokoro) {
                    onPlaybackFinishedCallback?.invoke()
                    return@Thread
                }

                // Convert float [-1.0, 1.0] samples to 16-bit mono PCM bytes
                val pcm16 = ByteArray(samples.size * 2)
                for (i in samples.indices) {
                    val s = (samples[i].coerceIn(-1.0f, 1.0f) * 32767.0f).toInt().toShort()
                    pcm16[i * 2] = (s.toInt() and 0xFF).toByte()
                    pcm16[i * 2 + 1] = ((s.toInt() shr 8) and 0xFF).toByte()
                }

                ensureAudioTrackPlaying()

                var offset = 0
                val chunkSize = 4096
                while (offset < pcm16.size && isPlayingKokoro) {
                    val writeLen = minOf(chunkSize, pcm16.size - offset)
                    audioTrack?.write(pcm16, offset, writeLen)
                    offset += writeLen
                }

                if (isPlayingKokoro) {
                    // Small drain buffer for hardware audio output
                    Thread.sleep(120)
                }

                Log.d(TAG, "Kokoro playback finished")
                onPlaybackFinishedCallback?.invoke()
            } catch (_: InterruptedException) {
                Log.d(TAG, "Kokoro playback interrupted")
            } catch (e: Throwable) {
                Log.e(TAG, "Kokoro synthesis error: ${e.message}", e)
                onPlaybackFinishedCallback?.invoke()
            } finally {
                isPlayingKokoro = false
            }
        }.also { it.start() }
    }

    private fun ensureAudioTrackPlaying() {
        try {
            if (audioTrack == null || audioTrack?.state != AudioTrack.STATE_INITIALIZED) {
                audioTrack = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(24000)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setBufferSizeInBytes(32000)
                    .setTransferMode(AudioTrack.MODE_STREAM)
                    .build()
            }
            if (audioTrack?.playState != AudioTrack.PLAYSTATE_PLAYING) {
                audioTrack?.play()
            }
        } catch (e: Throwable) {
            Log.w(TAG, "ensureAudioTrackPlaying warning: ${e.message}")
        }
    }

    private fun speakSystemTts(text: String, voiceName: String?) {
        val t = tts
        if (!isTtsReady || t == null) {
            Log.w(TAG, "speakText: System TTS not ready yet, queuing retry...")
            Thread {
                Thread.sleep(300)
                if (isTtsReady && tts != null) {
                    speakSystemTts(text, voiceName)
                }
            }.start()
            return
        }

        try {
            if (voiceName?.startsWith("hm_") == true) {
                t.setPitch(0.88f)
                t.setSpeechRate(0.96f)
            } else {
                t.setPitch(1.05f)
                t.setSpeechRate(1.02f)
            }

            val utteranceId = "utt_${System.currentTimeMillis()}"
            val params = Bundle().apply {
                putInt(TextToSpeech.Engine.KEY_PARAM_STREAM, android.media.AudioManager.STREAM_MUSIC)
                putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f)
            }

            val result = t.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId)
            Log.d(TAG, "System TTS speak result=$result for text: \"$text\"")
        } catch (e: Exception) {
            Log.e(TAG, "System speakText error: ${e.message}", e)
            onPlaybackFinishedCallback?.invoke()
        }
    }

    fun stopPlaybackAndFlush() {
        isPlayingKokoro = false
        kokoroPlaybackThread?.interrupt()
        kokoroPlaybackThread = null
        try {
            audioTrack?.let {
                it.pause()
                it.flush()
            }
        } catch (_: Throwable) {}
        try {
            tts?.stop()
        } catch (e: Exception) {
            Log.w(TAG, "TTS stopPlaybackAndFlush error: ${e.message}")
        }
        stopPlaybackInstantly()
    }

    @SuppressLint("MissingPermission")
    fun initializeAEC(sampleRate: Int = 16000, bufferSizeFrames: Int = 320): Boolean {
        try {
            val minBufferSize = AudioRecord.getMinBufferSize(
                sampleRate,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            )
            val baseMin = if (minBufferSize > 0) minBufferSize else 2048
            val bufferSize = maxOf(baseMin * 2, bufferSizeFrames * 4, 4096)

            releaseAudioRecord()

            // Try VOICE_COMMUNICATION first for hardware DSP mic tuning & OS AEC
            try {
                audioRecord = AudioRecord(
                    MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                    sampleRate,
                    AudioFormat.CHANNEL_IN_MONO,
                    AudioFormat.ENCODING_PCM_16BIT,
                    bufferSize
                )
            } catch (e: Exception) {
                Log.w(TAG, "Failed creating AudioRecord with VOICE_COMMUNICATION: ${e.message}")
            }

            // Fallback to MIC if VOICE_COMMUNICATION not initialized
            if (audioRecord == null || audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                releaseAudioRecord()
                try {
                    audioRecord = AudioRecord(
                        MediaRecorder.AudioSource.MIC,
                        sampleRate,
                        AudioFormat.CHANNEL_IN_MONO,
                        AudioFormat.ENCODING_PCM_16BIT,
                        bufferSize
                    )
                } catch (e: Exception) {
                    Log.w(TAG, "Failed creating AudioRecord with MIC: ${e.message}")
                }
            }

            // Fallback to DEFAULT if MIC also not initialized
            if (audioRecord == null || audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                releaseAudioRecord()
                try {
                    audioRecord = AudioRecord(
                        MediaRecorder.AudioSource.DEFAULT,
                        sampleRate,
                        AudioFormat.CHANNEL_IN_MONO,
                        AudioFormat.ENCODING_PCM_16BIT,
                        bufferSize
                    )
                } catch (e: Exception) {
                    Log.w(TAG, "Failed creating AudioRecord with DEFAULT: ${e.message}")
                }
            }

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                Log.e(TAG, "AudioRecord could not be initialized in any mode.")
                releaseAudioRecord()
                return false
            }

            // Attach AcousticEchoCanceler if supported by hardware chipset
            try {
                val audioSessionId = audioRecord?.audioSessionId ?: 0
                if (AcousticEchoCanceler.isAvailable() && audioSessionId != 0) {
                    aec = AcousticEchoCanceler.create(audioSessionId)?.apply {
                        enabled = true
                    }
                }
            } catch (e: Throwable) {
                Log.w(TAG, "AcousticEchoCanceler attachment failed: ${e.message}")
            }

            // Initialize low-latency streaming AudioTrack for Kokoro TTS playback (24kHz native)
            try {
                audioTrack = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(24000)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setBufferSizeInBytes(bufferSize * 4)
                    .setTransferMode(AudioTrack.MODE_STREAM)
                    .build()

                audioTrack?.play()
            } catch (e: Throwable) {
                Log.w(TAG, "AudioTrack initialization warning: ${e.message}")
            }

            return true
        } catch (e: Throwable) {
            Log.e(TAG, "Error during initializeAEC: ${e.message}", e)
            return false
        }
    }

    fun startRecording() {
        if (isRecording) return
        val record = audioRecord
        if (record == null || record.state != AudioRecord.STATE_INITIALIZED) {
            Log.w(TAG, "startRecording skipped: AudioRecord is not initialized.")
            return
        }

        try {
            record.startRecording()
            isRecording = true
        } catch (e: Throwable) {
            Log.e(TAG, "startRecording failed: ${e.message}", e)
            isRecording = false
            return
        }

        recordingThread = Thread {
            val buffer = ByteArray(640) // 20ms @ 16kHz 16-bit mono
            while (isRecording) {
                try {
                    val readBytes = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                    if (readBytes > 0) {
                        var sum = 0.0
                        val shortCount = readBytes / 2
                        for (i in 0 until shortCount) {
                            val sample = (buffer[i * 2 + 1].toInt() shl 8) or (buffer[i * 2].toInt() and 0xFF)
                            val norm = sample.toDouble() / 32768.0
                            sum += norm * norm
                        }
                        val rms = sqrt(sum / shortCount).toFloat()
                        val volume = (rms * 5.0f).coerceIn(0.0f, 1.0f)

                        onAudioBufferCallback?.invoke(buffer.copyOf(readBytes), volume)
                    }
                } catch (e: Throwable) {
                    Log.w(TAG, "Exception during audio record loop: ${e.message}")
                    break
                }
            }
        }.also { it.start() }
    }

    fun stopRecording() {
        isRecording = false
        try {
            recordingThread?.join(300)
        } catch (_: Throwable) {}
        recordingThread = null

        try {
            if (audioRecord?.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                audioRecord?.stop()
            }
        } catch (e: Throwable) {
            Log.w(TAG, "stopRecording warning: ${e.message}")
        }
    }

    fun enqueueAudioSamples(pcmData: ByteArray) {
        try {
            audioTrack?.write(pcmData, 0, pcmData.size)
        } catch (e: Throwable) {
            Log.w(TAG, "enqueueAudioSamples warning: ${e.message}")
        }
    }

    fun stopPlaybackInstantly() {
        try {
            audioTrack?.let {
                it.pause()
                it.flush()
                it.play()
            }
        } catch (e: Throwable) {
            Log.w(TAG, "stopPlaybackInstantly warning: ${e.message}")
        }
    }

    private fun releaseAudioRecord() {
        try {
            if (audioRecord?.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                audioRecord?.stop()
            }
            audioRecord?.release()
        } catch (_: Throwable) {}
        audioRecord = null
    }

    fun release() {
        stopRecording()
        releaseAudioRecord()

        try {
            tts?.stop()
            tts?.shutdown()
        } catch (_: Throwable) {}
        tts = null
        isTtsReady = false

        try {
            aec?.release()
        } catch (_: Throwable) {}
        aec = null

        try {
            audioTrack?.stop()
            audioTrack?.release()
        } catch (_: Throwable) {}
        audioTrack = null
    }
}
