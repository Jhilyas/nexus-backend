import './FeaturesSection.css'

const translations = {
    fr: {
        badge: 'Fonctionnalités',
        title: 'Tout ce dont vous avez besoin',
        subtitle: 'pour tracer votre avenir',
        description: 'Une plateforme complète qui combine intelligence artificielle, données exhaustives et accompagnement personnalisé.',
        features: [
            {
                icon: '🔮',
                title: "L'Oracle IA",
                description: 'Un moteur d\'orientation intelligent qui comprend votre potentiel avant même que vous le réalisiez.',
                tags: ['IA Avancée', 'Prédictif']
            },
            {
                icon: '🧠',
                title: 'SAGE - Mentor Personnel',
                description: 'Votre guide IA disponible 24/7, qui évolue avec vous et se souvient de tout.',
                tags: ['Conversationnel', 'Adaptatif']
            },
            {
                icon: '⏱️',
                title: 'Simulateur Timeline',
                description: 'Visualisez votre futur à 5, 10, 20 ans selon chaque choix que vous faites.',
                tags: ['Simulation', 'Visualisation']
            },
            {
                icon: '🎯',
                title: 'Matrice de Connaissances',
                description: 'Accédez à toutes les écoles, formations, carrières et opportunités en un seul endroit.',
                tags: ['500+ Écoles', '10K+ Carrières']
            },
            {
                icon: '🚀',
                title: 'Préparation aux Examens',
                description: 'Plans personnalisés, simulation d\'entretiens et conditionnement psychologique.',
                tags: ['Concours', 'Interviews']
            },
            {
                icon: '📊',
                title: 'Tableau de Bord Command Center',
                description: 'Suivez votre progression comme un pilote de vaisseau spatial.',
                tags: ['Temps réel', 'Alertes']
            }
        ]
    },
    ar: {
        badge: 'الميزات',
        title: 'كل ما تحتاجه',
        subtitle: 'لرسم مستقبلك',
        description: 'منصة شاملة تجمع بين الذكاء الاصطناعي والبيانات الشاملة والمرافقة الشخصية.',
        features: [
            {
                icon: '🔮',
                title: 'العرّاف الذكي',
                description: 'محرك توجيه ذكي يفهم إمكانياتك قبل أن تدركها بنفسك.',
                tags: ['ذكاء متقدم', 'تنبؤي']
            },
            {
                icon: '🧠',
                title: 'SAGE - مرشدك الشخصي',
                description: 'مرشدك الذكي متاح 24/7، يتطور معك ويتذكر كل شيء.',
                tags: ['تحادثي', 'تكيفي']
            },
            {
                icon: '⏱️',
                title: 'محاكي الجدول الزمني',
                description: 'تصور مستقبلك في 5، 10، 20 سنة حسب كل اختيار تتخذه.',
                tags: ['محاكاة', 'تصور']
            },
            {
                icon: '🎯',
                title: 'مصفوفة المعرفة',
                description: 'الوصول إلى جميع المدارس والتكوينات والمهن والفرص في مكان واحد.',
                tags: ['500+ مدرسة', '10K+ مهنة']
            },
            {
                icon: '🚀',
                title: 'التحضير للامتحانات',
                description: 'خطط مخصصة ومحاكاة للمقابلات والتهيئة النفسية.',
                tags: ['مباريات', 'مقابلات']
            },
            {
                icon: '📊',
                title: 'لوحة التحكم المركزية',
                description: 'تتبع تقدمك كطيار مركبة فضائية.',
                tags: ['لحظي', 'تنبيهات']
            }
        ]
    },
    en: {
        badge: 'Features',
        title: 'Everything you need',
        subtitle: 'to chart your future',
        description: 'A complete platform combining artificial intelligence, comprehensive data, and personalized guidance.',
        features: [
            {
                icon: '🔮',
                title: 'The AI Oracle',
                description: 'An intelligent orientation engine that understands your potential before you realize it yourself.',
                tags: ['Advanced AI', 'Predictive']
            },
            {
                icon: '🧠',
                title: 'SAGE - Personal Mentor',
                description: 'Your AI guide available 24/7, evolving with you and remembering everything.',
                tags: ['Conversational', 'Adaptive']
            },
            {
                icon: '⏱️',
                title: 'Timeline Simulator',
                description: 'Visualize your future at 5, 10, 20 years based on each choice you make.',
                tags: ['Simulation', 'Visualization']
            },
            {
                icon: '🎯',
                title: 'Knowledge Matrix',
                description: 'Access all schools, programs, careers, and opportunities in one place.',
                tags: ['500+ Schools', '10K+ Careers']
            },
            {
                icon: '🚀',
                title: 'Exam Preparation',
                description: 'Personalized plans, interview simulation, and psychological conditioning.',
                tags: ['Competitions', 'Interviews']
            },
            {
                icon: '📊',
                title: 'Command Center Dashboard',
                description: 'Track your progress like a spaceship pilot.',
                tags: ['Real-time', 'Alerts']
            }
        ]
    }
}

const FeaturesSection = ({ language = 'fr' }) => {
    const t = translations[language]
    const isRTL = language === 'ar'

    return (
        <section className={`features-section section ${isRTL ? 'rtl' : ''}`}>
            <div className="container">
                {/* Header */}
                <div className="features-header">
                    <span className="section-badge">{t.badge}</span>
                    <h2 className="features-title">
                        {t.title} <br />
                        <span className="text-gradient">{t.subtitle}</span>
                    </h2>
                    <p className="features-description">{t.description}</p>
                </div>

                {/* Features Grid */}
                <div className="features-grid">
                    {t.features.map((feature, index) => (
                        <div
                            key={index}
                            className="feature-card glass-card"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="feature-icon-wrapper">
                                <span className="feature-icon">{feature.icon}</span>
                                <div className="feature-icon-glow"></div>
                            </div>

                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>

                            <div className="feature-tags">
                                {feature.tags.map((tag, tagIndex) => (
                                    <span key={tagIndex} className="feature-tag">{tag}</span>
                                ))}
                            </div>

                            <div className="feature-hover-effect"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Decoration */}
            <div className="features-bg-decoration">
                <div className="bg-line bg-line-1"></div>
                <div className="bg-line bg-line-2"></div>
                <div className="bg-line bg-line-3"></div>
            </div>
        </section>
    )
}

export default FeaturesSection
