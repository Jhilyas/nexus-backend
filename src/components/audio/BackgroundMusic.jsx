import { useEffect, useRef, useState } from 'react'
import './BackgroundMusic.css'

const BackgroundMusic = ({ showControls = false }) => {
    const audioRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)

    useEffect(() => {
        const audio = audioRef.current
        if (audio) {
            audio.volume = 0.3

            // Force autoplay avec muted d'abord, puis unmute
            audio.muted = true
            const playPromise = audio.play()

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        // Unmute après le démarrage
                        setTimeout(() => {
                            audio.muted = false
                            setIsPlaying(true)
                        }, 100)
                    })
                    .catch(() => {
                        // Fallback: démarrer sur première interaction
                        const startAudio = () => {
                            audio.muted = false
                            audio.play().then(() => setIsPlaying(true))
                            document.removeEventListener('click', startAudio)
                            document.removeEventListener('touchstart', startAudio)
                        }
                        document.addEventListener('click', startAudio)
                        document.addEventListener('touchstart', startAudio)
                    })
            }
        }
    }, [])

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted
            setIsMuted(!isMuted)
        }
    }

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    // Exposer les fonctions globalement pour le Navbar
    useEffect(() => {
        window.nexusMusicControls = {
            togglePlay,
            toggleMute,
            getState: () => ({ isPlaying, isMuted })
        }
    }, [isPlaying, isMuted])

    return (
        <>
            <audio
                ref={audioRef}
                src="/background-music.mp3"
                loop
                preload="auto"
                autoPlay
            />
            {showControls && (
                <div className="music-controls">
                    <button
                        className="music-btn"
                        onClick={togglePlay}
                        aria-label={isPlaying ? 'Pause music' : 'Play music'}
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
                        className="music-btn"
                        onClick={toggleMute}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
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
                </div>
            )}
        </>
    )
}

export default BackgroundMusic
