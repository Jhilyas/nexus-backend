import { useState, useRef, useEffect, useCallback } from 'react';
import { voiceAI, FRENCH_VOICES } from '../../services/voiceAI';
import usageLimitService from '../../services/usageLimits';
import UpgradePrompt from '../common/UpgradePrompt';
import './VoiceMentor.css';
import './VoiceMentorPage.css';

// ═══════════════════════════════════════════════════════════════
// VOICE MENTOR PAGE - Premium AI Voice
// STT: Browser Web Speech API (Auto-detect language - FREE!)
// AI: Groq LLaMA 3.3 (Ultra Fast & FREE!)
// TTS: ElevenLabs (Charming French voice)
// ═══════════════════════════════════════════════════════════════

const translations = {
    fr: {
        title: 'NEXUS AI',
        subtitle: 'Assistant Vocal IA - Multilingue',
        listening: 'Je vous écoute...',
        processing: 'Je réfléchis...',
        speaking: 'Je réponds...',
        idle: 'Appuyez pour parler',
        connecting: 'Préparation...',
        error: 'Erreur - Cliquez pour réessayer',
        tapToInterrupt: 'Appuyez pour interrompre',
        backToHome: 'Retour',
        instructions: 'Parlez dans n\'importe quelle langue, je m\'adapte !',
        conversationTitle: 'Conversation',
        realVoice: '⚡ Groq + ElevenLabs',
        voiceLabel: 'Voix:',
        languageDetected: 'Langue détectée:',
        multilingualHint: '🌍 Français • العربية • English • Darija'
    }
};

// Voice options - Expressive & Emotional! 🎭
const voiceOptions = [
    { id: 'bella', name: 'Bella', description: '🎭 Très Émotive' },
    { id: 'rachel', name: 'Rachel', description: '💖 Chaleureuse' },
    { id: 'charlotte', name: 'Charlotte', description: '🇫🇷 Charmante' },
    { id: 'elli', name: 'Elli', description: '✨ Joyeuse' },
    { id: 'domi', name: 'Domi', description: '💪 Confiante' },
    { id: 'thomas', name: 'Thomas', description: '👨 Pro' }
];

const languageNames = {
    french: '🇫🇷 Français',
    arabic: '🇲🇦 العربية',
    english: '🇬🇧 English',
    spanish: '🇪🇸 Español',
    german: '🇩🇪 Deutsch',
    italian: '🇮🇹 Italiano',
    portuguese: '🇵🇹 Português',
    dutch: '🇳🇱 Nederlands',
    russian: '🇷🇺 Русский',
    chinese: '🇨🇳 中文',
    japanese: '🇯🇵 日本語',
    korean: '🇰🇷 한국어'
};

const VoiceMentorPage = ({ language = 'fr', onBack }) => {
    const [status, setStatus] = useState('idle');
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [conversationHistory, setConversationHistory] = useState([]);
    const [error, setError] = useState(null);
    const [selectedVoice, setSelectedVoice] = useState('bella');
    const [detectedLanguage, setDetectedLanguage] = useState(null);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [promptType, setPromptType] = useState('upgrade');
    const [remainingUses, setRemainingUses] = useState(usageLimitService.getRemaining('aiVoice'));

    const isProcessingRef = useRef(false);
    const t = translations.fr;

    useEffect(() => {
        // Initial greeting
        const sayHello = async () => {
            // Short delay to ensure voices are loaded
            setTimeout(async () => {
                await voiceAI.speak("Bonjour, je suis créé par Imane Taouss Badaoui, comment puis-je vous aider ?", { voice: selectedVoice });
            }, 500);
        };
        sayHello();

        return () => {
            voiceAI.stopAll();
        };
    }, []);

    // Process user message with auto-detected language
    const handleUserMessage = useCallback(async (message, detectedLang) => {
        if (!message.trim() || isProcessingRef.current) return;

        isProcessingRef.current = true;
        setStatus('processing');
        setTranscript(message);
        setDetectedLanguage(detectedLang);

        // Add user message
        const newHistory = [...conversationHistory, {
            role: 'user',
            content: message,
            language: detectedLang
        }];
        setConversationHistory(newHistory);

        try {
            // Get AI response - GPT will respond in the detected language!
            console.log(`🧠 Getting response (detected: ${detectedLang})...`);
            const aiMessage = await voiceAI.getAIResponse(message, detectedLang);

            setResponse(aiMessage);
            setConversationHistory(prev => [...prev, {
                role: 'assistant',
                content: aiMessage
            }]);

            // Speak with ElevenLabs
            setStatus('speaking');
            await voiceAI.speak(aiMessage, {
                voice: selectedVoice,
                onStart: () => setStatus('speaking'),
                onEnd: () => {
                    setStatus('idle');
                    isProcessingRef.current = false;
                },
                onError: (err) => {
                    console.error('TTS Error:', err);
                    setStatus('idle');
                    isProcessingRef.current = false;
                }
            });

        } catch (err) {
            console.error('Error:', err);
            setError('Erreur de communication');
            setStatus('error');
            isProcessingRef.current = false;
        }
    }, [conversationHistory, selectedVoice]);

    // Start listening - Whisper auto-detects language
    const startListening = useCallback(async () => {
        // Check usage limit
        const usage = usageLimitService.canUse('aiVoice');
        if (!usage.allowed) {
            if (usage.reason === 'bonus_needed') {
                setPromptType('follow');
            } else {
                setPromptType('upgrade');
            }
            setShowUpgrade(true);
            return;
        }

        // Record usage
        usageLimitService.recordUse('aiVoice');
        setRemainingUses(usageLimitService.getRemaining('aiVoice'));

        setTranscript('');
        setResponse('');
        setError(null);
        setDetectedLanguage(null);

        try {
            setStatus('connecting');

            await voiceAI.startListening({
                onInterim: (text) => {
                    setTranscript(text);
                    setStatus('listening');
                },
                onFinal: (text, detectedLang) => {
                    console.log(`📝 Final: "${text}" (${detectedLang})`);
                    if (text && text.trim()) {
                        handleUserMessage(text, detectedLang);
                    } else {
                        setStatus('idle');
                        setTranscript('');
                    }
                },
                onError: (err) => {
                    setError(err);
                    setStatus('error');
                }
            });

            setStatus('listening');
        } catch (error) {
            setError('Microphone access denied');
            setStatus('error');
        }
    }, [handleUserMessage]);

    const stopInteraction = useCallback(() => {
        voiceAI.stopAll();
        isProcessingRef.current = false;
        setStatus('idle');
    }, []);

    const handleOrbClick = useCallback(() => {
        if (status === 'idle' || status === 'error') {
            startListening();
        } else {
            stopInteraction();
        }
    }, [status, startListening, stopInteraction]);

    const getStatusText = () => {
        switch (status) {
            case 'listening': return t.listening;
            case 'processing': return t.processing;
            case 'speaking': return t.tapToInterrupt;
            case 'connecting': return t.connecting;
            case 'error': return t.error;
            default: return t.idle;
        }
    };

    const handleClearHistory = () => {
        voiceAI.clearHistory();
        setConversationHistory([]);
        setTranscript('');
        setResponse('');
        setDetectedLanguage(null);
    };

    return (
        <div className="voice-page">
            <div className="voice-page-header">
                <button className="voice-back-btn" onClick={onBack}>
                    ← {t.backToHome}
                </button>
                <span className="voice-badge premium">{t.realVoice}</span>
            </div>

            <div className="voice-page-content">
                <div className="voice-header">
                    <h1 className="voice-title text-gradient">{t.title}</h1>
                    <p className="voice-subtitle">{t.subtitle}</p>
                    <p className="voice-multilingual-hint">{t.multilingualHint}</p>
                </div>

                {/* Voice Selector */}
                <div className="voice-selector">
                    <span className="voice-selector-label">{t.voiceLabel}</span>
                    <div className="voice-options">
                        {voiceOptions.map(voice => (
                            <button
                                key={voice.id}
                                className={`voice-option ${selectedVoice === voice.id ? 'active' : ''}`}
                                onClick={() => setSelectedVoice(voice.id)}
                                title={voice.description}
                            >
                                {voice.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detected Language Badge */}
                {detectedLanguage && (
                    <div className="voice-language-badge">
                        {languageNames[detectedLanguage.toLowerCase()] || `🌍 ${detectedLanguage}`}
                    </div>
                )}

                {/* Main Orb */}
                <div className={`voice-orb-container ${status}`} onClick={handleOrbClick}>
                    <div className="voice-orb">
                        <div className="voice-orb-inner">
                            <span className="voice-orb-icon">
                                {status === 'error' ? '⚠️' :
                                    status === 'processing' ? '🧠' :
                                        status === 'speaking' ? '🔊' : '🎤'}
                            </span>
                        </div>

                        {status === 'listening' && (
                            <>
                                <div className="voice-pulse-ring ring-1"></div>
                                <div className="voice-pulse-ring ring-2"></div>
                                <div className="voice-pulse-ring ring-3"></div>
                            </>
                        )}

                        {status === 'connecting' && (
                            <div className="voice-connecting-ring"></div>
                        )}

                        {status === 'speaking' && (
                            <div className="voice-wave-container">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="voice-wave-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                            </div>
                        )}

                        {status === 'processing' && (
                            <div className="voice-processing-ring"></div>
                        )}
                    </div>
                </div>

                <p className="voice-status">{getStatusText()}</p>

                {error && (
                    <div className="voice-error-message">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {transcript && (
                    <div className="voice-transcript glass">
                        <p className="voice-transcript-label">Vous:</p>
                        <p className="voice-transcript-text">{transcript}</p>
                    </div>
                )}

                {response && (
                    <div className="voice-response glass">
                        <p className="voice-response-label">NEXUS AI:</p>
                        <p className="voice-response-text">{response}</p>
                    </div>
                )}

                {status === 'idle' && !transcript && !response && (
                    <div className="voice-instructions">
                        <p>{t.instructions}</p>
                    </div>
                )}

                {conversationHistory.length > 2 && (
                    <div className="voice-history">
                        <div className="voice-history-header">
                            <h3>{t.conversationTitle}</h3>
                            <button className="voice-clear-btn" onClick={handleClearHistory}>
                                🗑️
                            </button>
                        </div>
                        <div className="voice-history-list">
                            {conversationHistory.slice(0, -2).map((msg, idx) => (
                                <div key={idx} className={`voice-history-item ${msg.role}`}>
                                    <span className="voice-history-role">
                                        {msg.role === 'user' ? '👤' : '🤖'}
                                    </span>
                                    <p>{msg.content.slice(0, 100)}{msg.content.length > 100 ? '...' : ''}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showUpgrade && (
                <UpgradePrompt
                    feature="aiVoice"
                    type={promptType}
                    usedCount={promptType === 'follow' ? 10 : 15}
                    onFollow={() => {
                        usageLimitService.claimBonus();
                        setRemainingUses(usageLimitService.getRemaining('aiVoice'));
                        setShowUpgrade(false);
                    }}
                    onClose={() => setShowUpgrade(false)}
                />
            )}
        </div>
    );
};

export default VoiceMentorPage;
