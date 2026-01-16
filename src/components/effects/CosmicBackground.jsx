import { useEffect, useRef } from 'react'
import './CosmicBackground.css'

const CosmicBackground = () => {
    const canvasRef = useRef(null)
    const particlesRef = useRef([])
    const mouseRef = useRef({ x: 0, y: 0 })
    const animationRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let width = window.innerWidth
        let height = window.innerHeight

        const resize = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height
            initParticles()
        }

        const initParticles = () => {
            const particleCount = Math.floor((width * height) / 15000)
            particlesRef.current = []

            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.5 + 0.2,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.02 + 0.01,
                    color: Math.random() > 0.7
                        ? `rgba(102, 126, 234, ${Math.random() * 0.5 + 0.3})`
                        : `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})`
                })
            }
        }

        const drawParticle = (particle) => {
            particle.pulse += particle.pulseSpeed
            const pulseFactor = Math.sin(particle.pulse) * 0.3 + 0.7

            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size * pulseFactor, 0, Math.PI * 2)
            ctx.fillStyle = particle.color
            ctx.fill()

            // Glow effect for some particles
            if (particle.size > 1.5) {
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 3
                )
                gradient.addColorStop(0, 'rgba(102, 126, 234, 0.15)')
                gradient.addColorStop(1, 'transparent')
                ctx.fillStyle = gradient
                ctx.fill()
            }
        }

        const updateParticle = (particle) => {
            particle.x += particle.speedX
            particle.y += particle.speedY

            // Mouse interaction
            const dx = mouseRef.current.x - particle.x
            const dy = mouseRef.current.y - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 150) {
                const force = (150 - distance) / 150
                particle.x -= (dx / distance) * force * 0.5
                particle.y -= (dy / distance) * force * 0.5
            }

            // Wrap around edges
            if (particle.x < 0) particle.x = width
            if (particle.x > width) particle.x = 0
            if (particle.y < 0) particle.y = height
            if (particle.y > height) particle.y = 0
        }

        const drawConnections = () => {
            const particles = particlesRef.current
            const maxDistance = 120

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.15
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height)

            // Draw aurora effect
            const gradient = ctx.createRadialGradient(
                width * 0.2, height * 0.2, 0,
                width * 0.2, height * 0.2, width * 0.6
            )
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.08)')
            gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.04)')
            gradient.addColorStop(1, 'transparent')
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, width, height)

            const gradient2 = ctx.createRadialGradient(
                width * 0.8, height * 0.8, 0,
                width * 0.8, height * 0.8, width * 0.5
            )
            gradient2.addColorStop(0, 'rgba(118, 75, 162, 0.06)')
            gradient2.addColorStop(0.5, 'rgba(102, 126, 234, 0.03)')
            gradient2.addColorStop(1, 'transparent')
            ctx.fillStyle = gradient2
            ctx.fillRect(0, 0, width, height)

            // Draw connections
            drawConnections()

            // Update and draw particles
            particlesRef.current.forEach(particle => {
                updateParticle(particle)
                drawParticle(particle)
            })

            animationRef.current = requestAnimationFrame(animate)
        }

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }

        resize()
        animate()

        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationRef.current)
        }
    }, [])

    return (
        <div className="cosmic-background">
            <canvas ref={canvasRef} className="cosmic-canvas" />
            <div className="cosmic-overlay" />
        </div>
    )
}

export default CosmicBackground
