// ═══════════════════════════════════════════════════════════════
// NEXUS - VOICE SERVICE
// STT: Deepgram Nova-2 | TTS: ElevenLabs Multilingual
// Supports: French, Arabic, English, and 26+ more languages!
// ═══════════════════════════════════════════════════════════════

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// ElevenLabs voice IDs - Multilingual voices
const ELEVENLABS_VOICES = {
    // Rachel - Calm, warm female voice (works great for all languages)
    default: '21m00Tcm4TlvDq8ikWAM',
    // Sarah - Soft, young female
    sarah: 'EXAVITQu4vr4xnSDxMaL',
    // Charlie - Casual male
    charlie: 'IKne3meq5aSn9XLyUdCD',
    // Emily - Calm female
    emily: 'LcfcDJNUP1GQjkzn1xUU',
};

// ═══════════════════════════════════════════════════════════════
// SPEECH-TO-TEXT (STT) - Deepgram Nova-2
// ═══════════════════════════════════════════════════════════════

class DeepgramSTT {
    constructor() {
        this.socket = null;
        this.stream = null;
        this.isListening = false;
        this.audioContext = null;
        this.processor = null;
        this.source = null;
    }

    async start(options = {}) {
        const {
            language = 'fr',
            onInterim = () => { },
            onFinal = () => { },
            onError = () => { }
        } = options;

        this.onTranscript = onInterim;
        this.onFinalTranscript = onFinal;
        this.onError = onError;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            // Language mapping for Deepgram
            const langMap = {
                'fr': 'fr',
                'ar': 'ar',
                'en': 'en-US',
                'darija': 'ar'
            };

            const deepgramLang = langMap[language] || 'fr';

            // Connect to Deepgram WebSocket
            const wsUrl = `wss://api.deepgram.com/v1/listen?` +
                `encoding=linear16&sample_rate=16000&channels=1&` +
                `language=${deepgramLang}&model=nova-2&` +
                `smart_format=true&interim_results=true&endpointing=300`;

            this.socket = new WebSocket(wsUrl, ['token', DEEPGRAM_API_KEY]);

            this.socket.onopen = () => {
                console.log('🎤 Deepgram STT connected');
                this.isListening = true;
                this.startRecording();
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'Results' && data.channel?.alternatives?.[0]) {
                        const transcript = data.channel.alternatives[0].transcript;
                        if (transcript) {
                            if (data.is_final) {
                                this.onFinalTranscript(transcript);
                            } else {
                                this.onTranscript(transcript);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                }
            };

            this.socket.onerror = (error) => {
                console.error('Deepgram STT error:', error);
                this.onError('Speech recognition error');
            };

            this.socket.onclose = () => {
                console.log('Deepgram STT disconnected');
                this.isListening = false;
            };

        } catch (error) {
            console.error('Failed to start STT:', error);
            this.onError('Microphone access denied');
            throw error;
        }
    }

    startRecording() {
        if (!this.stream) return;

        this.audioContext = new AudioContext({ sampleRate: 16000 });
        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.processor.onaudioprocess = (e) => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16Data = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }
                this.socket.send(int16Data.buffer);
            }
        };

        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
    }

    stop() {
        this.isListening = false;
        if (this.processor) this.processor.disconnect();
        if (this.source) this.source.disconnect();
        if (this.audioContext) this.audioContext.close();
        if (this.socket) { this.socket.close(); this.socket = null; }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// TEXT-TO-SPEECH (TTS) - ElevenLabs Multilingual
// Supports 29+ languages including French, Arabic, English!
// ═══════════════════════════════════════════════════════════════

class ElevenLabsTTS {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentSource = null;
    }

    async speak(text, options = {}) {
        const {
            language = 'fr',
            voice = 'default',
            onStart = () => { },
            onEnd = () => { },
            onError = () => { }
        } = options;

        const voiceId = ELEVENLABS_VOICES[voice] || ELEVENLABS_VOICES.default;

        try {
            this.isPlaying = true;
            onStart();

            console.log(`🔊 ElevenLabs TTS: Speaking in ${language}`);

            // Call ElevenLabs TTS API with multilingual model
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_multilingual_v2', // Supports 29 languages!
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.5,
                        use_speaker_boost: true
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ElevenLabs error: ${response.status} - ${errorText}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Play audio
            await this.playAudioUrl(audioUrl);
            URL.revokeObjectURL(audioUrl);

            onEnd();
        } catch (error) {
            console.error('ElevenLabs TTS error:', error);
            onError(error.message);

            // Fallback to Web Speech API
            console.log('Falling back to Web Speech API...');
            await this.fallbackSpeak(text, language, onEnd);
        } finally {
            this.isPlaying = false;
        }
    }

    playAudioUrl(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            audio.onended = () => resolve();
            audio.onerror = (e) => reject(e);
            audio.play().catch(reject);
            this.currentAudio = audio;
        });
    }

    async fallbackSpeak(text, language, onEnd) {
        return new Promise((resolve) => {
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(text);

            const langMap = { 'fr': 'fr-FR', 'ar': 'ar-SA', 'en': 'en-US' };
            utterance.lang = langMap[language] || 'fr-FR';
            utterance.rate = 0.9;

            utterance.onend = () => { onEnd(); resolve(); };
            utterance.onerror = () => { onEnd(); resolve(); };

            synth.speak(utterance);
        });
    }

    stop() {
        this.isPlaying = false;
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        window.speechSynthesis?.cancel();
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIFIED VOICE SERVICE
// ═══════════════════════════════════════════════════════════════

class VoiceService {
    constructor() {
        this.stt = new DeepgramSTT();
        this.tts = new ElevenLabsTTS();
        this.conversationHistory = [];
    }

    async startListening(options) {
        return this.stt.start(options);
    }

    stopListening() {
        this.stt.stop();
    }

    async speak(text, options) {
        return this.tts.speak(text, options);
    }

    stopSpeaking() {
        this.tts.stop();
    }

    stopAll() {
        this.stopListening();
        this.stopSpeaking();
    }

    addMessage(role, content) {
        this.conversationHistory.push({ role, content });
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
    }

    getHistory() {
        return this.conversationHistory;
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}

// Export singleton instance
export const deepgramVoice = new VoiceService();

// Also export classes for direct use
export { DeepgramSTT, ElevenLabsTTS, VoiceService };
