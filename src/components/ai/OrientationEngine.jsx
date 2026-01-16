import { useState } from 'react'
import './OrientationEngine.css'

const translations = {
    fr: {
        badge: "L'Oracle IA",
        title: 'Découvrez votre constellation',
        subtitle: 'de possibilités',
        description: "Répondez à quelques questions et laissez notre IA révéler les chemins qui correspondent parfaitement à votre profil unique.",
        startBtn: 'Lancer le scan',
        questions: [
            {
                question: 'Qu\'est-ce qui vous passionne le plus ?',
                options: ['Sciences & Technologie', 'Arts & Créativité', 'Commerce & Leadership', 'Santé & Bien-être', 'Sciences Humaines']
            },
            {
                question: 'Comment travaillez-vous le mieux ?',
                options: ['Seul et concentré', 'En équipe collaborative', 'Mix des deux', 'Leadership naturel']
            },
            {
                question: 'Quelle est votre relation avec les mathématiques ?',
                options: ['J\'adore, c\'est mon point fort', 'Correct, je me débrouille', 'Ce n\'est pas ma tasse de thé', 'Je préfère les lettres']
            },
            {
                question: 'Où vous voyez-vous dans 10 ans ?',
                options: ['À la tête d\'une entreprise', 'Expert dans mon domaine', 'Aidant les autres', 'Créant de nouvelles choses', 'Voyageant le monde']
            }
        ],
        analyzing: 'Analyse en cours...',
        paths: 'Chemins révélés',
        match: 'correspondance',
        viewDetails: 'Voir les détails',
        restart: 'Recommencer'
    },
    ar: {
        badge: 'العرّاف الذكي',
        title: 'اكتشف كوكبتك',
        subtitle: 'من الإمكانيات',
        description: 'أجب عن بعض الأسئلة ودع الذكاء الاصطناعي يكشف المسارات التي تناسب ملفك الفريد.',
        startBtn: 'ابدأ الفحص',
        questions: [
            {
                question: 'ما الذي يثير شغفك أكثر؟',
                options: ['العلوم والتكنولوجيا', 'الفنون والإبداع', 'التجارة والقيادة', 'الصحة والرفاهية', 'العلوم الإنسانية']
            },
            {
                question: 'كيف تعمل بشكل أفضل؟',
                options: ['وحدي ومركز', 'في فريق تعاوني', 'مزيج من الاثنين', 'قيادة طبيعية']
            },
            {
                question: 'ما هي علاقتك بالرياضيات؟',
                options: ['أحبها، نقطة قوتي', 'جيدة، أتدبر أمري', 'ليست من اهتماماتي', 'أفضل الأدب']
            },
            {
                question: 'أين ترى نفسك بعد 10 سنوات؟',
                options: ['على رأس شركة', 'خبير في مجالي', 'أساعد الآخرين', 'أخلق أشياء جديدة', 'أسافر حول العالم']
            }
        ],
        analyzing: 'جاري التحليل...',
        paths: 'المسارات المكشوفة',
        match: 'تطابق',
        viewDetails: 'عرض التفاصيل',
        restart: 'إعادة المحاولة'
    },
    en: {
        badge: 'The AI Oracle',
        title: 'Discover your constellation',
        subtitle: 'of possibilities',
        description: 'Answer a few questions and let our AI reveal the paths that perfectly match your unique profile.',
        startBtn: 'Start scan',
        questions: [
            {
                question: 'What are you most passionate about?',
                options: ['Science & Technology', 'Arts & Creativity', 'Business & Leadership', 'Health & Wellness', 'Humanities']
            },
            {
                question: 'How do you work best?',
                options: ['Alone and focused', 'In collaborative teams', 'Mix of both', 'Natural leadership']
            },
            {
                question: 'What is your relationship with mathematics?',
                options: ['I love it, my strength', 'Decent, I manage', 'Not my thing', 'I prefer literature']
            },
            {
                question: 'Where do you see yourself in 10 years?',
                options: ['Leading a company', 'Expert in my field', 'Helping others', 'Creating new things', 'Traveling the world']
            }
        ],
        analyzing: 'Analyzing...',
        paths: 'Paths revealed',
        match: 'match',
        viewDetails: 'View details',
        restart: 'Start over'
    }
}

const sampleResults = [
    {
        title: 'Ingénieur Informatique',
        titleAr: 'مهندس معلوميات',
        titleEn: 'Computer Engineer',
        match: 94,
        schools: ['ENSIAS', 'EMI', 'INPT'],
        icon: '💻'
    },
    {
        title: 'Data Scientist',
        titleAr: 'عالم البيانات',
        titleEn: 'Data Scientist',
        match: 89,
        schools: ['UM6P', 'ENSAM', 'FST'],
        icon: '📊'
    },
    {
        title: 'UX/UI Designer',
        titleAr: 'مصمم واجهات',
        titleEn: 'UX/UI Designer',
        match: 85,
        schools: ['ESAV', 'ESITH', 'Sup\'Com'],
        icon: '🎨'
    },
    {
        title: 'Entrepreneur Tech',
        titleAr: 'رائد أعمال تقني',
        titleEn: 'Tech Entrepreneur',
        match: 82,
        schools: ['HEM', 'ISCAE', 'UM6P'],
        icon: '🚀'
    }
]

const OrientationEngine = ({ language = 'fr' }) => {
    const [phase, setPhase] = useState('intro') // intro, questions, analyzing, results
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState([])
    const t = translations[language]
    const isRTL = language === 'ar'

    const handleStart = () => {
        setPhase('questions')
        setCurrentQuestion(0)
        setAnswers([])
    }

    const handleAnswer = (answerIndex) => {
        const newAnswers = [...answers, answerIndex]
        setAnswers(newAnswers)

        if (currentQuestion < t.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
        } else {
            setPhase('analyzing')
            setTimeout(() => setPhase('results'), 3000)
        }
    }

    const handleRestart = () => {
        setPhase('intro')
        setCurrentQuestion(0)
        setAnswers([])
    }

    const getTitle = (result) => {
        if (language === 'ar') return result.titleAr
        if (language === 'en') return result.titleEn
        return result.title
    }

    return (
        <section className={`orientation-section section ${isRTL ? 'rtl' : ''}`} id="orientation">
            <div className="container">
                <div className="orientation-container glass">
                    {/* Intro Phase */}
                    {phase === 'intro' && (
                        <div className="orientation-intro animate-fade-in">
                            <div className="oracle-visual">
                                <div className="oracle-ring oracle-ring-1"></div>
                                <div className="oracle-ring oracle-ring-2"></div>
                                <div className="oracle-ring oracle-ring-3"></div>
                                <div className="oracle-core">
                                    <span>🔮</span>
                                </div>
                            </div>

                            <span className="section-badge">{t.badge}</span>
                            <h2 className="orientation-title">
                                {t.title} <span className="text-gradient">{t.subtitle}</span>
                            </h2>
                            <p className="orientation-description">{t.description}</p>

                            <button className="btn btn-primary btn-lg" onClick={handleStart}>
                                <span className="btn-pulse"></span>
                                {t.startBtn}
                            </button>
                        </div>
                    )}

                    {/* Questions Phase */}
                    {phase === 'questions' && (
                        <div className="orientation-questions animate-fade-in">
                            {/* Progress */}
                            <div className="question-progress">
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${((currentQuestion + 1) / t.questions.length) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="progress-text">
                                    {currentQuestion + 1} / {t.questions.length}
                                </span>
                            </div>

                            {/* Question */}
                            <div className="question-content" key={currentQuestion}>
                                <h3 className="question-title animate-fade-in-up">
                                    {t.questions[currentQuestion].question}
                                </h3>

                                <div className="question-options">
                                    {t.questions[currentQuestion].options.map((option, index) => (
                                        <button
                                            key={index}
                                            className="option-btn glass animate-fade-in-up"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                            onClick={() => handleAnswer(index)}
                                        >
                                            <span className="option-index">{String.fromCharCode(65 + index)}</span>
                                            <span className="option-text">{option}</span>
                                            <span className="option-arrow">→</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analyzing Phase */}
                    {phase === 'analyzing' && (
                        <div className="orientation-analyzing animate-fade-in">
                            <div className="analyzing-visual">
                                <div className="analyzing-ring"></div>
                                <div className="analyzing-core">
                                    <div className="analyzing-pulse"></div>
                                </div>
                            </div>
                            <h3 className="analyzing-text">{t.analyzing}</h3>
                            <div className="analyzing-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}

                    {/* Results Phase */}
                    {phase === 'results' && (
                        <div className="orientation-results animate-fade-in">
                            <div className="results-header">
                                <span className="results-icon">✨</span>
                                <h3 className="results-title">{t.paths}</h3>
                            </div>

                            <div className="results-grid">
                                {sampleResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className="result-card glass animate-fade-in-up"
                                        style={{ animationDelay: `${index * 150}ms` }}
                                    >
                                        <div className="result-icon">{result.icon}</div>
                                        <div className="result-content">
                                            <h4 className="result-title">{getTitle(result)}</h4>
                                            <div className="result-schools">
                                                {result.schools.join(' • ')}
                                            </div>
                                        </div>
                                        <div className="result-match">
                                            <div
                                                className="match-circle"
                                                style={{ '--match': result.match }}
                                            >
                                                <span>{result.match}%</span>
                                            </div>
                                            <span className="match-label">{t.match}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="results-actions">
                                <button className="btn btn-primary">{t.viewDetails}</button>
                                <button className="btn btn-secondary" onClick={handleRestart}>
                                    {t.restart}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default OrientationEngine
