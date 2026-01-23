import { useState, useEffect, useRef, useCallback } from 'react'
import './HandController.css'
import usageLimitService from '../../services/usageLimits'
import UpgradePrompt, { UsageBadge } from '../common/UpgradePrompt'

// ═══════════════════════════════════════════════════════════════════════════════
// APPLE VISION PRO STYLE - Simple & Precise
// Adaptive smoothing: responsive when moving, stable when still
// ═══════════════════════════════════════════════════════════════════════════════

const HandController = () => {
    const [isEnabled, setIsEnabled] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [handDetected, setHandDetected] = useState(false)
    const [gesture, setGesture] = useState('none')
    const [fps, setFps] = useState(0)
    const [showUpgrade, setShowUpgrade] = useState(false)
    const [promptType, setPromptType] = useState('upgrade') // 'upgrade' | 'follow'
    const [remainingUses, setRemainingUses] = useState(usageLimitService.getRemaining('handTracking'))

    const videoRef = useRef(null)
    const handsRef = useRef(null)
    const cameraRef = useRef(null)
    const cursorRef = useRef(null)
    const lastFrameTimeRef = useRef(performance.now())
    const frameCountRef = useRef(0)
    const lastClickRef = useRef(0)

    // Position tracking
    const currentPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const velocity = useRef({ x: 0, y: 0 })
    const lastRawPos = useRef({ x: 0, y: 0 })

    // Scroll tracking for fist gesture
    const lastScrollY = useRef(null)
    const isScrolling = useRef(false)

    // Animation loop - runs at 60fps for butter-smooth movement
    useEffect(() => {
        let animId = null
        let lastTime = performance.now()

        const animate = () => {
            const now = performance.now()
            const dt = Math.min((now - lastTime) / 1000, 0.05) // Cap dt
            lastTime = now

            // Calculate speed
            const dx = targetPos.current.x - currentPos.current.x
            const dy = targetPos.current.y - currentPos.current.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            // ADAPTIVE SMOOTHING:
            // - Fast movement = high responsiveness (0.3)
            // - Slow/stationary = ultra smooth (0.08)
            let smoothing
            if (distance > 50) {
                smoothing = 0.35  // Fast - follow quickly
            } else if (distance > 20) {
                smoothing = 0.20  // Medium
            } else if (distance > 5) {
                smoothing = 0.12  // Slow
            } else {
                smoothing = 0.05  // Nearly still - very stable
            }

            // Apply smoothing with frame-rate independence
            const factor = 1 - Math.pow(1 - smoothing, dt * 60)

            currentPos.current.x += dx * factor
            currentPos.current.y += dy * factor

            // Update cursor directly for maximum performance
            if (cursorRef.current && handDetected) {
                cursorRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px) translate(-50%, -50%)`
            }

            animId = requestAnimationFrame(animate)
        }

        if (isEnabled) {
            animId = requestAnimationFrame(animate)
        }

        return () => {
            if (animId) cancelAnimationFrame(animId)
        }
    }, [isEnabled, handDetected])

    // Distance helper
    const dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)

    // Gesture detection
    const detectGesture = useCallback((lm) => {
        const thumbTip = lm[4], indexTip = lm[8], middleTip = lm[12]
        const indexMcp = lm[5], middleMcp = lm[9], ringMcp = lm[13], pinkyMcp = lm[17]
        const ringTip = lm[16], pinkyTip = lm[20]

        if (dist(thumbTip, indexTip) < 0.05) return 'click'

        const indexUp = indexTip.y < indexMcp.y - 0.03
        const middleUp = middleTip.y < middleMcp.y - 0.03
        const ringUp = ringTip.y < ringMcp.y - 0.03
        const pinkyUp = pinkyTip.y < pinkyMcp.y - 0.03

        if (!indexUp && !middleUp && !ringUp && !pinkyUp) return 'fist'
        if (indexUp && !middleUp) return 'point'
        return 'open'
    }, [])

    // Process hand tracking results
    const processResults = useCallback((results) => {
        // FPS counter
        frameCountRef.current++
        const now = performance.now()
        if (now - lastFrameTimeRef.current >= 1000) {
            setFps(frameCountRef.current)
            frameCountRef.current = 0
            lastFrameTimeRef.current = now
        }

        if (results.multiHandLandmarks?.length > 0) {
            setHandDetected(true)
            const lm = results.multiHandLandmarks[0]

            // Use index fingertip
            const tip = lm[8]

            // Convert to screen coordinates (mirrored for natural interaction)
            const rawX = (1 - tip.x) * window.innerWidth
            const rawY = tip.y * window.innerHeight

            // Simple outlier rejection - ignore jumps > 200px
            const jumpDist = Math.sqrt(
                (rawX - lastRawPos.current.x) ** 2 +
                (rawY - lastRawPos.current.y) ** 2
            )

            if (jumpDist < 200 || lastRawPos.current.x === 0) {
                // Set target position - animation loop will smooth it
                targetPos.current.x = rawX
                targetPos.current.y = rawY
            }

            lastRawPos.current = { x: rawX, y: rawY }

            // Gesture detection
            const g = detectGesture(lm)
            setGesture(g)

            // Click handling
            if (g === 'click' && now - lastClickRef.current > 350) {
                lastClickRef.current = now
                const el = document.elementFromPoint(currentPos.current.x, currentPos.current.y)
                if (el && !el.closest('.hand-controller')) {
                    el.click()
                    el.classList.add('hand-click-effect')
                    setTimeout(() => el.classList.remove('hand-click-effect'), 300)
                }
            }

            // Scroll handling with fist gesture - SMOOTH SCROLL
            if (g === 'fist') {
                if (lastScrollY.current === null) {
                    lastScrollY.current = rawY
                    isScrolling.current = true
                } else {
                    const deltaY = rawY - lastScrollY.current
                    // Only scroll if delta is significant (reduces jitter)
                    if (Math.abs(deltaY) > 2) {
                        // Smooth scroll with easing
                        const scrollAmount = deltaY * 2.5
                        window.scrollBy({
                            top: scrollAmount,
                            behavior: 'smooth'
                        })
                        // Update reference more gradually for smoothness
                        lastScrollY.current = lastScrollY.current + (deltaY * 0.5)
                    }
                }
            } else {
                // Reset scroll tracking when not in fist gesture
                lastScrollY.current = null
                isScrolling.current = false
            }
        } else {
            setHandDetected(false)
            setGesture('none')
            lastScrollY.current = null
            isScrolling.current = false
        }
    }, [detectGesture])

    // Initialize MediaPipe
    const init = useCallback(async () => {
        setIsLoading(true)
        try {
            if (!window.Hands) {
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js')
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
            }

            handsRef.current = new window.Hands({
                locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
            })

            handsRef.current.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.8,
                minTrackingConfidence: 0.8
            })

            handsRef.current.onResults(processResults)

            if (videoRef.current) {
                cameraRef.current = new window.Camera(videoRef.current, {
                    onFrame: async () => {
                        if (handsRef.current) {
                            await handsRef.current.send({ image: videoRef.current })
                        }
                    },
                    width: 640,
                    height: 480
                })
                await cameraRef.current.start()
            }

            setIsLoading(false)
        } catch (e) {
            console.error('Init failed:', e)
            setIsLoading(false)
        }
    }, [processResults])

    const loadScript = src => new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) return res()
        const s = document.createElement('script')
        s.src = src
        s.onload = res
        s.onerror = rej
        document.head.appendChild(s)
    })

    const toggle = async () => {
        if (isEnabled) {
            cameraRef.current?.stop()
            setIsEnabled(false)
            setHandDetected(false)
            lastRawPos.current = { x: 0, y: 0 }
        } else {
            // Check usage limit
            const usage = usageLimitService.canUse('handTracking')
            if (!usage.allowed) {
                if (usage.reason === 'bonus_needed') {
                    setPromptType('follow')
                } else {
                    setPromptType('upgrade')
                }
                setShowUpgrade(true)
                return
            }

            // Record usage
            usageLimitService.recordUse('handTracking')
            setRemainingUses(usageLimitService.getRemaining('handTracking'))

            setIsEnabled(true)
            lastRawPos.current = { x: 0, y: 0 }
            await init()
        }
    }

    useEffect(() => () => cameraRef.current?.stop(), [])

    return (
        <div className="hand-controller">
            <button
                className={`hand-toggle-btn ${isEnabled ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
                onClick={toggle}
                style={{ position: 'relative' }}
            >
                {isLoading ? <span className="loading-spinner" /> : '🖐️'}
                {!usageLimitService.isPro() && remainingUses <= 10 && (
                    <UsageBadge remaining={remainingUses} />
                )}
            </button>

            <video ref={videoRef} className="hand-video" autoPlay playsInline />

            {isEnabled && (
                <>
                    <div className="camera-widget">
                        <div className="camera-header">
                            <span className={`camera-dot ${handDetected ? 'active' : ''}`} />
                            <span>Hand Tracking</span>
                            <span className="fps-counter">{fps} FPS</span>
                        </div>
                        <video
                            ref={el => el && videoRef.current && (el.srcObject = videoRef.current.srcObject)}
                            className="camera-preview" autoPlay playsInline muted
                        />
                        {!handDetected && <div className="no-hand-overlay">👋 Show hand</div>}
                    </div>

                    {handDetected && (
                        <div
                            ref={cursorRef}
                            className={`hand-cursor ${gesture}`}
                            style={{ left: 0, top: 0 }}
                        >
                            <div className="cursor-glow" />
                            <div className="cursor-core" />
                            <div className="cursor-ring" />
                        </div>
                    )}

                    <div className="gesture-indicator">
                        {gesture === 'point' && '👆 Point'}
                        {gesture === 'click' && '🤏 Click!'}
                        {gesture === 'fist' && '✊ Fist'}
                        {gesture === 'open' && '🖐️ Open'}
                    </div>
                </>
            )}

            {showUpgrade && (
                <UpgradePrompt
                    feature="handTracking"
                    usedCount={promptType === 'follow' ? 10 : 15}
                    type={promptType}
                    onFollow={() => {
                        usageLimitService.claimBonus()
                        setShowUpgrade(false)
                        setRemainingUses(usageLimitService.getRemaining('handTracking'))
                    }}
                    onClose={() => setShowUpgrade(false)}
                />
            )}
        </div>
    )
}

export default HandController
