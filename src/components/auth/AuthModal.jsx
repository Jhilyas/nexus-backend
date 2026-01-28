import { useState } from 'react'
import './AuthModal.css'

const translations = {
    fr: {
        title: 'Bienvenue sur NEXUS',
        subtitle: 'Entrez votre nom pour commencer',
        namePlaceholder: 'Votre nom complet',
        submit: 'Commencer',
        error: 'Veuillez entrer votre nom'
    },
    ar: {
        title: 'مرحباً بك في NEXUS',
        subtitle: 'أدخل اسمك للبدء',
        namePlaceholder: 'الاسم الكامل',
        submit: 'ابدأ',
        error: 'الرجاء إدخال اسمك'
    },
    en: {
        title: 'Welcome to NEXUS',
        subtitle: 'Enter your name to get started',
        namePlaceholder: 'Your full name',
        submit: 'Get Started',
        error: 'Please enter your name'
    }
}

const AuthModal = ({ isOpen, onClose, onSuccess, language = 'fr' }) => {
    const [name, setName] = useState('')
    const [error, setError] = useState('')

    const t = translations[language] || translations.fr
    const isRTL = language === 'ar'

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!name.trim()) {
            setError(t.error)
            return
        }

        // Create user object with just the name
        const userData = {
            id: 'user_' + Date.now(),
            name: name.trim(),
            email: name.trim().toLowerCase().replace(/\s+/g, '.') + '@nexus.ma',
            plan: 'free',
            createdAt: new Date().toISOString()
        }

        // Save to localStorage
        localStorage.setItem('nexus_user', JSON.stringify(userData))
        localStorage.setItem('nexus_token', 'token_' + Date.now())

        onSuccess(userData)
        onClose()
        setName('')
        setError('')
    }

    if (!isOpen) return null

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div
                className={`auth-modal glass animate-scale-in ${isRTL ? 'rtl' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button className="auth-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Logo */}
                <div className="auth-logo">
                    <div className="logo-icon">
                        <div className="logo-orbit"></div>
                        <div className="logo-core"></div>
                    </div>
                    <span className="logo-text">NEXUS</span>
                </div>

                {/* Title */}
                <div className="auth-header">
                    <h2 className="auth-title">{t.title}</h2>
                    <p className="auth-subtitle">{t.subtitle}</p>
                </div>

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error animate-fade-in">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="input-group">
                        <input
                            type="text"
                            name="name"
                            className="input name-input"
                            placeholder={t.namePlaceholder}
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                setError('')
                            }}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg auth-submit"
                    >
                        <span className="btn-emoji">🚀</span>
                        {t.submit}
                    </button>
                </form>

                {/* Decorative elements */}
                <div className="auth-decoration">
                    <div className="auth-star auth-star-1">✨</div>
                    <div className="auth-star auth-star-2">⭐</div>
                    <div className="auth-star auth-star-3">💫</div>
                </div>
            </div>
        </div>
    )
}

export default AuthModal
