import { useState, useRef, useEffect, useCallback } from 'react';
import { voiceAI } from '../../services/voiceAI';
import './RealtimeVoice.css';

// ═══════════════════════════════════════════════════════════════
// NEXUS AI - PREMIUM VOICE AI
// Browser STT → Groq LLaMA 3.3 → ElevenLabs TTS (French Voice)
// Created by Imane Taouss Badaoui
// ═══════════════════════════════════════════════════════════════

// Welcome message spoken when page opens
const WELCOME_MESSAGE = "Bonjour, je suis créée par Imane Taouss Badaoui, comment puis-je vous aider aujourd'hui?";

const translations = {
    fr: {
        title: 'NEXUS AI',
        subtitle: 'Assistant Vocal Intelligent',
        listening: 'Je vous écoute...',
        processing: 'Je réfléchis...',
        speaking: 'Je réponds...',
        idle: 'Cliquez pour parler',
        connecting: 'Connexion...',
        error: 'Erreur - Cliquez pour réessayer',
        backToHome: 'Retour',
        instructions: 'Cliquez sur l\'orb et parlez naturellement',
        conversationTitle: 'Conversation',
        clearHistory: 'Effacer',
        badge: '🎯 Créé par Imane Taouss Badaoui'
    },
    ar: {
        title: 'NEXUS AI',
        subtitle: 'مساعد صوتي ذكي',
        listening: '...أنا أستمع',
        processing: '...أفكر',
        speaking: '...أجيب',
        idle: 'اضغط للتحدث',
        connecting: '...جاري الاتصال',
        error: 'خطأ',
        backToHome: 'رجوع',
        instructions: 'اضغط وتحدث بشكل طبيعي',
        conversationTitle: 'المحادثة',
        clearHistory: 'مسح',
        badge: '🎯 Créé par Imane Taouss Badaoui'
    },
    en: {
        title: 'NEXUS AI',
        subtitle: 'Intelligent Voice Assistant',
        listening: 'Listening...',
        processing: 'Thinking...',
        speaking: 'Speaking...',
        idle: 'Click to speak',
        connecting: 'Connecting...',
        error: 'Error - Click to retry',
        backToHome: 'Back',
        instructions: 'Click the orb and speak naturally',
        conversationTitle: 'Conversation',
        clearHistory: 'Clear',
        badge: '🎯 Created by Imane Taouss Badaoui'
    }
};

const RealtimeVoice = ({ language = 'fr', onBack, isPage = true }) => {
    const [status, setStatus] = useState('idle');
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [conversationHistory, setConversationHistory] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState(null);

    const isProcessingRef = useRef(false);

    const t = translations[language] || translations.fr;
    const isRTL = language === 'ar';

    // Auto-speak welcome message when page opens
    const hasGreetedRef = useRef(false);

    useEffect(() => {
        // Play welcome greeting only once when page loads
        const playWelcomeGreeting = async () => {
            if (hasGreetedRef.current) return;
            hasGreetedRef.current = true;

            console.log('🎉 Playing welcome greeting...');
            setStatus('speaking');
            setResponse(WELCOME_MESSAGE);

            await voiceAI.speak(WELCOME_MESSAGE, {
                voice: 'charlotte',
                onStart: () => setStatus('speaking'),
                onEnd: () => setStatus('idle'),
                onError: () => setStatus('idle')
            });
        };

        // Small delay to let page render first
        const timer = setTimeout(playWelcomeGreeting, 500);

        return () => {
            clearTimeout(timer);
            voiceAI.stopAll();
        };
    }, []);

    // Process user message with REAL OpenAI API
    const handleUserMessage = useCallback(async (message, detectedLang) => {
        if (!message.trim() || isProcessingRef.current) return;

        isProcessingRef.current = true;
        console.log('═══════════════════════════════════════════');
        console.log('📝 User said:', message);
        console.log('🌍 Detected language:', detectedLang);
        console.log('═══════════════════════════════════════════');

        setStatus('processing');
        setErrorMessage('');
        setDetectedLanguage(detectedLang);

        // Add user message to history
        const newHistory = [...conversationHistory, {
            role: 'user',
            content: message,
            language: detectedLang
        }];
        setConversationHistory(newHistory);

        try {
            // GET REAL AI RESPONSE FROM GROQ!
            console.log('🧠 Calling Groq API...');
            const aiResponse = await voiceAI.getAIResponse(message, detectedLang);

            console.log('═══════════════════════════════════════════');
            console.log('✅ AI RESPONSE:', aiResponse);
            console.log('═══════════════════════════════════════════');

            setResponse(aiResponse);
            setConversationHistory(prev => [...prev, {
                role: 'assistant',
                content: aiResponse
            }]);

            // Speak with ElevenLabs (100% French voice!)
            setStatus('speaking');
            await voiceAI.speak(aiResponse, {
                voice: 'charlotte', // French female voice
                onStart: () => setStatus('speaking'),
                onEnd: () => {
                    setStatus('idle');
                    isProcessingRef.current = false;
                },
                onError: (err) => {
                    console.log('TTS error:', err);
                    setStatus('idle');
                    isProcessingRef.current = false;
                }
            });

        } catch (error) {
            console.error('❌ Error getting AI response:', error);
            setErrorMessage('Erreur de connexion. Réessayez.');
            setStatus('error');
            isProcessingRef.current = false;
        }
    }, [conversationHistory]);

    // Start listening with OpenAI Whisper
    const startListening = useCallback(async () => {
        setTranscript('');
        setResponse('');
        setErrorMessage('');
        setDetectedLanguage(null);

        try {
            setStatus('connecting');
            console.log('🎤 Starting Whisper STT...');

            await voiceAI.startListening({
                onInterim: (text) => {
                    setTranscript(text);
                    setStatus('listening');
                },
                onFinal: (text, detectedLang) => {
                    console.log('✅ Final transcript:', text);
                    console.log('🌍 Language:', detectedLang);
                    setTranscript(text);
                    if (text && text.trim()) {
                        handleUserMessage(text, detectedLang);
                    } else {
                        setStatus('idle');
                    }
                },
                onError: (err) => {
                    console.error('❌ STT error:', err);
                    setErrorMessage(err);
                    setStatus('error');
                }
            });

            setStatus('listening');
        } catch (error) {
            console.error('Failed to start:', error);
            setErrorMessage('Microphone access denied');
            setStatus('error');
        }
    }, [handleUserMessage]);

    // Stop all
    const stopAll = useCallback(() => {
        voiceAI.stopAll();
        isProcessingRef.current = false;
        setStatus('idle');
        setResponse('');
    }, []);

    const handleOrbClick = useCallback(() => {
        if (status === 'idle' || status === 'error') startListening();
        else stopAll();
    }, [status, startListening, stopAll]);

    const handleClearHistory = useCallback(() => {
        voiceAI.clearHistory();
        setConversationHistory([]);
        setTranscript('');
        setResponse('');
        setDetectedLanguage(null);
    }, []);

    const getStatusText = () => {
        if (errorMessage) return errorMessage;
        switch (status) {
            case 'listening': return t.listening;
            case 'processing': return t.processing;
            case 'speaking': return t.speaking;
            case 'connecting': return t.connecting;
            case 'error': return t.error;
            default: return t.idle;
        }
    };

    const getLanguageBadge = () => {
        if (!detectedLanguage) return null;
        const badges = {
            'french': '🇫🇷 Français',
            'arabic': '🇲🇦 العربية',
            'english': '🇬🇧 English'
        };
        return badges[detectedLanguage.toLowerCase()] || `🌍 ${detectedLanguage}`;
    };

    const content = (
        <>
            <div className="realtime-header">
                <h1 className="realtime-title text-gradient">{t.title}</h1>
                <p className="realtime-subtitle">{t.subtitle}</p>
                <span className="deepgram-badge">{t.badge}</span>
                {detectedLanguage && (
                    <span className="realtime-lang-badge">{getLanguageBadge()}</span>
                )}
            </div>

            <div className={`realtime-orb-container ${status}`} onClick={handleOrbClick}>
                <div className="realtime-orb">
                    <div className="realtime-orb-inner">
                        <div className="realtime-orb-core">
                            {status === 'error' ? '⚠️' :
                                status === 'processing' ? '🧠' :
                                    status === 'speaking' ? '🔊' : '🎤'}
                        </div>
                    </div>
                    {status === 'listening' && (
                        <>
                            <div className="realtime-pulse ring-1"></div>
                            <div className="realtime-pulse ring-2"></div>
                            <div className="realtime-pulse ring-3"></div>
                        </>
                    )}
                    {status === 'connecting' && <div className="realtime-connecting"></div>}
                    {status === 'speaking' && (
                        <div className="realtime-wave-container">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="realtime-wave-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>
                    )}
                    {status === 'processing' && <div className="realtime-spinner"></div>}
                </div>
            </div>

            <p className={`realtime-status ${status === 'error' || errorMessage ? 'error-text' : ''}`}>
                {getStatusText()}
            </p>

            {transcript && (
                <div className="realtime-transcript glass">
                    <span className="realtime-label">Vous:</span>
                    <p>{transcript}</p>
                </div>
            )}

            {response && (
                <div className="realtime-response glass">
                    <span className="realtime-label">NEXUS AI:</span>
                    <p>{response}</p>
                </div>
            )}

            {status === 'idle' && !transcript && !response && !errorMessage && (
                <div className="realtime-instructions"><p>{t.instructions}</p></div>
            )}

            {conversationHistory.length > 0 && (
                <div className="realtime-history">
                    <div className="realtime-history-header">
                        <h3>{t.conversationTitle}</h3>
                        <button className="realtime-clear-btn" onClick={handleClearHistory}>
                            {t.clearHistory}
                        </button>
                    </div>
                    <div className="realtime-history-list">
                        {conversationHistory.slice(-6).map((msg, idx) => (
                            <div key={idx} className={`realtime-history-item ${msg.role}`}>
                                <span className="realtime-history-icon">{msg.role === 'user' ? '👤' : '🤖'}</span>
                                <p>{msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    if (isPage) {
        return (
            <div className={`realtime-page ${isRTL ? 'rtl' : ''}`}>
                <div className="realtime-page-header">
                    <button className="realtime-back-btn" onClick={onBack}>← {t.backToHome}</button>
                </div>
                <div className="realtime-page-content">{content}</div>
            </div>
        );
    }

    return (
        <div className={`realtime-modal ${isRTL ? 'rtl' : ''}`}>
            <div className="realtime-modal-content">
                <button className="realtime-close-btn" onClick={onBack}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>
                {content}
            </div>
        </div>
    );
};

export default RealtimeVoice;
