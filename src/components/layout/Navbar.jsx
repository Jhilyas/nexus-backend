import { useState, useEffect } from 'react'
import './Navbar.css'

// Composant pour les contrôles audio dans la navbar
const MusicControls = ({ isPlaying, isMuted, trackName, onTogglePlay, onToggleMute, onSwitchTrack }) => {
    return (
        <div className="navbar-music-controls">
            <button
                className="music-control-btn"
                onClick={onTogglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>
            <button
                className="music-control-btn"
                onClick={onToggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                )}
            </button>
            <button
                className="music-control-btn music-switch-btn"
                onClick={onSwitchTrack}
                title={`Changer la musique (${trackName})`}
            >
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                </svg>
            </button>
        </div>
    )
}

const translations = {
    fr: {
        home: 'Accueil',
        explore: 'Écoles',
        timeline: 'Timeline',
        dashboard: 'Tableau de bord',
        pricing: 'Tarifs',
        voice: 'AI Voice',
        login: 'Connexion',
        logout: 'Déconnexion',
        getStarted: 'Commencer'
    },
    ar: {
        home: 'الرئيسية',
        explore: 'المدارس',
        timeline: 'الجدول الزمني',
        dashboard: 'لوحة التحكم',
        pricing: 'الأسعار',
        voice: 'صوت AI',
        login: 'تسجيل الدخول',
        logout: 'تسجيل الخروج',
        getStarted: 'ابدأ الآن'
    },
    en: {
        home: 'Home',
        explore: 'Schools',
        timeline: 'Timeline',
        dashboard: 'Dashboard',
        pricing: 'Pricing',
        voice: 'AI Voice',
        login: 'Login',
        logout: 'Logout',
        getStarted: 'Get Started'
    }
}

const Navbar = ({
    currentPage,
    setCurrentPage,
    isLoggedIn,
    onLogin,
    onLogout,
    language,
    setLanguage,
    // Audio props
    isPlaying,
    isMuted,
    currentTrackName,
    onTogglePlay,
    onToggleMute,
    onSwitchTrack
}) => {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const t = translations[language] || translations.fr

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const languageOptions = [
        { code: 'fr', label: 'FR', flag: '🇫🇷' },
        { code: 'ar', label: 'ع', flag: '🇲🇦' },
        { code: 'en', label: 'EN', flag: '🇬🇧' }
    ]

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-logo" onClick={() => setCurrentPage('home')}>
                    <div className="logo-icon">
                        <div className="logo-orbit"></div>
                        <div className="logo-core"></div>
                    </div>
                    <span className="logo-text">NEXUS</span>
                </div>

                {/* Desktop Navigation */}
                <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
                    <button
                        className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                        onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }}
                    >
                        {t.home}
                    </button>
                    <button
                        className={`nav-link ${currentPage === 'explore' ? 'active' : ''}`}
                        onClick={() => { setCurrentPage('explore'); setMobileMenuOpen(false); }}
                    >
                        {t.explore}
                    </button>
                    <button
                        className={`nav-link ${currentPage === 'timeline' ? 'active' : ''}`}
                        onClick={() => { setCurrentPage('timeline'); setMobileMenuOpen(false); }}
                    >
                        ⏱️ {t.timeline}
                    </button>
                    {/* AI Voice - Accessible to EVERYONE! */}
                    <button
                        className={`nav-link voice-nav-link ${currentPage === 'voice' ? 'active' : ''}`}
                        onClick={() => { setCurrentPage('voice'); setMobileMenuOpen(false); }}
                    >
                        🎤 {t.voice}
                    </button>
                    {isLoggedIn && (
                        <button
                            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                            onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }}
                        >
                            {t.dashboard}
                        </button>
                    )}
                    <button
                        className="nav-link"
                        onClick={() => {
                            document.getElementById('tarifs')?.scrollIntoView({ behavior: 'smooth' })
                            setMobileMenuOpen(false)
                        }}
                    >
                        {t.pricing}
                    </button>
                    <button
                        className={`nav-link ${currentPage === 'blog' ? 'active' : ''}`}
                        onClick={() => { setCurrentPage('blog'); setMobileMenuOpen(false); }}
                    >
                        📝 {language === 'fr' ? 'Guides' : language === 'ar' ? 'أدلة' : 'Guides'}
                    </button>
                </div>

                {/* Right Section */}
                <div className="navbar-actions">
                    {/* Language Switcher */}
                    <div className="language-switcher">
                        {languageOptions.map((lang) => (
                            <button
                                key={lang.code}
                                className={`lang-btn ${language === lang.code ? 'active' : ''}`}
                                onClick={() => setLanguage(lang.code)}
                                title={lang.flag}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    {isLoggedIn ? (
                        <div className="user-menu">
                            <button className="user-avatar">
                                <span>I</span>
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={onLogout}>
                                {t.logout}
                            </button>
                            <MusicControls
                                isPlaying={isPlaying}
                                isMuted={isMuted}
                                trackName={currentTrackName}
                                onTogglePlay={onTogglePlay}
                                onToggleMute={onToggleMute}
                                onSwitchTrack={onSwitchTrack}
                            />
                        </div>
                    ) : (
                        <div className="user-menu">
                            <button className="btn btn-primary btn-sm" onClick={onLogin}>
                                {t.getStarted}
                            </button>
                            <MusicControls
                                isPlaying={isPlaying}
                                isMuted={isMuted}
                                trackName={currentTrackName}
                                onTogglePlay={onTogglePlay}
                                onToggleMute={onToggleMute}
                                onSwitchTrack={onSwitchTrack}
                            />
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn show-mobile"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
