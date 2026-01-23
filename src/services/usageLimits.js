// ═══════════════════════════════════════════════════════════════
// USAGE LIMIT SERVICE
// 10 free uses per feature
// +5 BONUS uses if they follow on Instagram
// Total 15 free uses, then prompt to upgrade
// ═══════════════════════════════════════════════════════════════

const USAGE_LIMITS = {
    initial: 10,
    bonus: 5, // Extra uses after following
    total: 15
}

const STORAGE_KEY = 'nexus_usage_counts'

class UsageLimitService {
    constructor() {
        this.state = this.loadState()
    }

    loadState() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                return JSON.parse(stored)
            }
        } catch (e) {
            console.error('Failed to load usage state:', e)
        }
        return {
            counts: {
                handTracking: 0,
                aiVoice: 0,
                aiChat: 0
            },
            instagramFollowed: false
        }
    }

    saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
        } catch (e) {
            console.error('Failed to save usage state:', e)
        }
    }

    // Check if a feature can be used
    // Returns: { allowed: boolean, reason: 'limit' | 'bonus_needed' | null }
    canUse(feature) {
        // Check if user has Pro subscription
        if (this.isPro()) {
            return { allowed: true, remaining: Infinity, limit: Infinity }
        }

        const count = this.state.counts[feature] || 0
        const isFollowed = this.state.instagramFollowed

        // Phase 1: Initial 10 uses
        if (count < USAGE_LIMITS.initial) {
            return {
                allowed: true,
                remaining: USAGE_LIMITS.initial - count,
                limit: USAGE_LIMITS.initial,
                phase: 'initial'
            }
        }

        // Phase 2: Bonus Block (Used 10, hasn't followed yet)
        if (!isFollowed) {
            return {
                allowed: false,
                reason: 'bonus_needed',
                remaining: 0,
                limit: USAGE_LIMITS.initial,
                phase: 'bonus_locked'
            }
        }

        // Phase 3: Bonus Uses (Followed, using extra 5)
        if (count < USAGE_LIMITS.total) {
            return {
                allowed: true,
                remaining: USAGE_LIMITS.total - count,
                limit: USAGE_LIMITS.total,
                phase: 'bonus'
            }
        }

        // Phase 4: Exhausted (Used all 15)
        return {
            allowed: false,
            reason: 'upgrade_needed',
            remaining: 0,
            limit: USAGE_LIMITS.total,
            phase: 'exhausted'
        }
    }

    // Record a use of a feature
    recordUse(feature) {
        if (this.isPro()) return true

        const status = this.canUse(feature)
        if (!status.allowed) return false

        this.state.counts[feature] = (this.state.counts[feature] || 0) + 1
        this.saveState()
        return true
    }

    // User claimed the bonus (clicked follow)
    claimBonus() {
        this.state.instagramFollowed = true
        this.saveState()
    }

    // Check if user has any paid subscription
    isPro() {
        const plan = this.getPlan();
        // All paid plans count as "Pro" for basic unlimited access
        return ['pro', 'elite', 'godmode'].includes(plan);
    }

    // Get specific plan ID
    getPlan() {
        try {
            const user = localStorage.getItem('nexus_user');
            if (user) {
                const parsed = JSON.parse(user);
                return parsed.subscription || 'free';
            }
        } catch (e) {
            console.error('Failed to check plan:', e);
        }
        return 'free';
    }

    // Check specific feature access
    hasFeature(featureId) {
        const plan = this.getPlan();

        // Feature hierarchy
        if (plan === 'godmode') return true; // Lifetime has everything

        if (plan === 'elite') {
            // Elite has everything except Lifetime specific perks (founder badge, etc)
            return true;
        }

        if (plan === 'pro') {
            // Pro excludes human mentor, vip events, etc
            const eliteFeatures = ['humanMentor', 'vipEvents', 'aiInterview', 'certificate'];
            return !eliteFeatures.includes(featureId);
        }

        // Free plan
        return false;
    }

    // Get plan display details
    getPlanDetails() {
        const plan = this.getPlan();
        const details = {
            free: { label: 'Découverte', badge: '🌱', color: 'bg-slate-500' },
            pro: { label: 'Pro', badge: '🚀', color: 'bg-blue-600 gold-glow' },
            elite: { label: 'Elite', badge: '⚡', color: 'bg-purple-600 elite-glow' },
            godmode: { label: 'Lifetime', badge: '💎', color: 'bg-gradient-to-r from-cyan-400 to-purple-600 diamond-glow' }
        };
        return details[plan] || details.free;
    }

    // Get remaining uses for a feature
    getRemaining(feature) {
        return this.canUse(feature).remaining
    }

    // Reset all counts (for testing or when user upgrades)
    reset() {
        this.state.counts = {
            handTracking: 0,
            aiVoice: 0,
            aiChat: 0
        }
        this.saveState()
    }

    // Get usage stats for display
    getStats() {
        return {
            handTracking: this.canUse('handTracking'),
            aiVoice: this.canUse('aiVoice'),
            aiChat: this.canUse('aiChat'),
            isPro: this.isPro(),
            plan: this.getPlan(),
            instagramFollowed: this.state.instagramFollowed
        }
    }
}

export const usageLimitService = new UsageLimitService()
export default usageLimitService
