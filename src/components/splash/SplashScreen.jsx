import { useState } from 'react'
import './SplashScreen.css'

const SplashScreen = ({ onEnter }) => {
    const [isExiting, setIsExiting] = useState(false)

    const handleEnter = () => {
        setIsExiting(true)
        setTimeout(() => {
            onEnter()
        }, 800)
    }

    return (
        <div className={`splash-screen ${isExiting ? 'exiting' : ''}`}>
            {/* Background Effects */}
            <div className="splash-bg">
                <div className="splash-orb splash-orb-1"></div>
                <div className="splash-orb splash-orb-2"></div>
                <div className="splash-orb splash-orb-3"></div>
            </div>

            {/* Content */}
            <div className="splash-content">
                {/* Logo */}
                <div className="splash-logo">
                    <div className="splash-logo-icon">
                        <div className="splash-orbit"></div>
                        <div className="splash-core"></div>
                    </div>
                    <h1 className="splash-title">NEXUS</h1>
                </div>

                {/* Tagline */}
                <p className="splash-tagline">Là où chaque avenir commence</p>

                {/* Enter Button */}
                <button className="splash-enter-btn" onClick={handleEnter}>
                    <span>Entrer</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Music Note */}
                <p className="splash-music-note">
                    <span>🎵</span> Expérience avec musique
                </p>
            </div>
        </div>
    )
}

export default SplashScreen
