import { useState } from 'react'
import './PricingSection.css'

const translations = {
    fr: {
        badge: 'Tarification',
        title: 'Choisissez votre',
        titleHighlight: 'niveau',
        description: 'Des plans adaptés à chaque ambition. Commencez gratuitement et évoluez selon vos besoins.',
        monthly: 'Mensuel',
        yearly: 'Annuel',
        save: 'Économisez 20%',
        popular: 'Populaire',
        perMonth: '/mois',
        perYear: '/an',
        getStarted: 'Commencer',
        currentPlan: 'Plan actuel',
        plans: [
            {
                name: 'Free',
                price: 0,
                yearlyPrice: 0,
                description: 'Pour découvrir la plateforme',
                features: [
                    'Accès au questionnaire d\'orientation',
                    '3 conversations avec SAGE',
                    'Exploration limitée des parcours',
                    'Actualités et articles'
                ],
                limitations: [
                    'Simulations Timeline limitées',
                    'Pas de préparation aux examens'
                ],
                cta: 'Commencer gratuitement',
                highlighted: false
            },
            {
                name: 'Pro',
                price: 99,
                yearlyPrice: 948,
                description: 'Pour les étudiants sérieux',
                features: [
                    'Tout ce qui est inclus dans Free',
                    'Conversations illimitées avec SAGE',
                    'Simulations Timeline complètes',
                    'Préparation aux examens',
                    'Alertes deadlines personnalisées',
                    'Support prioritaire'
                ],
                limitations: [],
                cta: 'Devenir Pro',
                highlighted: true
            },
            {
                name: 'Elite',
                price: 299,
                yearlyPrice: 2868,
                description: 'Pour les ambitieux',
                features: [
                    'Tout ce qui est inclus dans Pro',
                    'Mentorat humain 1-on-1',
                    'Accès aux événements VIP',
                    'Contenu exclusif avancé',
                    'Simulation d\'entretiens IA',
                    'Coaching carrière'
                ],
                limitations: [],
                cta: 'Rejoindre l\'Elite',
                highlighted: false
            },
            {
                name: 'God Mode',
                price: 999,
                yearlyPrice: 9588,
                description: 'Pour ceux qui veulent tout',
                features: [
                    'Tout ce qui est inclus dans Elite',
                    'Accès à vie',
                    'Compte famille (5 membres)',
                    'Accès anticipé aux nouvelles fonctionnalités',
                    'Ligne directe avec les fondateurs',
                    'Badge influenceur NEXUS'
                ],
                limitations: [],
                cta: 'Activer God Mode',
                highlighted: false,
                special: true
            }
        ]
    },
    en: {
        badge: 'Pricing',
        title: 'Choose your',
        titleHighlight: 'level',
        description: 'Plans adapted to every ambition. Start free and evolve according to your needs.',
        monthly: 'Monthly',
        yearly: 'Yearly',
        save: 'Save 20%',
        popular: 'Popular',
        perMonth: '/mo',
        perYear: '/yr',
        getStarted: 'Get Started',
        currentPlan: 'Current Plan',
        plans: [
            {
                name: 'Free',
                price: 0,
                yearlyPrice: 0,
                description: 'To discover the platform',
                features: [
                    'Access to orientation quiz',
                    '3 conversations with SAGE',
                    'Limited path exploration',
                    'News and articles'
                ],
                limitations: [
                    'Limited Timeline simulations',
                    'No exam preparation'
                ],
                cta: 'Start for free',
                highlighted: false
            },
            {
                name: 'Pro',
                price: 99,
                yearlyPrice: 948,
                description: 'For serious students',
                features: [
                    'Everything in Free',
                    'Unlimited SAGE conversations',
                    'Full Timeline simulations',
                    'Exam preparation',
                    'Personalized deadline alerts',
                    'Priority support'
                ],
                limitations: [],
                cta: 'Go Pro',
                highlighted: true
            },
            {
                name: 'Elite',
                price: 299,
                yearlyPrice: 2868,
                description: 'For the ambitious',
                features: [
                    'Everything in Pro',
                    '1-on-1 human mentorship',
                    'Access to VIP events',
                    'Exclusive advanced content',
                    'AI interview simulation',
                    'Career coaching'
                ],
                limitations: [],
                cta: 'Join Elite',
                highlighted: false
            },
            {
                name: 'God Mode',
                price: 999,
                yearlyPrice: 9588,
                description: 'For those who want it all',
                features: [
                    'Everything in Elite',
                    'Lifetime access',
                    'Family account (5 members)',
                    'Early access to new features',
                    'Direct line to founders',
                    'NEXUS influencer badge'
                ],
                limitations: [],
                cta: 'Activate God Mode',
                highlighted: false,
                special: true
            }
        ]
    },
    ar: {
        badge: 'التسعير',
        title: 'اختر',
        titleHighlight: 'مستواك',
        description: 'خطط مناسبة لكل طموح. ابدأ مجانًا وتطور حسب احتياجاتك.',
        monthly: 'شهري',
        yearly: 'سنوي',
        save: 'وفر 20%',
        popular: 'الأكثر شعبية',
        perMonth: '/شهر',
        perYear: '/سنة',
        getStarted: 'ابدأ',
        currentPlan: 'الخطة الحالية',
        plans: [
            {
                name: 'مجاني',
                price: 0,
                yearlyPrice: 0,
                description: 'لاكتشاف المنصة',
                features: [
                    'الوصول لاستبيان التوجيه',
                    '3 محادثات مع SAGE',
                    'استكشاف محدود للمسارات',
                    'أخبار ومقالات'
                ],
                limitations: [
                    'محاكاة Timeline محدودة',
                    'لا تحضير للامتحانات'
                ],
                cta: 'ابدأ مجانًا',
                highlighted: false
            },
            {
                name: 'Pro',
                price: 99,
                yearlyPrice: 948,
                description: 'للطلاب الجادين',
                features: [
                    'كل ما في المجاني',
                    'محادثات غير محدودة مع SAGE',
                    'محاكاة Timeline كاملة',
                    'تحضير للامتحانات',
                    'تنبيهات المواعيد',
                    'دعم ذو أولوية'
                ],
                limitations: [],
                cta: 'كن Pro',
                highlighted: true
            },
            {
                name: 'Elite',
                price: 299,
                yearlyPrice: 2868,
                description: 'للطموحين',
                features: [
                    'كل ما في Pro',
                    'إرشاد بشري 1-على-1',
                    'وصول لأحداث VIP',
                    'محتوى حصري متقدم',
                    'محاكاة مقابلات بالذكاء الاصطناعي',
                    'تدريب مهني'
                ],
                limitations: [],
                cta: 'انضم للنخبة',
                highlighted: false
            },
            {
                name: 'God Mode',
                price: 999,
                yearlyPrice: 9588,
                description: 'لمن يريد كل شيء',
                features: [
                    'كل ما في Elite',
                    'وصول مدى الحياة',
                    'حساب عائلي (5 أعضاء)',
                    'وصول مبكر للميزات الجديدة',
                    'خط مباشر مع المؤسسين',
                    'شارة مؤثر NEXUS'
                ],
                limitations: [],
                cta: 'فعّل God Mode',
                highlighted: false,
                special: true
            }
        ]
    }
}

const PricingSection = ({ language = 'fr' }) => {
    const [billingCycle, setBillingCycle] = useState('monthly')
    const t = translations[language]
    const isRTL = language === 'ar'

    return (
        <section className={`pricing-section section ${isRTL ? 'rtl' : ''}`} id="pricing">
            <div className="container">
                {/* Header */}
                <div className="pricing-header">
                    <span className="section-badge">{t.badge}</span>
                    <h2 className="pricing-title">
                        {t.title} <span className="text-gradient">{t.titleHighlight}</span>
                    </h2>
                    <p className="pricing-description">{t.description}</p>

                    {/* Billing Toggle */}
                    <div className="billing-toggle">
                        <button
                            className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                            onClick={() => setBillingCycle('monthly')}
                        >
                            {t.monthly}
                        </button>
                        <button
                            className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
                            onClick={() => setBillingCycle('yearly')}
                        >
                            {t.yearly}
                            <span className="save-badge">{t.save}</span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="plans-grid">
                    {t.plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`plan-card glass-card ${plan.highlighted ? 'highlighted' : ''} ${plan.special ? 'special' : ''}`}
                        >
                            {plan.highlighted && (
                                <div className="popular-badge">{t.popular}</div>
                            )}
                            {plan.special && (
                                <div className="special-glow"></div>
                            )}

                            <div className="plan-header">
                                <h3 className="plan-name">{plan.name}</h3>
                                <p className="plan-description">{plan.description}</p>
                            </div>

                            <div className="plan-price">
                                <span className="price-currency">MAD</span>
                                <span className="price-amount">
                                    {billingCycle === 'monthly' ? plan.price : Math.round(plan.yearlyPrice / 12)}
                                </span>
                                <span className="price-period">
                                    {billingCycle === 'monthly' ? t.perMonth : t.perYear}
                                </span>
                            </div>

                            <ul className="plan-features">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="feature-item included">
                                        <span className="feature-icon">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                                {plan.limitations.map((limitation, limitIndex) => (
                                    <li key={limitIndex} className="feature-item limited">
                                        <span className="feature-icon">✕</span>
                                        <span>{limitation}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`plan-cta btn ${plan.highlighted ? 'btn-primary' : 'btn-secondary'} btn-lg`}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default PricingSection
