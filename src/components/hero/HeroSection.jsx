import { useState, useEffect } from 'react'
import './HeroSection.css'

const translations = {
    fr: {
        tagline: 'Là où chaque avenir commence.',
        title1: 'Découvrez votre',
        title2: 'destinée',
        title3: 'éducative',
        description: "L'intelligence artificielle qui comprend votre potentiel, prédit vos opportunités et guide votre parcours vers le succès.",
        cta: 'Commencer mon voyage',
        secondary: 'Explorer les parcours',
        stats: {
            schools: 'Écoles',
            careers: 'Carrières',
            students: 'Étudiants',
            success: 'Taux de réussite'
        }
    },
    ar: {
        tagline: 'حيث يبدأ كل مستقبل.',
        title1: 'اكتشف',
        title2: 'مصيرك',
        title3: 'التعليمي',
        description: 'الذكاء الاصطناعي الذي يفهم إمكانياتك، يتنبأ بفرصك ويوجه مسارك نحو النجاح.',
        cta: 'ابدأ رحلتي',
        secondary: 'استكشاف المسارات',
        stats: {
            schools: 'مدرسة',
            careers: 'مهنة',
            students: 'طالب',
            success: 'نسبة النجاح'
        }
    },
    en: {
        tagline: 'Where every future begins.',
        title1: 'Discover your',
        title2: 'educational',
        title3: 'destiny',
        description: 'AI that understands your potential, predicts your opportunities, and guides your path to success.',
        cta: 'Start my journey',
        secondary: 'Explore paths',
        stats: {
            schools: 'Schools',
            careers: 'Careers',
            students: 'Students',
            success: 'Success rate'
        }
    }
}

const HeroSection = ({ onExplore, onLogin, language = 'fr' }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [currentWord, setCurrentWord] = useState(0)
    const t = translations[language]
    const isRTL = language === 'ar'

    const words = [t.title2, 'المستقبل', 'future', 'parcours', 'مسار', 'path']

    useEffect(() => {
        setIsVisible(true)
        const interval = setInterval(() => {
            setCurrentWord(prev => (prev + 1) % 3)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const stats = [
        { value: '500+', label: t.stats.schools, icon: '🎓' },
        { value: '10K+', label: t.stats.careers, icon: '💼' },
        { value: '50K+', label: t.stats.students, icon: '👥' },
        { value: '94%', label: t.stats.success, icon: '📈' }
    ]

    return (
        <section className={`hero ${isVisible ? 'visible' : ''} ${isRTL ? 'rtl' : ''}`}>
            <div className="hero-container">
                {/* Floating Orbs */}
                <div className="hero-orbs">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>

                {/* Main Content */}
                <div className="hero-content">
                    {/* Badge */}
                    <div className="hero-badge animate-fade-in-down">
                        <span className="badge-dot"></span>
                        <span>{t.tagline}</span>
                    </div>

                    {/* Title */}
                    <h1 className="hero-title">
                        <span className="title-line animate-fade-in-up delay-100">
                            {t.title1}
                        </span>
                        <span className="title-line title-gradient animate-fade-in-up delay-200" style={{ textAlign: 'center', display: 'block' }}>
                            Plateforme
                        </span>
                        <span className="title-line animate-fade-in-up delay-300">
                            {t.title3}
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="hero-description animate-fade-in-up delay-400">
                        {t.description}
                    </p>

                    {/* CTAs */}
                    <div className="hero-ctas animate-fade-in-up delay-500">
                        <button className="btn btn-primary btn-lg hero-cta-primary" onClick={onLogin}>
                            <span>{t.cta}</span>
                            <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={onExplore}>
                            {t.secondary}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="hero-stats animate-fade-in-up delay-500">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item glass">
                            <span className="stat-icon">{stat.icon}</span>
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Scroll Indicator */}
                <div className="scroll-indicator animate-fade-in delay-500">
                    <div className="scroll-line">
                        <div className="scroll-dot"></div>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="hero-decoration">
                <div className="deco-ring deco-ring-1"></div>
                <div className="deco-ring deco-ring-2"></div>
                <div className="deco-ring deco-ring-3"></div>
            </div>
        </section>
    )
}

export default HeroSection
