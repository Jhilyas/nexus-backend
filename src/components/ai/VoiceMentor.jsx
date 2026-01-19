import { useState, useRef, useEffect, useCallback } from 'react';
import './VoiceMentor.css';

// ═══════════════════════════════════════════════════════════════
// VOICE MENTOR - Real-time Voice Conversations with SAGE
// ═══════════════════════════════════════════════════════════════

const translations = {
    fr: {
        title: 'SAGE Voice',
        subtitle: 'Conversation Vocale',
        listening: 'Je vous écoute...',
        processing: 'Je réfléchis...',
        speaking: 'Je réponds...',
        idle: 'Appuyez pour parler',
        connecting: 'Connexion...',
        error: 'Erreur de connexion',
        tapToInterrupt: 'Appuyez pour interrompre',
        micPermission: 'Autorisez le microphone',
        close: 'Fermer'
    },
    ar: {
        title: 'SAGE صوتي',
        subtitle: 'محادثة صوتية',
        listening: 'أنا أستمع...',
        processing: 'أفكر...',
        speaking: 'أجيب...',
        idle: 'اضغط للتحدث',
        connecting: 'جاري الاتصال...',
        error: 'خطأ في الاتصال',
        tapToInterrupt: 'اضغط للمقاطعة',
        micPermission: 'اسمح بالميكروفون',
        close: 'إغلاق'
    },
    en: {
        title: 'SAGE Voice',
        subtitle: 'Voice Conversation',
        listening: 'Listening...',
        processing: 'Thinking...',
        speaking: 'Speaking...',
        idle: 'Tap to speak',
        connecting: 'Connecting...',
        error: 'Connection error',
        tapToInterrupt: 'Tap to interrupt',
        micPermission: 'Allow microphone',
        close: 'Close'
    }
};

const VoiceMentor = ({ isOpen, onClose, language = 'fr', mode = 'mentor' }) => {
    const [status, setStatus] = useState('idle'); // idle, connecting, listening, processing, speaking, error
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState(null);

    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);

    const t = translations[language] || translations.fr;
    const isRTL = language === 'ar';

    // Get Supabase URL for WebSocket
    const getWebSocketUrl = useCallback(() => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) {
            console.error('VITE_SUPABASE_URL not configured');
            return null;
        }
        // Convert https:// to wss://
        return supabaseUrl.replace('https://', 'wss://') + '/functions/v1/ai-voice';
    }, []);

    // Initialize audio context
    const initAudio = useCallback(async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 24000 // OpenAI Realtime uses 24kHz
            });
        }

        // Resume audio context if suspended (browser autoplay policy)
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        return audioContextRef.current;
    }, []);

    // Request microphone access
    const getMicrophone = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 24000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            mediaStreamRef.current = stream;
            return stream;
        } catch (error) {
            console.error('Microphone access denied:', error);
            setStatus('error');
            return null;
        }
    }, []);

    // Convert audio stream to PCM16 and send to WebSocket
    const startAudioCapture = useCallback(async () => {
        const stream = mediaStreamRef.current;
        if (!stream || !wsRef.current) return;

        const audioContext = await initAudio();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
            if (wsRef.current?.readyState === WebSocket.OPEN && status === 'listening') {
                const inputData = e.inputBuffer.getChannelData(0);

                // Convert Float32 to PCM16
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Send as base64 encoded audio
                const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
                wsRef.current.send(JSON.stringify({
                    type: 'input_audio_buffer.append',
                    audio: base64Audio
                }));
            }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
    }, [initAudio, status]);

    // Play audio chunk from OpenAI
    const playAudioChunk = useCallback(async (base64Audio) => {
        const audioContext = await initAudio();

        // Decode base64 to PCM16
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert PCM16 to Float32
        const pcm16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(pcm16.length);
        for (let i = 0; i < pcm16.length; i++) {
            float32[i] = pcm16[i] / 32768;
        }

        // Create audio buffer and play
        const audioBuffer = audioContext.createBuffer(1, float32.length, 24000);
        audioBuffer.getChannelData(0).set(float32);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    }, [initAudio]);

    // Handle WebSocket messages from OpenAI
    const handleWSMessage = useCallback((event) => {
        try {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'session.created':
                    console.log('Voice session created');
                    setStatus('listening');
                    startAudioCapture();
                    break;

                case 'input_audio_buffer.speech_started':
                    setStatus('listening');
                    break;

                case 'input_audio_buffer.speech_stopped':
                    setStatus('processing');
                    break;

                case 'conversation.item.input_audio_transcription.completed':
                    setTranscript(message.transcript);
                    // Detect language from transcript (simple heuristic)
                    if (/[\u0600-\u06FF]/.test(message.transcript)) {
                        setDetectedLanguage('ar');
                    } else if (/[éèêëàâäùûüôöîïç]/i.test(message.transcript)) {
                        setDetectedLanguage('fr');
                    } else {
                        setDetectedLanguage('en');
                    }
                    break;

                case 'response.audio.delta':
                    setStatus('speaking');
                    if (message.delta) {
                        playAudioChunk(message.delta);
                    }
                    break;

                case 'response.audio_transcript.delta':
                    setResponse(prev => prev + (message.delta || ''));
                    break;

                case 'response.done':
                    setStatus('listening');
                    setResponse('');
                    break;

                case 'error':
                    console.error('OpenAI error:', message);
                    setStatus('error');
                    break;
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }, [playAudioChunk, startAudioCapture]);

    // Connect to voice service
    const connect = useCallback(async () => {
        setStatus('connecting');

        // Get microphone first
        const stream = await getMicrophone();
        if (!stream) return;

        // Connect WebSocket
        const wsUrl = getWebSocketUrl();
        if (!wsUrl) {
            setStatus('error');
            return;
        }

        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            console.log('Connected to voice service');
            // Session will be created by server, wait for session.created
        };

        wsRef.current.onmessage = handleWSMessage;

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setStatus('error');
        };

        wsRef.current.onclose = () => {
            console.log('WebSocket closed');
            if (status !== 'idle') {
                setStatus('idle');
            }
        };
    }, [getMicrophone, getWebSocketUrl, handleWSMessage, status]);

    // Disconnect and cleanup
    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        setStatus('idle');
        setTranscript('');
        setResponse('');
    }, []);

    // Interrupt AI response
    const interrupt = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN && status === 'speaking') {
            wsRef.current.send(JSON.stringify({
                type: 'response.cancel'
            }));
            setStatus('listening');
        }
    }, [status]);

    // Handle orb click
    const handleOrbClick = useCallback(() => {
        switch (status) {
            case 'idle':
            case 'error':
                connect();
                break;
            case 'speaking':
                interrupt();
                break;
            case 'listening':
            case 'processing':
                // Could implement push-to-talk here if needed
                break;
        }
    }, [status, connect, interrupt]);

    // Cleanup on unmount or close
    useEffect(() => {
        if (!isOpen) {
            disconnect();
        }
        return () => disconnect();
    }, [isOpen, disconnect]);

    // Get status text
    const getStatusText = () => {
        switch (status) {
            case 'connecting': return t.connecting;
            case 'listening': return t.listening;
            case 'processing': return t.processing;
            case 'speaking': return t.tapToInterrupt;
            case 'error': return t.error;
            default: return t.idle;
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`voice-mentor-overlay ${isRTL ? 'rtl' : ''}`}>
            <div className="voice-mentor-container animate-scale-in">
                {/* Close button */}
                <button className="voice-close-btn" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="voice-header">
                    <h2 className="voice-title text-gradient">{t.title}</h2>
                    <p className="voice-subtitle">{t.subtitle}</p>
                    {detectedLanguage && (
                        <span className="voice-language-badge">
                            {detectedLanguage === 'ar' ? '🇲🇦 عربي' :
                                detectedLanguage === 'fr' ? '🇫🇷 Français' :
                                    '🇬🇧 English'}
                        </span>
                    )}
                </div>

                {/* Voice Orb */}
                <div
                    className={`voice-orb-container ${status}`}
                    onClick={handleOrbClick}
                >
                    <div className="voice-orb">
                        <div className="voice-orb-inner">
                            <span className="voice-orb-icon">
                                {status === 'error' ? '⚠️' : '🎤'}
                            </span>
                        </div>

                        {/* Pulse rings for listening */}
                        {status === 'listening' && (
                            <>
                                <div className="voice-pulse-ring ring-1"></div>
                                <div className="voice-pulse-ring ring-2"></div>
                                <div className="voice-pulse-ring ring-3"></div>
                            </>
                        )}

                        {/* Wave animation for speaking */}
                        {status === 'speaking' && (
                            <div className="voice-wave-container">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="voice-wave-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                            </div>
                        )}

                        {/* Processing spinner */}
                        {(status === 'processing' || status === 'connecting') && (
                            <div className="voice-processing-ring"></div>
                        )}
                    </div>
                </div>

                {/* Status Text */}
                <p className="voice-status">{getStatusText()}</p>

                {/* Transcript Display */}
                {transcript && (
                    <div className="voice-transcript glass">
                        <p className="voice-transcript-label">Vous:</p>
                        <p className="voice-transcript-text">{transcript}</p>
                    </div>
                )}

                {/* Response Display */}
                {response && (
                    <div className="voice-response glass">
                        <p className="voice-response-label">SAGE:</p>
                        <p className="voice-response-text">{response}</p>
                    </div>
                )}

                {/* Instructions */}
                <div className="voice-instructions">
                    <p>{status === 'idle' ? t.idle : status === 'speaking' ? t.tapToInterrupt : ''}</p>
                </div>
            </div>
        </div>
    );
};

export default VoiceMentor;
