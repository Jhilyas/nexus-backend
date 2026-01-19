import { useState, useEffect } from 'react'
import './Dashboard.css'

const translations = {
    fr: {
        welcome: 'Bienvenue,',
        subtitle: 'Votre centre de commande personnel',
        progress: 'Progression Globale',
        nextGoal: 'Prochain Objectif',
        aiInsight: 'Insight IA',
        deadlines: 'Deadlines Approchantes',
        quickActions: 'Actions Rapides',
        recentActivity: 'Activité Récente',
        mentor: 'Parler à SAGE',
        simulate: 'Simuler Timeline',
        explore: 'Explorer Parcours',
        settings: 'Paramètres',
        days: 'jours',
        viewAll: 'Voir tout'
    },
    ar: {
        welcome: 'مرحبًا،',
        subtitle: 'مركز قيادتك الشخصي',
        progress: 'التقدم العام',
        nextGoal: 'الهدف التالي',
        aiInsight: 'رؤية الذكاء الاصطناعي',
        deadlines: 'المواعيد النهائية القادمة',
        quickActions: 'إجراءات سريعة',
        recentActivity: 'النشاط الأخير',
        mentor: 'تحدث مع SAGE',
        simulate: 'محاكاة الجدول الزمني',
        explore: 'استكشاف المسارات',
        settings: 'الإعدادات',
        days: 'أيام',
        viewAll: 'عرض الكل'
    },
    en: {
        welcome: 'Welcome,',
        subtitle: 'Your personal command center',
        progress: 'Overall Progress',
        nextGoal: 'Next Goal',
        aiInsight: 'AI Insight',
        deadlines: 'Upcoming Deadlines',
        quickActions: 'Quick Actions',
        recentActivity: 'Recent Activity',
        mentor: 'Talk to SAGE',
        simulate: 'Simulate Timeline',
        explore: 'Explore Paths',
        settings: 'Settings',
        days: 'days',
        viewAll: 'View all'
    }
}

const Dashboard = ({ onToggleMentor, language = 'fr', setCurrentPage }) => {
    const [progress, setProgress] = useState(0)
    const t = translations[language]
    const isRTL = language === 'ar'

    useEffect(() => {
        // Animate progress on mount
        const timer = setTimeout(() => setProgress(67), 500)
        return () => clearTimeout(timer)
    }, [])

    const deadlines = [
        {
            title: 'ENSAM Application',
            date: '20 Jan 2025',
            daysLeft: 4,
            priority: 'high',
            icon: '📋'
        },
        {
            title: 'Scholarship Interview',
            date: '15 Feb 2025',
            daysLeft: 30,
            priority: 'medium',
            icon: '🎙️'
        },
        {
            title: 'ENCG Written Exam',
            date: '01 Mar 2025',
            daysLeft: 44,
            priority: 'low',
            icon: '✏️'
        }
    ]

    const activities = [
        { action: 'Completed Math Quiz', time: '2 hours ago', icon: '✅' },
        { action: 'Explored Engineering paths', time: '5 hours ago', icon: '🔍' },
        { action: 'Talked with SAGE', time: 'Yesterday', icon: '💬' },
        { action: 'Updated profile', time: '2 days ago', icon: '👤' }
    ]

    const quickActions = [
        { label: t.mentor, icon: '🧠', action: onToggleMentor },
        { label: t.simulate, icon: '⏱️', action: () => setCurrentPage && setCurrentPage('timeline') },
        { label: t.explore, icon: '🔮', action: () => setCurrentPage && setCurrentPage('explore') },
        { label: t.settings, icon: '⚙️', action: () => { } }
    ]

    return (
        <div className={`dashboard ${isRTL ? 'rtl' : ''}`}>
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-greeting">
                    <h1 className="greeting-text">
                        {t.welcome} <span className="user-name">Ilyas</span> 👋
                    </h1>
                    <p className="greeting-subtitle">{t.subtitle}</p>
                </div>
                <div className="dashboard-date">
                    <span className="date-day">{new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR', { weekday: 'long' })}</span>
                    <span className="date-full">{new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {/* Progress Card */}
                <div className="stat-card glass-card progress-card">
                    <div className="stat-header">
                        <span className="stat-icon">📈</span>
                        <span className="stat-label">{t.progress}</span>
                    </div>
                    <div className="progress-ring-container">
                        <svg className="progress-ring" viewBox="0 0 120 120">
                            <circle
                                className="progress-ring-bg"
                                cx="60" cy="60" r="52"
                                fill="none"
                                strokeWidth="8"
                            />
                            <circle
                                className="progress-ring-fill"
                                cx="60" cy="60" r="52"
                                fill="none"
                                strokeWidth="8"
                                strokeDasharray={`${progress * 3.27} 327`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="progress-value">{progress}%</div>
                    </div>
                </div>

                {/* Next Goal Card */}
                <div className="stat-card glass-card goal-card">
                    <div className="stat-header">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-label">{t.nextGoal}</span>
                    </div>
                    <div className="goal-content">
                        <h3 className="goal-title">ENCG Application</h3>
                        <div className="goal-countdown">
                            <div className="countdown-number">23</div>
                            <div className="countdown-label">{t.days}</div>
                        </div>
                    </div>
                    <div className="goal-progress">
                        <div className="progress">
                            <div className="progress-bar" style={{ width: '75%' }}></div>
                        </div>
                        <span className="goal-percent">75%</span>
                    </div>
                </div>

                {/* AI Insight Card */}
                <div className="stat-card glass-card insight-card">
                    <div className="stat-header">
                        <span className="stat-icon">💡</span>
                        <span className="stat-label">{t.aiInsight}</span>
                    </div>
                    <div className="insight-content">
                        <p className="insight-text">
                            "Focus on Math preparation this week. Your performance pattern shows stronger results after consistent practice sessions."
                        </p>
                        <button className="insight-action btn btn-sm btn-ghost">
                            Learn more →
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Deadlines */}
                <div className="content-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="title-icon">🗓️</span>
                            {t.deadlines}
                        </h2>
                        <button className="btn btn-ghost btn-sm">{t.viewAll}</button>
                    </div>

                    <div className="deadlines-list">
                        {deadlines.map((deadline, index) => (
                            <div
                                key={index}
                                className={`deadline-item glass priority-${deadline.priority}`}
                            >
                                <span className="deadline-icon">{deadline.icon}</span>
                                <div className="deadline-info">
                                    <span className="deadline-title">{deadline.title}</span>
                                    <span className="deadline-date">{deadline.date}</span>
                                </div>
                                <div className={`deadline-days priority-${deadline.priority}`}>
                                    <span className="days-number">{deadline.daysLeft}</span>
                                    <span className="days-label">{t.days}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="content-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="title-icon">⚡</span>
                            {t.quickActions}
                        </h2>
                    </div>

                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                className="quick-action glass"
                                onClick={action.action}
                            >
                                <span className="action-icon">{action.icon}</span>
                                <span className="action-label">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="content-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="title-icon">📋</span>
                            {t.recentActivity}
                        </h2>
                        <button className="btn btn-ghost btn-sm">{t.viewAll}</button>
                    </div>

                    <div className="activity-list">
                        {activities.map((activity, index) => (
                            <div key={index} className="activity-item glass">
                                <span className="activity-icon">{activity.icon}</span>
                                <div className="activity-info">
                                    <span className="activity-action">{activity.action}</span>
                                    <span className="activity-time">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Mentor Button */}
            <button className="mentor-fab btn-primary" onClick={onToggleMentor}>
                <span>🧠</span>
                <div className="fab-pulse"></div>
            </button>
        </div>
    )
}

export default Dashboard
