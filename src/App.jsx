import { useState, useEffect, useRef } from 'react'
import Navbar from './components/layout/Navbar'
import HeroSection from './components/hero/HeroSection'
import FeaturesSection from './components/features/FeaturesSection'
import OrientationEngine from './components/ai/OrientationEngine'
import TimelineSimulator from './components/dashboard/TimelineSimulator'
import AIMentor from './components/ai/AIMentor'
import RealtimeVoice from './components/ai/RealtimeVoice'
import HandController from './components/immersive/HandController'
import usageLimitService from './services/usageLimits'
import { UsageBadge } from './components/common/UpgradePrompt'

import PricingSection from './components/pricing/PricingSection'
import Dashboard from './components/dashboard/Dashboard'
import SchoolsExplorer from './components/explore/SchoolsExplorer'
import AuthModal from './components/auth/AuthModal'
import Footer from './components/layout/Footer'
import CosmicBackground from './components/effects/CosmicBackground'
import SplashScreen from './components/splash/SplashScreen'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [showMentor, setShowMentor] = useState(false)
  const [showVoiceMentor, setShowVoiceMentor] = useState(false)

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [language, setLanguage] = useState('fr')
  const [showSplash, setShowSplash] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const audioRef = useRef(null)

  // Usage tracking - updates when modals close
  const [usageKey, setUsageKey] = useState(0)
  const refreshUsage = () => setUsageKey(k => k + 1)


  // Liste des pistes musicales
  const musicTracks = [
    { src: '/background-music.mp3', name: 'Ambient' },
    { src: '/background-music-2.mp3', name: 'Journey' }
  ]

  useEffect(() => {
    // Smooth scroll for anchor links
    document.documentElement.style.scrollBehavior = 'smooth'

    // Check for saved user session
    const savedUser = localStorage.getItem('nexus_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } catch (error) {
        console.error('Failed to parse user session:', error)
        localStorage.removeItem('nexus_user')
      }
    }

    // Listen for voice mentor trigger from AIMentor
    const handleOpenVoiceMentor = () => {
      setShowVoiceMentor(true)
    }
    window.addEventListener('openVoiceMentor', handleOpenVoiceMentor)

    // Listen for reopen AI Chat after claiming bonus
    const handleReopenAIChat = () => {
      setShowMentor(true)
    }
    window.addEventListener('reopenAIChat', handleReopenAIChat)

    // Cleanup function
    return () => {
      window.removeEventListener('openVoiceMentor', handleOpenVoiceMentor)
      window.removeEventListener('reopenAIChat', handleReopenAIChat)
    }

    // Exposer les contrôles audio globalement
    window.nexusMusicControls = {
      togglePlay: () => {
        if (audioRef.current) {
          if (audioRef.current.paused) {
            audioRef.current.play()
            setIsPlaying(true)
          } else {
            audioRef.current.pause()
            setIsPlaying(false)
          }
        }
      },
      toggleMute: () => {
        if (audioRef.current) {
          audioRef.current.muted = !audioRef.current.muted
          setIsMuted(!isMuted)
        }
      },
      switchTrack: () => {
        const nextTrack = (currentTrack + 1) % musicTracks.length
        setCurrentTrack(nextTrack)
        if (audioRef.current) {
          const wasPlaying = !audioRef.current.paused
          audioRef.current.src = musicTracks[nextTrack].src
          audioRef.current.load()
          if (wasPlaying) {
            audioRef.current.play().catch(err => console.log('Play error:', err))
          }
        }
      },
      getState: () => ({ isPlaying, isMuted, currentTrack, trackName: musicTracks[currentTrack].name })
    }
  }, [isPlaying, isMuted])

  const handleSplashEnter = () => {
    // Démarrer la musique immédiatement
    if (audioRef.current) {
      audioRef.current.volume = 0.3
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.log('Audio play error:', err)
      })
    }
    setShowSplash(false)
  }

  const handleLogin = () => {
    setShowAuthModal(true)
  }

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('nexus_user', JSON.stringify(userData))
    // Reset usage limits for new login (gives fresh 10 uses)
    usageLimitService.reset()
    refreshUsage()
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    localStorage.removeItem('nexus_user')
    localStorage.removeItem('nexus_token')
    setCurrentPage('home')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onToggleMentor={() => setShowMentor(!showMentor)}
            user={user}
            language={language}
            setCurrentPage={setCurrentPage}
          />
        )
      case 'orientation':
        return <OrientationEngine language={language} />
      case 'timeline':
        return <TimelineSimulator language={language} />
      case 'explore':
        return <SchoolsExplorer language={language} />
      case 'voice':
        return (
          <RealtimeVoice
            language={language}
            onBack={() => setCurrentPage('home')}
            isPage={true}
          />
        )

      default:
        return (
          <>
            <HeroSection
              onExplore={() => setCurrentPage('orientation')}
              onLogin={handleLogin}
              language={language}
            />
            <FeaturesSection language={language} />
            <OrientationEngine language={language} />
            <TimelineSimulator language={language} />
            <SchoolsExplorer language={language} />
            <PricingSection language={language} user={user} onLoginRequired={handleLogin} />
          </>
        )
    }
  }

  return (
    <>
      {/* Audio persistant - toujours monté */}
      <audio
        ref={audioRef}
        src={musicTracks[currentTrack].src}
        loop
        preload="auto"
      />

      {/* Splash Screen */}
      {showSplash && <SplashScreen onEnter={handleSplashEnter} />}

      {/* Main App */}
      {!showSplash && (
        <div className="app">
          <CosmicBackground />
          <HandController />
          <Navbar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
            onLogout={handleLogout}
            language={language}
            setLanguage={setLanguage}
            user={user}
          />

          <main>
            {renderPage()}
          </main>

          {/* AI Mentor - Available when logged in */}
          <AIMentor
            isOpen={showMentor}
            onClose={() => { setShowMentor(false); refreshUsage(); }}
            language={language}
          />

          {/* Voice Mentor - OpenAI Realtime API */}
          {showVoiceMentor && (
            <RealtimeVoice
              language={language}
              onBack={() => { setShowVoiceMentor(false); refreshUsage(); }}
              isPage={false}
            />
          )}

          {/* Auth Modal */}
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
            language={language}
          />

          <Footer language={language} />



          {/* ═══════════════════════════════════════════════════════════════
              APPLE VISION PRO STYLE FLOATING ACTION BAR
              Premium glassmorphism design with all AI features
              ═══════════════════════════════════════════════════════════════ */}
          <div className="vision-pro-action-bar">
            <div className="vision-pro-bar-inner">
              {/* AI Voice Button */}
              <button
                className="vision-pro-btn voice"
                onClick={() => setShowVoiceMentor(true)}
                title="AI Voice"
              >
                <span className="btn-emoji">🎙️</span>
                <span className="btn-label">Voice</span>
                {!usageLimitService.isPro() && (
                  <UsageBadge remaining={usageLimitService.getRemaining('aiVoice')} />
                )}
              </button>

              {/* Divider */}
              <div className="vision-pro-divider"></div>

              {/* Hand Tracking Button */}
              <button
                className="vision-pro-btn hand"
                onClick={() => {
                  const handBtn = document.querySelector('.hand-toggle-btn');
                  if (handBtn) handBtn.click();
                }}
                title="Hand Tracking"
              >
                <span className="btn-emoji">🖐️</span>
                <span className="btn-label">Hand</span>
                {!usageLimitService.isPro() && (
                  <UsageBadge remaining={usageLimitService.getRemaining('handTracking')} />
                )}
              </button>

              {/* Divider */}
              <div className="vision-pro-divider"></div>

              {/* AI Chat Button */}
              <button
                className="vision-pro-btn chat"
                onClick={() => setShowMentor(true)}
                title="AI Chat"
              >
                <span className="btn-emoji">💬</span>
                <span className="btn-label">Chat</span>
                {!usageLimitService.isPro() && (
                  <UsageBadge remaining={usageLimitService.getRemaining('aiChat')} />
                )}
              </button>
            </div>

            {/* Ambient glow effect */}
            <div className="vision-pro-ambient"></div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
