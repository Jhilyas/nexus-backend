// ═══════════════════════════════════════════════════════════════
// NEXUS - VOICE AI SERVICE PREMIUM
// STT: Web Speech API (Browser Native - FREE!)
// AI: Groq LLaMA 3.3 via Backend (Ultra Fast & FREE!)
// TTS: ElevenLabs (100% French Voice with Emotions)
// ═══════════════════════════════════════════════════════════════

// Import Supabase Client
import { supabase } from './supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// ═══════════════════════════════════════════════════════════════
// ELEVENLABS EXPRESSIVE VOICES - Maximum Emotion! 🎭
// These voices have the BEST emotional range and expressiveness
// ═══════════════════════════════════════════════════════════════
const FRENCH_VOICES = {
    // 🎭 MOST EXPRESSIVE - Strong emotions!
    bella: 'EXAVITQu4vr4xnSDxMaL',        // 👩 Very expressive, emotional, warm
    rachel: '21m00Tcm4TlvDq8ikWAM',       // 👩 Warm, expressive, professional
    sarah: 'EXAVITQu4vr4xnSDxMaL',        // 👩 Multilingual, very emotional

    // 🇫🇷 FRENCH NATIVE - Charming accent
    charlotte: 'XB0fDUnXU5powFXDhCwa',    // 👩 French female, charming & emotional
    thomas: 'GBv7mTt0atIp3Br8iCZE',       // 👨 French male, expressive professional

    // 💫 SPECIAL VOICES - Unique personalities
    elli: 'MF3mGyEYCl7XYWbV9V6O',         // 👩 Young, cheerful, very expressive
    domi: 'AZnzlk1XvdvUeBnXmlld',         // 👩 Strong, emotional, confident

    // Default: Bella (most expressive!)
    default: 'EXAVITQu4vr4xnSDxMaL'
};

// ═══════════════════════════════════════════════════════════════
// SPEECH-TO-TEXT (STT) - Web Speech API (Browser Native - FREE!)
// Works great for French, Arabic, English!
// ═══════════════════════════════════════════════════════════════

class BrowserSTT {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.detectedLanguage = 'french';
    }

    async start(options = {}) {
        const {
            onInterim = () => { },
            onFinal = () => { },
            onError = () => { }
        } = options;

        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            const errorMsg = 'Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome ou Edge.';
            console.error('❌ Web Speech API not supported');
            onError(errorMsg);
            throw new Error(errorMsg);
        }

        try {
            this.recognition = new SpeechRecognition();

            // Configure for best recognition
            this.recognition.continuous = false;      // Stop after speech ends
            this.recognition.interimResults = true;   // Get results while speaking
            this.recognition.maxAlternatives = 1;
            this.recognition.lang = 'fr-FR';          // French by default

            let finalTranscript = '';
            let hasResult = false;

            this.recognition.onstart = () => {
                console.log('🎤 Browser STT: Listening...');
                this.isListening = true;
                onInterim('🎤 Parlez maintenant...');
            };

            this.recognition.onresult = (event) => {
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        finalTranscript = transcript;
                        hasResult = true;
                        console.log(`✅ Final: "${transcript}"`);
                    } else {
                        interimTranscript = transcript;
                        onInterim(interimTranscript);
                    }
                }
            };

            this.recognition.onend = () => {
                console.log('🔇 Speech recognition ended');
                this.isListening = false;

                if (hasResult && finalTranscript.trim()) {
                    // Detect language from content
                    const detectedLang = this.detectLanguage(finalTranscript);
                    this.detectedLanguage = detectedLang;
                    onFinal(finalTranscript.trim(), detectedLang);
                } else {
                    onFinal('', null);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('❌ Speech recognition error:', event.error);
                this.isListening = false;

                let errorMessage = 'Erreur de reconnaissance vocale';
                switch (event.error) {
                    case 'not-allowed':
                        errorMessage = 'Microphone non autorisé. Veuillez autoriser l\'accès.';
                        break;
                    case 'no-speech':
                        errorMessage = 'Aucune parole détectée. Réessayez.';
                        break;
                    case 'network':
                        errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
                        break;
                    case 'aborted':
                        return; // User stopped, not an error
                }

                onError(errorMessage);
            };

            // Start listening
            this.recognition.start();
            console.log('🎤 Browser Speech Recognition started (FREE!)');

        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            onError('Impossible de démarrer la reconnaissance vocale');
            throw error;
        }
    }

    // Detect language from text content
    detectLanguage(text) {
        // Check for Arabic characters
        if (/[\u0600-\u06FF]/.test(text)) {
            return 'arabic';
        }

        // Check for French patterns
        if (/[éèêëàâäùûüîïçœ]|(?:je|tu|il|elle|nous|vous|qu'|c'est|j'ai|suis|sont|comment|pourquoi|parce)/i.test(text)) {
            return 'french';
        }

        // Check for English patterns
        if (/\b(?:the|is|are|what|how|why|because|hello|hi|yes|no|I'm|you're|don't|can't)\b/i.test(text)) {
            return 'english';
        }

        // Default to French
        return 'french';
    }

    stop() {
        this.isListening = false;
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Already stopped
            }
        }
    }

    getDetectedLanguage() {
        return this.detectedLanguage;
    }
}

// ═══════════════════════════════════════════════════════════════
// AI RESPONSES - Puter.js Gemini AI (FREE & UNLIMITED!)
// 🧠 REAL AI responses from Gemini (Ultra Fast & FREE!)
// ═══════════════════════════════════════════════════════════════

class PuterChat {
    constructor() {
        this.conversationHistory = [];
        this.systemPrompt = `Tu es un ami conseiller pour étudiants marocains.

RÈGLE: 2-3 phrases courtes MAX selon le contexte. Pas de listes!

SI TU NE SAIS PAS: "Je ne connais pas ça, désolé!"

EXEMPLES:
"L'ENSIAS c'est top pour l'info! Tu vises quel métier?"
"Le CNC c'est dur mais faisable. Faut bien bosser les maths!"

Langue = celle de l'utilisateur. Sois naturel et bref!`;
    }

    async getResponse(userMessage, detectedLanguage = null) {
        console.log('═══════════════════════════════════════════');
        console.log('🧠 PUTER CHAT - Getting AI Response via Gemini (FREE!)');
        console.log(`📝 User said: "${userMessage}"`);
        console.log(`🌍 Language: ${detectedLanguage}`);
        console.log('═══════════════════════════════════════════');

        // Add to history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        // Keep last 10 messages
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }

        // Language instruction
        const langInstructions = {
            'french': 'Réponds en français.',
            'arabic': 'أجب بالعربية.',
            'english': 'Reply in English.'
        };
        const langInstruction = langInstructions[detectedLanguage?.toLowerCase()] || langInstructions.french;

        try {
            // Format conversation history
            const contextMessages = this.conversationHistory
                .slice(0, -1)
                .map(msg => `${msg.role === 'assistant' ? 'Toi' : 'Utilisateur'}: ${msg.content}`)
                .join('\n');

            const fullPrompt = contextMessages
                ? `${this.systemPrompt}\n\n${langInstruction}\n\nHistorique:\n${contextMessages}\n\nUtilisateur: ${userMessage}\n\nToi:`
                : `${this.systemPrompt}\n\n${langInstruction}\n\nUtilisateur: ${userMessage}\n\nToi:`;

            console.log('📤 Calling Puter.js Gemini AI (FREE!)...');

            // Call Puter.js Gemini AI - FREE & UNLIMITED!
            const aiMessage = await window.puter.ai.chat(fullPrompt, {
                model: 'gemini-2.5-flash'
            });

            if (!aiMessage) {
                throw new Error('Empty response from AI');
            }

            console.log('═══════════════════════════════════════════');
            console.log(`✅ AI RESPONSE: "${aiMessage}"`);
            console.log('═══════════════════════════════════════════');

            this.conversationHistory.push({
                role: 'assistant',
                content: aiMessage
            });

            return aiMessage;

        } catch (error) {
            console.error('❌ Puter Chat Error:', error);
            return "Désolé, erreur de connexion. Réessaie dans un instant!";
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    getHistory() {
        return this.conversationHistory;
    }
}

// Keep GroqChat as alias for backwards compatibility
const GroqChat = PuterChat;

// ═══════════════════════════════════════════════════════════════
// TEXT-TO-SPEECH (TTS) - ElevenLabs
// 🇫🇷 100% FRENCH Native Voice with Emotions!
// ═══════════════════════════════════════════════════════════════

class ElevenLabsTTS {
    constructor() {
        this.currentAudio = null;
        this.isPlaying = false;
    }

    async speak(text, options = {}) {
        const {
            voice = 'charlotte', // Default: French female voice
            onStart = () => { },
            onEnd = () => { },
            onError = () => { }
        } = options;

        const voiceId = FRENCH_VOICES[voice] || FRENCH_VOICES.default;

        try {
            this.isPlaying = true;
            onStart();

            console.log(`🔊 ElevenLabs: Speaking with ${voice} (100% French)...`);

            if (!ELEVENLABS_API_KEY) {
                throw new Error('ElevenLabs API key not configured');
            }

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.25,        // Low = MORE expressive & emotional variation!
                        similarity_boost: 0.75, // Keep some voice consistency
                        style: 0.85,            // HIGH = Maximum emotion & expressiveness!
                        use_speaker_boost: true // Enhance voice clarity
                    }
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`ElevenLabs error: ${response.status} - ${error}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            await this.playAudio(audioUrl);
            URL.revokeObjectURL(audioUrl);

            onEnd();

        } catch (error) {
            console.error('❌ ElevenLabs Error:', error);
            console.log('🔄 Fallback to browser speech...');
            await this.fallbackSpeak(text, onEnd);
            onError(error.message);
        } finally {
            this.isPlaying = false;
        }
    }

    playAudio(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            this.currentAudio = audio;

            audio.onended = () => {
                this.currentAudio = null;
                resolve();
            };

            audio.onerror = (e) => {
                this.currentAudio = null;
                reject(e);
            };

            audio.play().catch(reject);
        });
    }

    async fallbackSpeak(text, onEnd) {
        return new Promise((resolve) => {
            const synth = window.speechSynthesis;
            if (!synth) {
                onEnd();
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
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
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        window.speechSynthesis?.cancel();
    }
}

// ═══════════════════════════════════════════════════════════════
// UNIFIED VOICE AI SERVICE
// Browser STT → Puter.js Gemini AI → ElevenLabs TTS
// ═══════════════════════════════════════════════════════════════

class VoiceAIService {
    constructor() {
        this.stt = new BrowserSTT();
        this.chat = new PuterChat();
        this.tts = new ElevenLabsTTS();
        this.lastDetectedLanguage = null;

        console.log('🎯 Voice AI Service Ready');
        console.log('   📍 STT: Browser Web Speech API (FREE!)');
        console.log('   📍 AI: Puter.js Gemini (FREE & UNLIMITED!)');
        console.log('   📍 TTS: ElevenLabs (100% French voice!)');
    }

    async startListening(options) {
        const wrappedOptions = {
            ...options,
            onFinal: (transcript, detectedLanguage) => {
                this.lastDetectedLanguage = detectedLanguage;
                if (options.onFinal) {
                    options.onFinal(transcript, detectedLanguage);
                }
            }
        };
        return this.stt.start(wrappedOptions);
    }

    stopListening() {
        this.stt.stop();
    }

    async getAIResponse(message, detectedLanguage = null) {
        const lang = detectedLanguage || this.lastDetectedLanguage;
        return this.chat.getResponse(message, lang);
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

    getConversationHistory() {
        return this.chat.getHistory();
    }

    clearHistory() {
        this.chat.clearHistory();
        this.lastDetectedLanguage = null;
    }

    getLastDetectedLanguage() {
        return this.lastDetectedLanguage;
    }
}

// Export singleton
export const voiceAI = new VoiceAIService();

// Export for compatibility (PuterChat replaces GroqChat/OpenAIChat)
export { BrowserSTT, PuterChat, PuterChat as GroqChat, PuterChat as OpenAIChat, ElevenLabsTTS, VoiceAIService, FRENCH_VOICES };
