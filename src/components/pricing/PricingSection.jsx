import { useState, useEffect } from 'react'
import { supabase, db, auth } from '../../services/supabase'
import './PricingSection.css'

const translations = {
    fr: {
        badge: '🎁 1 AN GRATUIT POUR TOUS!',
        title: 'Investissez dans',
        titleHighlight: 'votre avenir',
        description: 'Rejoignez +5,000 étudiants marocains qui ont transformé leur parcours avec NEXUS.',
        monthly: 'Mensuel',
        yearly: 'Annuel',
        save: '-20%',
        popular: '🔥 BEST SELLER',
        perMonth: '/mois',
        perYear: '/an',
        getStarted: 'Commencer',
        currentPlan: '✓ Plan actuel',
        upgrading: 'Activation...',
        loginRequired: 'Connexion requise',
        success: '🎉 Félicitations!',
        guarantee: '✨ Garantie 30 jours satisfait ou remboursé',
        limitedOffer: '🚀 Offre spéciale - Tous les abonnements GRATUITS pendant 1 an!',
        trustedBy: 'Approuvé par les meilleures écoles',
        plans: [
            {
                id: 'free',
                name: 'Découverte',
                price: 0,
                yearlyPrice: 0,
                description: 'Parfait pour explorer',
                icon: '🌱',
                color: 'emerald',
                features: [
                    { text: 'Quiz d\'orientation complet', included: true },
                    { text: '10 conversations NEXUS AI Chat', included: true },
                    { text: '10 sessions NEXUS AI Voice', included: true },
                    { text: 'Exploration des écoles', included: true },
                    { text: 'Actualités et articles', included: true }
                ],
                limitations: [
                    'Timeline basique',
                    'Sans prépa examens'
                ],
                cta: 'Commencer gratuitement',
                highlighted: false
            },
            {
                id: 'pro',
                name: 'Pro',
                price: 79,
                yearlyPrice: 758,
                originalPrice: 99,
                description: 'Pour les étudiants motivés',
                icon: '⚡',
                color: 'blue',
                features: [
                    { text: 'Tout ce qui est dans Découverte', included: true, highlight: true },
                    { text: 'NEXUS AI Chat illimité 24h/24', included: true },
                    { text: 'NEXUS AI Voice illimité', included: true },
                    { text: 'Simulations Timeline complètes', included: true },
                    { text: 'Préparation aux concours', included: true },
                    { text: 'Alertes deadlines personnalisées', included: true },
                    { text: 'Support prioritaire', included: true }
                ],
                limitations: [],
                cta: 'Devenir Pro',
                highlighted: true
            },
            {
                id: 'elite',
                name: 'Elite',
                price: 199,
                yearlyPrice: 1908,
                originalPrice: 299,
                description: 'Pour les ambitieux',
                icon: '👑',
                color: 'purple',
                features: [
                    { text: 'Tout ce qui est dans Pro', included: true, highlight: true },
                    { text: 'Mentorat 1-on-1 (2h/mois)', included: true },
                    { text: 'Accès événements VIP', included: true },
                    { text: 'Simulation entretiens IA', included: true },
                    { text: 'Coaching orientation personnalisé', included: true },
                    { text: 'Certificat NEXUS Elite', included: true }
                ],
                limitations: [],
                cta: 'Rejoindre l\'Elite',
                highlighted: false
            },
            {
                id: 'godmode',
                name: 'Lifetime',
                price: 499,
                yearlyPrice: 499,
                originalPrice: 999,
                description: 'Investissement unique',
                icon: '🔮',
                color: 'gold',
                isLifetime: true,
                features: [
                    { text: 'Tout ce qui est dans Elite', included: true, highlight: true },
                    { text: 'Accès à vie (paiement unique)', included: true },
                    { text: 'Compte famille (5 membres)', included: true },
                    { text: 'Accès anticipé nouvelles fonctionnalités', included: true },
                    { text: 'Masterclasses exclusives', included: true },
                    { text: 'Badge Fondateur NEXUS', included: true }
                ],
                limitations: [],
                cta: 'Accès à vie',
                highlighted: false,
                special: true
            }
        ],
        testimonials: [
            {
                name: 'Sara B.',
                school: 'EMI - Rabat',
                text: 'NEXUS AI m\'a aidé à décrocher l\'EMI. L\'IA m\'a guidé parfaitement!',
                avatar: 'S'
            },
            {
                name: 'Youssef K.',
                school: 'ENCG - Casablanca',
                text: 'Le mentorat Elite a changé ma vie. Je recommande à 100%!',
                avatar: 'Y'
            },
            {
                name: 'Amina R.',
                school: 'UM6P - Ben Guerir',
                text: 'Grâce à NEXUS AI, j\'ai trouvé ma voie en 2 semaines.',
                avatar: 'A'
            }
        ],
        faq: [
            {
                q: 'Puis-je changer de plan à tout moment?',
                a: 'Oui! Vous pouvez upgrader ou downgrader à tout moment. La différence sera calculée au prorata.'
            },
            {
                q: 'Y a-t-il une garantie de remboursement?',
                a: 'Absolument! 30 jours satisfait ou remboursé, sans questions.'
            },
            {
                q: 'Comment fonctionne le mentorat?',
                a: 'Les plans Elite et Lifetime incluent des sessions avec des mentors certifiés (anciens des grandes écoles).'
            },
            {
                q: 'Quels moyens de paiement acceptez-vous?',
                a: 'PayPal, cartes bancaires (Visa, Mastercard), et virements bancaires.'
            }
        ],
        paymentTitle: 'Finaliser l\'abonnement',
        securePayment: '🔒 Paiement sécurisé via PayPal',
        payWithPaypal: 'Payer avec PayPal',
        cancelAnytime: 'Annulez à tout moment'
    },
    en: {
        badge: '🎁 1 YEAR FREE FOR EVERYONE!',
        title: 'Invest in',
        titleHighlight: 'your future',
        description: 'Join +5,000 Moroccan students who transformed their path with NEXUS.',
        monthly: 'Monthly',
        yearly: 'Yearly',
        save: '-20%',
        popular: '🔥 BEST SELLER',
        perMonth: '/mo',
        perYear: '/yr',
        getStarted: 'Get Started',
        currentPlan: '✓ Current Plan',
        upgrading: 'Activating...',
        loginRequired: 'Login required',
        success: '🎉 Congratulations!',
        guarantee: '✨ 30-day money-back guarantee',
        limitedOffer: '🚀 Special offer - All subscriptions FREE for 1 year!',
        trustedBy: 'Trusted by top schools',
        plans: [
            {
                id: 'free',
                name: 'Discovery',
                price: 0,
                yearlyPrice: 0,
                description: 'Perfect to explore',
                icon: '🌱',
                color: 'emerald',
                features: [
                    { text: 'Complete orientation quiz', included: true },
                    { text: '10 NEXUS AI Chat conversations', included: true },
                    { text: '10 NEXUS AI Voice sessions', included: true },
                    { text: 'School exploration', included: true },
                    { text: 'News and articles', included: true }
                ],
                limitations: [
                    'Basic timeline',
                    'No exam prep'
                ],
                cta: 'Start for free',
                highlighted: false
            },
            {
                id: 'pro',
                name: 'Pro',
                price: 79,
                yearlyPrice: 758,
                originalPrice: 99,
                description: 'For motivated students',
                icon: '⚡',
                color: 'blue',
                features: [
                    { text: 'Everything in Discovery', included: true, highlight: true },
                    { text: 'Unlimited NEXUS AI Chat 24/7', included: true },
                    { text: 'Unlimited NEXUS AI Voice', included: true },
                    { text: 'Full Timeline simulations', included: true },
                    { text: 'Exam preparation', included: true },
                    { text: 'Personalized deadline alerts', included: true },
                    { text: 'Priority support', included: true }
                ],
                limitations: [],
                cta: 'Go Pro',
                highlighted: true
            },
            {
                id: 'elite',
                name: 'Elite',
                price: 199,
                yearlyPrice: 1908,
                originalPrice: 299,
                description: 'For the ambitious',
                icon: '👑',
                color: 'purple',
                features: [
                    { text: 'Everything in Pro', included: true, highlight: true },
                    { text: '1-on-1 mentorship (2h/month)', included: true },
                    { text: 'VIP event access', included: true },
                    { text: 'AI interview simulation', included: true },
                    { text: 'Personalized career coaching', included: true },
                    { text: 'NEXUS Elite certificate', included: true }
                ],
                limitations: [],
                cta: 'Join Elite',
                highlighted: false
            },
            {
                id: 'godmode',
                name: 'Lifetime',
                price: 499,
                yearlyPrice: 499,
                originalPrice: 999,
                description: 'One-time investment',
                icon: '🔮',
                color: 'gold',
                isLifetime: true,
                features: [
                    { text: 'Everything in Elite', included: true, highlight: true },
                    { text: 'Lifetime access (one-time payment)', included: true },
                    { text: 'Family account (5 members)', included: true },
                    { text: 'Early access to new features', included: true },
                    { text: 'Exclusive masterclasses', included: true },
                    { text: 'NEXUS Founder badge', included: true }
                ],
                limitations: [],
                cta: 'Lifetime access',
                highlighted: false,
                special: true
            }
        ],
        testimonials: [
            {
                name: 'Sara B.',
                school: 'EMI - Rabat',
                text: 'NEXUS AI helped me get into EMI. The AI guided me perfectly!',
                avatar: 'S'
            },
            {
                name: 'Youssef K.',
                school: 'ENCG - Casablanca',
                text: 'Elite mentorship changed my life. 100% recommend!',
                avatar: 'Y'
            },
            {
                name: 'Amina R.',
                school: 'UM6P - Ben Guerir',
                text: 'Thanks to NEXUS AI, I found my path in 2 weeks.',
                avatar: 'A'
            }
        ],
        faq: [
            {
                q: 'Can I change plans anytime?',
                a: 'Yes! You can upgrade or downgrade anytime. The difference will be prorated.'
            },
            {
                q: 'Is there a refund guarantee?',
                a: 'Absolutely! 30-day money-back guarantee, no questions asked.'
            },
            {
                q: 'How does mentorship work?',
                a: 'Elite and Lifetime plans include sessions with certified mentors (alumni from top schools).'
            },
            {
                q: 'What payment methods do you accept?',
                a: 'PayPal, credit cards (Visa, Mastercard), and bank transfers.'
            }
        ],
        paymentTitle: 'Complete subscription',
        securePayment: '🔒 Secure payment via PayPal',
        payWithPaypal: 'Pay with PayPal',
        cancelAnytime: 'Cancel anytime'
    },
    ar: {
        badge: '🎁 سنة واحدة مجاناً للجميع!',
        title: 'استثمر في',
        titleHighlight: 'مستقبلك',
        description: 'انضم إلى أكثر من 5000 طالب مغربي غيروا مسارهم مع NEXUS.',
        monthly: 'شهري',
        yearly: 'سنوي',
        save: '-20%',
        popular: '🔥 الأكثر مبيعاً',
        perMonth: '/شهر',
        perYear: '/سنة',
        getStarted: 'ابدأ',
        currentPlan: '✓ الخطة الحالية',
        upgrading: 'جاري التفعيل...',
        loginRequired: 'تسجيل الدخول مطلوب',
        success: '🎉 مبروك!',
        guarantee: '✨ ضمان استعادة الأموال لمدة 30 يومًا',
        limitedOffer: '🚀 عرض خاص - جميع الاشتراكات مجانية لمدة سنة!',
        trustedBy: 'موثوق من أفضل المدارس',
        plans: [
            {
                id: 'free',
                name: 'اكتشاف',
                price: 0,
                yearlyPrice: 0,
                description: 'مثالي للاستكشاف',
                icon: '🌱',
                color: 'emerald',
                features: [
                    { text: 'اختبار التوجيه الكامل', included: true },
                    { text: '10 محادثات NEXUS AI Chat', included: true },
                    { text: '10 جلسات NEXUS AI Voice', included: true },
                    { text: 'استكشاف المدارس', included: true },
                    { text: 'أخبار ومقالات', included: true }
                ],
                limitations: [
                    'جدول زمني أساسي',
                    'بدون تحضير للامتحانات'
                ],
                cta: 'ابدأ مجاناً',
                highlighted: false
            },
            {
                id: 'pro',
                name: 'Pro',
                price: 79,
                yearlyPrice: 758,
                originalPrice: 99,
                description: 'للطلاب المتحمسين',
                icon: '⚡',
                color: 'blue',
                features: [
                    { text: 'كل ما في الاكتشاف', included: true, highlight: true },
                    { text: 'NEXUS AI Chat غير محدود 24/7', included: true },
                    { text: 'NEXUS AI Voice غير محدود', included: true },
                    { text: 'محاكاة جدول زمني كاملة', included: true },
                    { text: 'التحضير للامتحانات', included: true },
                    { text: 'تنبيهات المواعيد المخصصة', included: true },
                    { text: 'دعم ذو أولوية', included: true }
                ],
                limitations: [],
                cta: 'انضم للـ Pro',
                highlighted: true
            },
            {
                id: 'elite',
                name: 'Elite',
                price: 199,
                yearlyPrice: 1908,
                originalPrice: 299,
                description: 'للطموحين',
                icon: '👑',
                color: 'purple',
                features: [
                    { text: 'كل ما في Pro', included: true, highlight: true },
                    { text: 'إرشاد 1-على-1 (ساعتان/شهر)', included: true },
                    { text: 'الوصول لأحداث VIP', included: true },
                    { text: 'محاكاة مقابلات بالذكاء الاصطناعي', included: true },
                    { text: 'تدريب مهني مخصص', included: true },
                    { text: 'شهادة NEXUS Elite', included: true }
                ],
                limitations: [],
                cta: 'انضم للنخبة',
                highlighted: false
            },
            {
                id: 'godmode',
                name: 'مدى الحياة',
                price: 499,
                yearlyPrice: 499,
                originalPrice: 999,
                description: 'استثمار لمرة واحدة',
                icon: '🔮',
                color: 'gold',
                isLifetime: true,
                features: [
                    { text: 'كل ما في Elite', included: true, highlight: true },
                    { text: 'وصول مدى الحياة (دفعة واحدة)', included: true },
                    { text: 'حساب عائلي (5 أعضاء)', included: true },
                    { text: 'وصول مبكر للميزات الجديدة', included: true },
                    { text: 'دروس ماستر حصرية', included: true },
                    { text: 'شارة مؤسس NEXUS', included: true }
                ],
                limitations: [],
                cta: 'وصول مدى الحياة',
                highlighted: false,
                special: true
            }
        ],
        testimonials: [
            {
                name: 'سارة ب.',
                school: 'EMI - الرباط',
                text: 'ساعدني NEXUS AI في الحصول على EMI. الذكاء الاصطناعي وجهني بشكل مثالي!',
                avatar: 'س'
            },
            {
                name: 'يوسف ك.',
                school: 'ENCG - الدار البيضاء',
                text: 'غير إرشاد Elite حياتي. أنصح به 100%!',
                avatar: 'ي'
            },
            {
                name: 'أمينة ر.',
                school: 'UM6P - بن جرير',
                text: 'بفضل NEXUS AI، وجدت طريقي في أسبوعين.',
                avatar: 'أ'
            }
        ],
        faq: [
            {
                q: 'هل يمكنني تغيير الخطة في أي وقت؟',
                a: 'نعم! يمكنك الترقية أو التخفيض في أي وقت. سيتم حساب الفرق بالتناسب.'
            },
            {
                q: 'هل هناك ضمان استرداد؟',
                a: 'بالتأكيد! ضمان استرداد الأموال لمدة 30 يومًا، بدون أسئلة.'
            },
            {
                q: 'كيف يعمل الإرشاد؟',
                a: 'تتضمن خطط Elite ومدى الحياة جلسات مع مرشدين معتمدين (خريجي أفضل المدارس).'
            },
            {
                q: 'ما طرق الدفع المقبولة؟',
                a: 'PayPal، البطاقات المصرفية (Visa، Mastercard)، والتحويلات البنكية.'
            }
        ],
        paymentTitle: 'إتمام الاشتراك',
        securePayment: '🔒 دفع آمن عبر PayPal',
        payWithPaypal: 'ادفع بـ PayPal',
        cancelAnytime: 'إلغاء في أي وقت'
    }
}

// PayPal Plan IDs - Replace with your actual PayPal plan IDs
const PAYPAL_PLAN_IDS = {
    pro: {
        monthly: 'YOUR_PRO_MONTHLY_PLAN_ID',
        yearly: 'YOUR_PRO_YEARLY_PLAN_ID'
    },
    elite: {
        monthly: 'YOUR_ELITE_MONTHLY_PLAN_ID',
        yearly: 'YOUR_ELITE_YEARLY_PLAN_ID'
    },
    godmode: {
        monthly: 'YOUR_LIFETIME_PLAN_ID', // One-time payment
        yearly: 'YOUR_LIFETIME_PLAN_ID'
    }
}

const PricingSection = ({ language = 'fr', user = null, onLoginRequired = () => { }, onPlanSelected = null }) => {
    const [billingCycle, setBillingCycle] = useState('monthly')
    const [currentPlan, setCurrentPlan] = useState('free')
    const [upgrading, setUpgrading] = useState(null)
    const [successMessage, setSuccessMessage] = useState('')
    const [expandedFaq, setExpandedFaq] = useState(null)
    const [showPaymentModal, setShowPaymentModal] = useState(null)
    const [paypalLoaded, setPaypalLoaded] = useState(false)
    const [paypalError, setPaypalError] = useState(false)
    const [processing, setProcessing] = useState(false)

    // New states for name modal and congratulations
    const [showNameModal, setShowNameModal] = useState(false)
    const [showCongrats, setShowCongrats] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [userName, setUserName] = useState('')
    const [nameError, setNameError] = useState('')

    const t = translations[language] || translations.fr
    const isRTL = language === 'ar'

    // Load PayPal SDK
    useEffect(() => {
        const loadPayPal = async () => {
            // Check if PayPal is already loaded
            if (window.paypal) {
                setPaypalLoaded(true)
                return
            }

            // Load PayPal SDK with EUR
            const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
            if (!clientId || clientId === 'YOUR_PAYPAL_CLIENT_ID' || clientId.length < 20) {
                console.warn('PayPal Client ID not configured properly')
                setPaypalError(true)
                return
            }

            try {
                const script = document.createElement('script')
                script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&intent=capture`
                script.async = true

                script.onload = () => {
                    console.log('✅ PayPal SDK loaded successfully')
                    setPaypalLoaded(true)
                    setPaypalError(false)
                }

                script.onerror = (error) => {
                    console.error('❌ Failed to load PayPal SDK:', error)
                    setPaypalError(true)
                }

                document.body.appendChild(script)

                // Timeout fallback
                setTimeout(() => {
                    if (!window.paypal) {
                        console.warn('PayPal SDK loading timeout')
                        setPaypalError(true)
                    }
                }, 10000)
            } catch (error) {
                console.error('PayPal load error:', error)
                setPaypalError(true)
            }
        }

        loadPayPal()
    }, [])

    // Fetch current subscription on mount
    useEffect(() => {
        if (user) {
            fetchCurrentPlan()
        }
    }, [user])

    // Render PayPal buttons when modal opens
    useEffect(() => {
        if (showPaymentModal && paypalLoaded && window.paypal && !paypalError) {
            const renderPayPalButtons = () => {
                const container = document.getElementById('paypal-button-container')
                if (!container) return

                container.innerHTML = '' // Clear previous buttons

                const plan = t.plans.find(p => p.id === showPaymentModal)
                if (!plan) return

                // Calculate price in EUR (approximate conversion: 1 EUR ≈ 11 MAD)
                const priceMAD = plan.isLifetime ? plan.price : (billingCycle === 'monthly' ? plan.price : plan.yearlyPrice)
                const priceEUR = Math.max(1, Math.round(priceMAD / 11 * 100) / 100) // Minimum 1 EUR

                try {
                    window.paypal.Buttons({
                        style: {
                            shape: 'pill',
                            color: plan.isLifetime ? 'gold' : 'blue',
                            layout: 'vertical',
                            label: 'pay',
                            height: 45
                        },
                        createOrder: (data, actions) => {
                            const description = plan.isLifetime
                                ? `NEXUS ${plan.name} - Accès à vie`
                                : `NEXUS ${plan.name} - ${billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}`

                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        value: priceEUR.toFixed(2),
                                        currency_code: 'EUR'
                                    },
                                    description: description
                                }]
                            })
                        },
                        onApprove: async (data, actions) => {
                            setProcessing(true)
                            try {
                                const order = await actions.order.capture()
                                console.log('✅ Payment successful:', order)
                                await processSubscription(showPaymentModal, order.id)
                            } catch (err) {
                                console.error('Capture error:', err)
                                alert('Erreur lors de la finalisation du paiement.')
                            } finally {
                                setProcessing(false)
                            }
                        },
                        onError: (err) => {
                            console.error('PayPal Error:', err)
                            setPaypalError(true)
                        },
                        onCancel: () => {
                            console.log('Payment cancelled')
                        }
                    }).render('#paypal-button-container').catch(err => {
                        console.error('PayPal render error:', err)
                        setPaypalError(true)
                    })
                } catch (error) {
                    console.error('PayPal Buttons error:', error)
                    setPaypalError(true)
                }
            }

            // Small delay to ensure DOM is ready
            setTimeout(renderPayPalButtons, 100)
        }
    }, [showPaymentModal, paypalLoaded, billingCycle, paypalError])

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

    const fetchCurrentPlan = async () => {
        try {
            const token = localStorage.getItem('nexus_token')
            if (!token) return

            const response = await fetch(`${API_BASE}/user/subscription`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setCurrentPlan(data.currentPlan)
            }
        } catch (error) {
            console.error('Error fetching subscription:', error)
        }
    }

    const handleSubscribe = async (planId) => {
        // Don't allow subscribing to current plan
        if (planId === currentPlan) return

        // Check if user has a name set (from localStorage)
        const savedUser = localStorage.getItem('nexus_user')
        let hasName = false

        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser)
                hasName = parsedUser.name && parsedUser.name.trim() !== ''
            } catch {
                hasName = false
            }
        }

        // If no name, show name modal first
        if (!hasName) {
            setSelectedPlan(planId)
            setShowNameModal(true)
            return
        }

        // ALL PLANS ARE FREE FOR 1 YEAR - No payment required!
        // Directly activate the plan and show congratulations
        activatePlanWithCongrats(planId)
    }

    const handleNameSubmit = () => {
        if (!userName.trim()) {
            setNameError(language === 'ar' ? 'الرجاء إدخال اسمك' : language === 'en' ? 'Please enter your name' : 'Veuillez entrer votre nom')
            return
        }

        // Save user to localStorage
        const userData = {
            id: 'user_' + Date.now(),
            name: userName.trim(),
            email: userName.trim().toLowerCase().replace(/\s+/g, '.') + '@nexus.ma',
            plan: selectedPlan,
            createdAt: new Date().toISOString()
        }

        localStorage.setItem('nexus_user', JSON.stringify(userData))
        localStorage.setItem('nexus_token', 'token_' + Date.now())

        setShowNameModal(false)
        setNameError('')

        // Now show congratulations
        activatePlanWithCongrats(selectedPlan)
    }

    const activatePlanWithCongrats = (planId) => {
        // Update the user's plan in localStorage
        const savedUser = localStorage.getItem('nexus_user')
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser)
                parsedUser.plan = planId
                localStorage.setItem('nexus_user', JSON.stringify(parsedUser))
            } catch (e) {
                console.error('Error updating plan:', e)
            }
        }

        setSelectedPlan(planId)
        setCurrentPlan(planId)
        setShowCongrats(true)
    }

    const handleCongratsClose = () => {
        setShowCongrats(false)
        // Redirect to dashboard
        if (onPlanSelected) {
            onPlanSelected(selectedPlan)
        } else {
            window.location.reload()
        }
    }

    const processSubscription = async (planId, paymentId = null) => {
        setUpgrading(planId)
        setSuccessMessage('')
        setShowPaymentModal(null)

        try {
            const token = localStorage.getItem('nexus_token')
            const response = await fetch(`${API_BASE}/user/subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId,
                    billingCycle,
                    paymentId // PayPal payment/subscription ID
                })
            })

            const data = await response.json()

            if (data.success) {
                setCurrentPlan(planId)
                setSuccessMessage(data.message)

                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(''), 5000)
            }
        } catch (error) {
            console.error('Subscription error:', error)
        } finally {
            setUpgrading(null)
        }
    }

    const getButtonText = (plan) => {
        if (upgrading === plan.id) return t.upgrading
        if (currentPlan === plan.id) return t.currentPlan
        return plan.cta
    }

    const isButtonDisabled = (plan) => {
        return upgrading !== null || currentPlan === plan.id
    }

    const getPrice = (plan) => {
        if (plan.isLifetime) return plan.price
        return billingCycle === 'monthly' ? plan.price : Math.round(plan.yearlyPrice / 12)
    }

    const getSelectedPlanDetails = () => {
        const plan = t.plans.find(p => p.id === showPaymentModal)
        if (!plan) return null

        const price = plan.isLifetime ? plan.price : (billingCycle === 'monthly' ? plan.price : plan.yearlyPrice)
        const period = plan.isLifetime ? 'une seule fois' : (billingCycle === 'monthly' ? '/mois' : '/an')

        return { ...plan, displayPrice: price, period }
    }

    return (
        <section className={`pricing-section-v2 ${isRTL ? 'rtl' : ''}`} id="tarifs">
            {/* Background Effects */}
            <div className="pricing-bg-effects">
                <div className="pricing-orb pricing-orb-1"></div>
                <div className="pricing-orb pricing-orb-2"></div>
                <div className="pricing-orb pricing-orb-3"></div>
                <div className="pricing-grid-pattern"></div>
            </div>

            <div className="pricing-container">
                {/* Success Message */}
                {successMessage && (
                    <div className="pricing-success-toast animate-slide-down">
                        <span className="success-icon">🎉</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Header */}
                <div className="pricing-header-v2">
                    <div className="pricing-badge-glow">
                        <span className="pricing-badge">{t.badge}</span>
                    </div>
                    <h2 className="pricing-title-v2">
                        {t.title} <span className="pricing-title-highlight">{t.titleHighlight}</span>
                    </h2>
                    <p className="pricing-subtitle">{t.description}</p>

                    {/* Limited Time Offer Banner */}
                    <div className="limited-offer-banner">
                        <div className="offer-pulse"></div>
                        <span>{t.limitedOffer}</span>
                    </div>

                    {/* Billing Toggle */}
                    <div className="billing-toggle-v2">
                        <button
                            className={`toggle-option ${billingCycle === 'monthly' ? 'active' : ''}`}
                            onClick={() => setBillingCycle('monthly')}
                        >
                            {t.monthly}
                        </button>
                        <button
                            className={`toggle-option ${billingCycle === 'yearly' ? 'active' : ''}`}
                            onClick={() => setBillingCycle('yearly')}
                        >
                            {t.yearly}
                            <span className="save-tag">{t.save}</span>
                        </button>
                        <div className={`toggle-slider ${billingCycle === 'yearly' ? 'yearly' : ''}`}></div>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="plans-grid-v2">
                    {t.plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`plan-card-v2 ${plan.color} ${plan.highlighted ? 'highlighted' : ''} ${plan.special ? 'special' : ''} ${currentPlan === plan.id ? 'current' : ''}`}
                            style={{ '--delay': `${index * 0.1}s` }}
                        >
                            {/* Popular Badge */}
                            {plan.highlighted && (
                                <div className="popular-ribbon">
                                    <span>{t.popular}</span>
                                </div>
                            )}

                            {/* Special Glow */}
                            {plan.special && <div className="special-glow-effect"></div>}

                            {/* Current Plan Indicator */}
                            {currentPlan === plan.id && (
                                <div className="current-indicator">
                                    <span className="current-dot"></span>
                                    <span>Plan actif</span>
                                </div>
                            )}

                            {/* Plan Icon */}
                            <div className={`plan-icon-wrapper ${plan.color}`}>
                                <span className="plan-icon">{plan.icon}</span>
                            </div>

                            {/* Plan Header */}
                            <div className="plan-header-v2">
                                <h3 className="plan-name-v2">{plan.name}</h3>
                                <p className="plan-tagline">{plan.description}</p>
                            </div>

                            {/* Price - ALL PLANS FREE FOR 1 YEAR */}
                            <div className="plan-price-v2">
                                {plan.originalPrice && (
                                    <span className="original-price">{plan.originalPrice} MAD</span>
                                )}
                                {plan.price > 0 && (
                                    <span className="original-price" style={{ textDecoration: 'line-through', color: '#ef4444' }}>{plan.price} MAD</span>
                                )}
                                <div className="price-main">
                                    <span className="price-value" style={{ color: '#10b981' }}>0</span>
                                    <div className="price-details">
                                        <span className="price-currency">MAD</span>
                                        <span className="price-period" style={{ color: '#10b981', fontWeight: 'bold' }}>1 AN GRATUIT!</span>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="plan-features-v2">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className={`feature-row ${feature.highlight ? 'highlight' : ''}`}>
                                        <span className="feature-check">✓</span>
                                        <span className="feature-text">{feature.text}</span>
                                    </li>
                                ))}
                                {plan.limitations.map((limitation, limitIndex) => (
                                    <li key={`limit-${limitIndex}`} className="feature-row limitation">
                                        <span className="feature-x">✕</span>
                                        <span className="feature-text">{limitation}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <button
                                className={`plan-cta-v2 ${plan.highlighted ? 'primary' : ''} ${plan.special ? 'special' : ''} ${currentPlan === plan.id ? 'current' : ''}`}
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={isButtonDisabled(plan)}
                            >
                                {upgrading === plan.id && <span className="btn-spinner"></span>}
                                {getButtonText(plan)}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Guarantee Badge */}
                <div className="guarantee-section">
                    <div className="guarantee-badge">
                        <span className="guarantee-icon">🛡️</span>
                        <span className="guarantee-text">{t.guarantee}</span>
                    </div>
                </div>

                {/* Testimonials */}
                <div className="testimonials-section">
                    <h3 className="testimonials-title">Ce que disent nos étudiants</h3>
                    <div className="testimonials-grid">
                        {t.testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card" style={{ '--delay': `${index * 0.15}s` }}>
                                <div className="testimonial-content">
                                    <div className="quote-mark">"</div>
                                    <p className="testimonial-text">{testimonial.text}</p>
                                </div>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{testimonial.avatar}</div>
                                    <div className="author-info">
                                        <span className="author-name">{testimonial.name}</span>
                                        <span className="author-school">{testimonial.school}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="faq-section">
                    <h3 className="faq-title">Questions fréquentes</h3>
                    <div className="faq-list">
                        {t.faq.map((item, index) => (
                            <div
                                key={index}
                                className={`faq-item ${expandedFaq === index ? 'expanded' : ''}`}
                                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                            >
                                <div className="faq-question">
                                    <span>{item.q}</span>
                                    <span className="faq-toggle">{expandedFaq === index ? '−' : '+'}</span>
                                </div>
                                {expandedFaq === index && (
                                    <div className="faq-answer">{item.a}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trusted By */}
                <div className="trusted-section">
                    <p className="trusted-text">{t.trustedBy}</p>
                    <div className="trusted-logos">
                        <span className="school-logo">EMI</span>
                        <span className="school-logo">ENSIAS</span>
                        <span className="school-logo">INPT</span>
                        <span className="school-logo">ENCG</span>
                        <span className="school-logo">UM6P</span>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="payment-modal-overlay" onClick={() => !processing && setShowPaymentModal(null)}>
                    <div className="payment-modal" onClick={e => e.stopPropagation()}>
                        {!processing && (
                            <button className="modal-close" onClick={() => setShowPaymentModal(null)}>×</button>
                        )}

                        <div className="modal-header">
                            <span className="modal-icon">💳</span>
                            <h3>{t.paymentTitle || 'Finaliser l\'abonnement'}</h3>
                        </div>

                        {getSelectedPlanDetails() && (
                            <div className="modal-plan-info">
                                <div className="modal-plan-details">
                                    <span className="modal-plan-icon">{getSelectedPlanDetails().icon}</span>
                                    <span className="modal-plan-name">NEXUS {getSelectedPlanDetails().name}</span>
                                </div>
                                <span className="modal-plan-price">
                                    {getSelectedPlanDetails().displayPrice} MAD
                                    <span className="modal-price-period">{getSelectedPlanDetails().period}</span>
                                </span>
                            </div>
                        )}

                        {/* Payment Options */}
                        <div className="payment-options">
                            <p className="payment-secure-label">🔒 Paiement sécurisé - NEXUS</p>

                            {/* PayPal SDK Smart Buttons */}
                            {paypalLoaded && !paypalError && (
                                <div className="paypal-container">
                                    <div id="paypal-button-container"></div>
                                </div>
                            )}

                            {/* Loading State */}
                            {!paypalLoaded && !paypalError && (
                                <div className="paypal-loading">
                                    <div className="loading-spinner"></div>
                                    <span>Chargement PayPal...</span>
                                </div>
                            )}

                            {/* Fallback PayPal Button when SDK fails */}
                            {paypalError && (
                                <button
                                    className="payment-btn paypal-btn"
                                    disabled={processing}
                                    onClick={() => {
                                        const plan = getSelectedPlanDetails()
                                        const priceMAD = plan.isLifetime ? plan.price : (billingCycle === 'monthly' ? plan.price : plan.yearlyPrice)
                                        const priceEUR = Math.max(1, Math.round(priceMAD / 11 * 100) / 100)
                                        const description = encodeURIComponent(`NEXUS ${plan.name}`)

                                        // PayPal Checkout URL
                                        window.open(`https://www.paypal.com/paypalme/nexusapp/${priceEUR}EUR`, '_blank')

                                        setTimeout(() => {
                                            if (confirm('✅ Paiement PayPal effectué ?\nCliquez OK pour activer votre abonnement.')) {
                                                processSubscription(showPaymentModal, 'PAYPAL_' + Date.now())
                                            }
                                        }, 3000)
                                    }}
                                >
                                    <span className="btn-icon">💳</span>
                                    <span>Payer avec PayPal</span>
                                </button>
                            )}
                        </div>

                        <div className="modal-footer">
                            <p className="modal-security">🔒 Paiement sécurisé • Données cryptées SSL 256-bit</p>
                            <p className="modal-cancel">{t.cancelAnytime || 'Annulez à tout moment'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Name Modal */}
            {showNameModal && (
                <div className="payment-modal-overlay" onClick={() => setShowNameModal(false)}>
                    <div className="payment-modal name-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowNameModal(false)}>×</button>

                        <div className="modal-header">
                            <span className="modal-icon">✨</span>
                            <h3>{language === 'ar' ? 'أدخل اسمك' : language === 'en' ? 'Enter your name' : 'Entrez votre nom'}</h3>
                            <p className="modal-subtitle">{language === 'ar' ? 'لتفعيل حسابك' : language === 'en' ? 'To activate your account' : 'Pour activer votre compte'}</p>
                        </div>

                        {nameError && (
                            <div className="name-error">⚠️ {nameError}</div>
                        )}

                        <div className="name-input-container">
                            <input
                                type="text"
                                className="name-input-field"
                                placeholder={language === 'ar' ? 'اسمك الكامل' : language === 'en' ? 'Your full name' : 'Votre nom complet'}
                                value={userName}
                                onChange={(e) => {
                                    setUserName(e.target.value)
                                    setNameError('')
                                }}
                                autoFocus
                            />
                        </div>

                        <button className="confirm-btn" onClick={handleNameSubmit}>
                            🚀 {language === 'ar' ? 'تأكيد' : language === 'en' ? 'Continue' : 'Continuer'}
                        </button>
                    </div>
                </div>
            )}

            {/* Congratulations Modal */}
            {showCongrats && (
                <div className="payment-modal-overlay congrats-overlay">
                    <div className="payment-modal congrats-modal" onClick={e => e.stopPropagation()}>
                        {/* Confetti Animation */}
                        <div className="confetti-container">
                            {[...Array(50)].map((_, i) => (
                                <div key={i} className="confetti" style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'][Math.floor(Math.random() * 8)]
                                }} />
                            ))}
                        </div>

                        <div className="congrats-content">
                            <div className="congrats-badge">
                                {selectedPlan === 'pro' && '⚡'}
                                {selectedPlan === 'elite' && '👑'}
                                {(selectedPlan === 'godmode' || selectedPlan === 'lifetime') && '🔮'}
                                {selectedPlan === 'free' && '🌱'}
                            </div>

                            <h2 className="congrats-title">🎉 {language === 'ar' ? 'مبروك!' : language === 'en' ? 'Congratulations!' : 'Félicitations!'}</h2>

                            <p className="congrats-message">
                                {language === 'ar'
                                    ? `لقد فتحت سنة واحدة من ${selectedPlan === 'pro' ? 'Pro' : selectedPlan === 'elite' ? 'Elite' : 'Lifetime'} مجاناً!`
                                    : language === 'en'
                                        ? `You've unlocked 1 year of ${selectedPlan === 'pro' ? 'Pro' : selectedPlan === 'elite' ? 'Elite' : 'Lifetime'} for FREE!`
                                        : `Vous avez débloqué 1 an de ${selectedPlan === 'pro' ? 'Pro' : selectedPlan === 'elite' ? 'Elite' : 'Lifetime'} GRATUIT!`
                                }
                            </p>

                            <div className="congrats-plan-info">
                                <span className="plan-icon-large">
                                    {selectedPlan === 'pro' && '⚡'}
                                    {selectedPlan === 'elite' && '👑'}
                                    {(selectedPlan === 'godmode' || selectedPlan === 'lifetime') && '🔮'}
                                </span>
                                <span className="plan-name-large">NEXUS {selectedPlan === 'godmode' ? 'Lifetime' : selectedPlan?.charAt(0).toUpperCase() + selectedPlan?.slice(1)}</span>
                            </div>

                            <button className="congrats-btn" onClick={handleCongratsClose}>
                                ✨ {language === 'ar' ? 'الذهاب إلى لوحة التحكم' : language === 'en' ? 'Go to Dashboard' : 'Aller au Dashboard'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default PricingSection
