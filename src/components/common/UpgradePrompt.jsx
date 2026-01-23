import { useState } from 'react'
import './UpgradePrompt.css'

// ═══════════════════════════════════════════════════════════════
// UPGRADE PROMPT COMPONENT
// Shows when user has exhausted free uses
// ═══════════════════════════════════════════════════════════════

const featureIcons = {
    handTracking: '🖐️',
    aiVoice: '🎙️',
    aiChat: '💬'
}

const featureNames = {
    handTracking: 'Hand Tracking',
    aiVoice: 'AI Voice',
    aiChat: 'AI Chat'
}

const UpgradePrompt = ({
    feature,
    usedCount = 10,
    type = 'upgrade', // 'upgrade' | 'follow'
    onUpgrade,
    onFollow,
    onClose,
    onSkip
}) => {
    const icon = featureIcons[feature] || '✨'
    // Ensure we handle features that might not be in the list gracefully
    const name = featureNames[feature] || 'Cette fonctionnalité'

    const handleAction = () => {
        if (type === 'follow') {
            // Instagram Bonus Flow
            window.open('https://www.instagram.com/imane_badaoui_369/', '_blank')
            if (onFollow) onFollow()
        } else {
            // Upgrade Flow
            if (onUpgrade) {
                onUpgrade()
            } else {
                const pricingSection = document.getElementById('tarifs')
                if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' })
                }
            }
        }
        onClose?.()
    }

    return (
        <div className="upgrade-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
            <div className={`upgrade-modal ${type === 'follow' ? 'follow-mode' : ''}`}>
                <div className="upgrade-icon">{type === 'follow' ? '📸' : icon}</div>

                {type === 'follow' ? (
                    <>
                        <h2 className="upgrade-title">Bonus EXCLUSIF !</h2>
                        <p className="upgrade-subtitle">
                            Vous avez utilisé vos 10 essais gratuits de {name}.
                            <br />
                            <br />
                            <span className="text-secondary">🎁 Envie de +5 essais supplémentaires ?</span>
                            <br />
                            Suivez <strong>Imane Taouss Bdaoui</strong> sur Instagram !
                        </p>
                        <button className="upgrade-btn instagram-btn" onClick={handleAction}>
                            <span className="upgrade-btn-icon">❤️</span>
                            Suivre & Gagner +5 essais
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="upgrade-title">Passez à Pro !</h2>
                        <p className="upgrade-subtitle">
                            Vous avez épuisé vos essais gratuits de {name}.
                            <br />
                            Passez à Pro pour un accès <strong>illimité</strong> !
                        </p>

                        <div className="upgrade-uses">
                            <span className="upgrade-uses-icon">📊</span>
                            <span className="upgrade-uses-text">
                                Utilisations: <span className="upgrade-uses-count">{usedCount}</span>
                            </span>
                        </div>

                        <button className="upgrade-btn" onClick={handleAction}>
                            <span className="upgrade-btn-icon">⚡</span>
                            Devenir Pro
                        </button>
                    </>
                )}

                {onSkip && type !== 'follow' && (
                    <button className="upgrade-skip" onClick={onSkip}>
                        Continuer en mode limité
                    </button>
                )}
            </div>
        </div>
    )
}

// Usage Badge Component - shows remaining uses
export const UsageBadge = ({ remaining, limit = 10 }) => {
    let className = 'usage-badge'

    if (remaining <= 0) {
        className += ' exhausted'
    } else if (remaining <= 3) {
        className += ' warning'
    }

    return (
        <div className={className}>
            {remaining > 0 ? remaining : '0'}
        </div>
    )
}

export default UpgradePrompt
