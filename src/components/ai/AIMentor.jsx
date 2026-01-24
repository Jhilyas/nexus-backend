import { useState, useRef, useEffect } from 'react'
import { ai } from '../../services/supabase'
import usageLimitService from '../../services/usageLimits'
import UpgradePrompt from '../common/UpgradePrompt'
import './AIMentor.css'

const translations = {
    fr: {
        title: 'NEXUS AI',
        subtitle: 'Votre Guide Personnel IA',
        placeholder: 'Posez votre question...',
        send: 'Envoyer',
        thinking: 'NEXUS AI réfléchit...',
        modes: {
            mentor: '🎓 Mentor',
            friend: '🤝 Ami',
            motivator: '🔥 Motivateur',
            calm: '🧘 Calme'
        },
        suggestions: [
            'Quelles sont les meilleures écoles d\'ingénieurs au Maroc ?',
            'Comment me préparer pour le concours ENSAM ?',
            'Quel métier correspond à mon profil scientifique ?',
            'Explique-moi les filières après le bac au Maroc'
        ],
        greeting: 'Bonjour ! Je suis NEXUS AI. Je suis spécialisé dans l\'orientation éducative au Maroc. Posez-moi vos questions sur les écoles, les filières, les concours ou votre avenir professionnel !',
        errorMessage: 'Désolé, une erreur s\'est produite. Veuillez réessayer.'
    },
    ar: {
        title: 'NEXUS AI',
        subtitle: 'مرشدك الشخصي بالذكاء الاصطناعي',
        placeholder: 'اطرح سؤالك...',
        send: 'إرسال',
        thinking: 'NEXUS AI يفكر...',
        modes: {
            mentor: '🎓 مرشد',
            friend: '🤝 صديق',
            motivator: '🔥 محفز',
            calm: '🧘 هادئ'
        },
        suggestions: [
            'ما هي أفضل مدارس الهندسة في المغرب؟',
            'كيف أستعد لمباراة ENSAM؟',
            'أي مهنة تناسب ملفي العلمي؟',
            'اشرح لي المسارات بعد البكالوريا في المغرب'
        ],
        greeting: 'مرحبا! أنا NEXUS AI. أنا متخصص في التوجيه التعليمي في المغرب. اسألني عن المدارس، المسارات، المباريات أو مستقبلك المهني!',
        errorMessage: 'عذرا، حدث خطأ. يرجى المحاولة مرة أخرى.'
    },
    en: {
        title: 'NEXUS AI',
        subtitle: 'Your Personal AI Guide',
        placeholder: 'Ask your question...',
        send: 'Send',
        thinking: 'NEXUS AI is thinking...',
        modes: {
            mentor: '🎓 Mentor',
            friend: '🤝 Friend',
            motivator: '🔥 Motivator',
            calm: '🧘 Calm'
        },
        suggestions: [
            'What are the best engineering schools in Morocco?',
            'How to prepare for the ENSAM exam?',
            'Which career matches my scientific profile?',
            'Explain the paths after high school in Morocco'
        ],
        greeting: 'Hello! I\'m NEXUS AI. I specialize in educational guidance in Morocco. Ask me about schools, programs, exams, or your professional future!',
        errorMessage: 'Sorry, an error occurred. Please try again.'
    }
}

const modePersonalities = {
    mentor: 'Tu es un mentor éducatif professionnel, sage et expérimenté. Tu donnes des conseils structurés et détaillés.',
    friend: 'Tu es un ami proche et bienveillant. Tu parles de manière décontractée mais toujours utile.',
    motivator: 'Tu es un coach motivant et énergique. Tu encourages et inspires avec enthousiasme.',
    calm: 'Tu es calme, posé et rassurant. Tu aides à réduire le stress et l\'anxiété.'
}

const AIMentor = ({ isOpen, onClose, language = 'fr' }) => {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [mode, setMode] = useState('mentor')
    const [showUpgrade, setShowUpgrade] = useState(false)
    const [promptType, setPromptType] = useState('follow') // 'follow' | 'upgrade' - follow shows FIRST
    const [remainingUses, setRemainingUses] = useState(usageLimitService.getRemaining('aiChat'))
    const messagesEndRef = useRef(null)
    const t = translations[language]
    const isRTL = language === 'ar'

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'assistant', content: t.greeting }])
        }
    }, [isOpen])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        // Check usage limit BEFORE sending
        const usage = usageLimitService.canUse('aiChat')
        if (!usage.allowed) {
            // Close chat first
            onClose()
            // Show appropriate prompt:
            // - After 10 trials: show BONUS (follow for +5)
            // - After 15 trials (all exhausted): show UPGRADE to Pro
            setTimeout(() => {
                if (usage.reason === 'bonus_needed') {
                    setPromptType('follow')  // First: follow for +5 bonus
                } else {
                    setPromptType('upgrade') // After 15: upgrade to Pro
                }
                setShowUpgrade(true)
            }, 100)
            return
        }

        // Record usage
        usageLimitService.recordUse('aiChat')
        setRemainingUses(usageLimitService.getRemaining('aiChat'))

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        try {
            // Appel à Supabase Edge Function (ai-chat)
            const data = await ai.chat(input, messages.slice(-10), mode, language)

            if (data.success && data.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
            } else {
                // Show backend error for debugging (includes "Debug: ...")
                setMessages(prev => [...prev, { role: 'assistant', content: data.response || t.errorMessage }])
            }
        } catch (error) {
            console.error('Error calling AI API:', error)
            setMessages(prev => [...prev, { role: 'assistant', content: t.errorMessage }])
        } finally {
            setIsTyping(false)
        }
    }


    const handleSuggestion = (suggestion) => {
        setInput(suggestion)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Show upgrade prompt even when chat is closed
    if (!isOpen && showUpgrade) {
        return (
            <UpgradePrompt
                feature="aiChat"
                type={promptType}
                usedCount={promptType === 'follow' ? 10 : 15}
                onFollow={() => {
                    usageLimitService.claimBonus()
                    setRemainingUses(usageLimitService.getRemaining('aiChat'))
                    setShowUpgrade(false)
                    // Reopen chat after claiming bonus - dispatch event to parent
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('reopenAIChat'))
                    }, 100)
                }}
                onClose={() => setShowUpgrade(false)}
                onUpgrade={() => {
                    setShowUpgrade(false)
                    // Scroll to pricing section
                    const pricingSection = document.getElementById('tarifs')
                    if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth' })
                    }
                }}
            />
        )
    }

    if (!isOpen) return null

    return (
        <div className={`mentor-overlay ${isRTL ? 'rtl' : ''}`}>
            <div className="mentor-container glass animate-scale-in">
                {/* Header */}
                <div className="mentor-header">
                    {/* Close button on left */}
                    <button className="close-btn" onClick={onClose} title="Fermer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="mentor-identity">
                        <div className="mentor-avatar">
                            <span>🧠</span>
                            <div className="avatar-pulse"></div>
                        </div>
                        <div className="mentor-info">
                            <h3 className="mentor-title">{t.title}</h3>
                            <p className="mentor-subtitle">{t.subtitle}</p>
                        </div>
                    </div>

                    <div className="mentor-actions">
                        <div className="mode-selector">
                            {Object.entries(t.modes).map(([key, label]) => (
                                <button
                                    key={key}
                                    className={`mode-btn ${mode === key ? 'active' : ''}`}
                                    onClick={() => setMode(key)}
                                    title={label}
                                >
                                    {label.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                        <button
                            className="voice-mode-btn"
                            onClick={() => {
                                onClose();
                                // Trigger voice mentor via global event
                                window.dispatchEvent(new CustomEvent('openVoiceMentor'));
                            }}
                            title="Mode vocal"
                        >
                            🎤
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="mentor-messages">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message ${message.role} animate-fade-in-up`}
                        >
                            {message.role === 'assistant' && (
                                <div className="message-avatar">🧠</div>
                            )}
                            <div className="message-content">
                                <p>{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message assistant animate-fade-in">
                            <div className="message-avatar">🧠</div>
                            <div className="message-content typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length <= 1 && (
                    <div className="mentor-suggestions">
                        {t.suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                className="suggestion-btn"
                                onClick={() => handleSuggestion(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="mentor-input-container">
                    <div className="mentor-input-wrapper glass">
                        <textarea
                            className="mentor-input"
                            placeholder={t.placeholder}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            rows="1"
                        />
                        <button
                            className="send-btn btn-primary"
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {showUpgrade && (
                <UpgradePrompt
                    feature="aiChat"
                    type={promptType}
                    usedCount={promptType === 'follow' ? 10 : 15}
                    onFollow={() => {
                        usageLimitService.claimBonus()
                        setRemainingUses(usageLimitService.getRemaining('aiChat'))
                        setShowUpgrade(false)
                    }}
                    onClose={() => setShowUpgrade(false)}
                />
            )}
        </div>
    )
}

export default AIMentor
