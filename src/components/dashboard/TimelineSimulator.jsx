import { useState, useEffect } from 'react'
import './TimelineSimulator.css'

const translations = {
    fr: {
        badge: 'Simulateur Timeline',
        title: 'Visualisez votre',
        titleHighlight: 'futur',
        description: 'Sélectionnez un chemin et voyez comment votre vie pourrait évoluer au fil des années.',
        selectPath: 'Choisissez un parcours',
        paths: [
            {
                id: 'engineering',
                name: 'Ingénieur Informatique',
                icon: '💻',
                successRate: 87,
                timeline: [
                    { year: 2025, title: 'École d\'ingénieurs', description: 'Début du cycle ingénieur à l\'ENSIAS ou EMI', income: '0 MAD', satisfaction: 70, skills: ['Algorithmes', 'Programmation', 'Mathématiques'], tips: ['Participez aux hackathons', 'Créez des projets personnels'] },
                    { year: 2028, title: 'Premier emploi', description: 'Développeur Junior dans une startup tech', income: '12,000 MAD/mois', satisfaction: 75, skills: ['React/Node.js', 'SQL', 'Git'], tips: ['Contribuez à l\'open source', 'Obtenez des certifications cloud'] },
                    { year: 2032, title: 'Senior Developer', description: 'Lead technique d\'une équipe de 5 personnes', income: '25,000 MAD/mois', satisfaction: 85, skills: ['Architecture', 'Leadership', 'DevOps'], tips: ['Mentorez les juniors', 'Développez vos soft skills'] },
                    { year: 2038, title: 'CTO / Co-fondateur', description: 'Direction technique d\'une scale-up', income: '60,000 MAD/mois', satisfaction: 95, skills: ['Vision stratégique', 'Management', 'Business'], tips: ['Construisez votre réseau', 'Investissez en vous-même'] }
                ]
            },
            {
                id: 'medicine',
                name: 'Médecin Spécialiste',
                icon: '⚕️',
                successRate: 78,
                timeline: [
                    { year: 2025, title: 'Faculté de Médecine', description: 'Début des études médicales à la FMP', income: '0 MAD', satisfaction: 60, skills: ['Anatomie', 'Biologie', 'Chimie'], tips: ['Organisez votre temps', 'Rejoignez des groupes d\'étude'] },
                    { year: 2032, title: 'Interne en médecine', description: 'Spécialisation en cardiologie', income: '8,000 MAD/mois', satisfaction: 70, skills: ['Diagnostic', 'Procédures', 'Communication patient'], tips: ['Choisissez bien votre spécialité', 'Publiez des articles'] },
                    { year: 2036, title: 'Médecin Spécialiste', description: 'Cardiologue en clinique privée', income: '45,000 MAD/mois', satisfaction: 90, skills: ['Expertise médicale', 'Gestion cabinet', 'Relation patient'], tips: ['Développez votre réputation', 'Formez-vous continuellement'] },
                    { year: 2042, title: 'Chef de Service', description: 'Direction d\'un département cardiologie', income: '80,000 MAD/mois', satisfaction: 95, skills: ['Leadership médical', 'Recherche', 'Administration'], tips: ['Enseignez aux futurs médecins', 'Participez aux conférences internationales'] }
                ]
            },
            {
                id: 'business',
                name: 'Entrepreneur',
                icon: '🚀',
                successRate: 65,
                timeline: [
                    { year: 2025, title: 'École de Commerce', description: 'Formation en management (HEM, ENCG, ISCAE)', income: '0 MAD', satisfaction: 70, skills: ['Marketing', 'Finance', 'Communication'], tips: ['Lancez un side project', 'Participez aux compétitions B-School'] },
                    { year: 2028, title: 'Consultant Junior', description: 'Expérience Big 4 (PwC, Deloitte, EY, KPMG)', income: '15,000 MAD/mois', satisfaction: 65, skills: ['Analyse', 'Présentation', 'Gestion de projet'], tips: ['Développez votre expertise sectorielle', 'Travaillez sur des projets variés'] },
                    { year: 2031, title: 'Création de startup', description: 'Lancement de votre propre business', income: '20,000 MAD/mois', satisfaction: 80, skills: ['Entrepreneuriat', 'Vente', 'Recrutement'], tips: ['Validez votre idea rapidement', 'Trouvez un bon co-fondateur'] },
                    { year: 2038, title: 'Serial Entrepreneur', description: 'Plusieurs entreprises, investisseur angel', income: '100,000+ MAD/mois', satisfaction: 95, skills: ['Vision', 'Investissement', 'Mentorat'], tips: ['Diversifiez vos investissements', 'Partagez votre expérience'] }
                ]
            },
            {
                id: 'architecture',
                name: 'Architecte',
                icon: '🏛️',
                successRate: 82,
                timeline: [
                    { year: 2025, title: 'École d\'Architecture', description: 'Début à l\'ENA Rabat ou Casablanca', income: '0 MAD', satisfaction: 75, skills: ['Design', 'AutoCAD', 'Créativité'], tips: ['Construisez votre portfolio', 'Visitez des bâtiments iconiques'] },
                    { year: 2031, title: 'Architecte Junior', description: 'Premier poste en cabinet', income: '10,000 MAD/mois', satisfaction: 70, skills: ['BIM', 'Gestion chantier', 'Réglementation'], tips: ['Obtenez votre inscription à l\'ordre', 'Spécialisez-vous'] },
                    { year: 2036, title: 'Architecte Confirmé', description: 'Responsable de projets majeurs', income: '30,000 MAD/mois', satisfaction: 85, skills: ['Management d\'équipe', 'Négociation', 'Urbanisme'], tips: ['Participez à des concours', 'Développez votre signature'] },
                    { year: 2042, title: 'Directeur d\'Agence', description: 'Fondateur de votre propre cabinet', income: '70,000 MAD/mois', satisfaction: 95, skills: ['Business development', 'Vision artistique', 'Leadership'], tips: ['Créez votre marque', 'Formez la nouvelle génération'] }
                ]
            },
            {
                id: 'datascience',
                name: 'Data Scientist',
                icon: '📊',
                successRate: 91,
                timeline: [
                    { year: 2025, title: 'Formation Data', description: 'Master Data Science (ENSIAS, INSEA, UM6P)', income: '0 MAD', satisfaction: 75, skills: ['Python', 'Statistiques', 'Machine Learning'], tips: ['Faites des projets Kaggle', 'Apprenez les maths avancées'] },
                    { year: 2027, title: 'Data Analyst', description: 'Premier poste en entreprise', income: '14,000 MAD/mois', satisfaction: 75, skills: ['SQL', 'Visualization', 'Business Intelligence'], tips: ['Maîtrisez Power BI/Tableau', 'Comprenez le métier'] },
                    { year: 2031, title: 'ML Engineer', description: 'Spécialiste IA dans une scale-up', income: '30,000 MAD/mois', satisfaction: 88, skills: ['Deep Learning', 'MLOps', 'Cloud'], tips: ['Publiez vos recherches', 'Contribuez à la communauté'] },
                    { year: 2036, title: 'Head of Data/AI', description: 'Direction de l\'équipe Data', income: '55,000 MAD/mois', satisfaction: 95, skills: ['Stratégie Data', 'Management', 'Innovation'], tips: ['Restez à jour sur l\'IA', 'Développez la culture Data'] }
                ]
            }
        ],
        income: 'Revenu',
        satisfaction: 'Satisfaction',
        probability: 'Probabilité de succès',
        insights: 'Insights IA',
        skills: 'Compétences clés',
        tips: 'Conseils',
        insightTexts: [
            '📈 Ce parcours a un taux de réussite de {successRate}% pour des profils similaires au vôtre.',
            '⏰ Les 3 premières années sont cruciales pour établir les fondations.',
            '💡 Conseil: Développez un réseau professionnel dès maintenant.'
        ]
    },
    en: {
        badge: 'Timeline Simulator',
        title: 'Visualize your',
        titleHighlight: 'future',
        description: 'Select a path and see how your life could evolve over the years.',
        selectPath: 'Choose a path',
        paths: [
            {
                id: 'engineering',
                name: 'Software Engineer',
                icon: '💻',
                timeline: [
                    { year: 2025, title: 'Engineering School', description: 'Start of engineering cycle at ENSIAS', income: '0 MAD', satisfaction: 70 },
                    { year: 2028, title: 'First Job', description: 'Junior Developer at a startup', income: '12,000 MAD/month', satisfaction: 75 },
                    { year: 2032, title: 'Senior Developer', description: 'Tech lead of a 5-person team', income: '25,000 MAD/month', satisfaction: 85 },
                    { year: 2038, title: 'CTO / Co-founder', description: 'Technical direction of a scale-up', income: '60,000 MAD/month', satisfaction: 95 }
                ]
            },
            {
                id: 'medicine',
                name: 'Medical Specialist',
                icon: '⚕️',
                timeline: [
                    { year: 2025, title: 'Medical School', description: 'Start of medical studies', income: '0 MAD', satisfaction: 60 },
                    { year: 2032, title: 'Medical Intern', description: 'Cardiology specialization', income: '8,000 MAD/month', satisfaction: 70 },
                    { year: 2036, title: 'Specialist Doctor', description: 'Cardiologist in private clinic', income: '45,000 MAD/month', satisfaction: 90 },
                    { year: 2042, title: 'Department Head', description: 'Leading cardiology department', income: '80,000 MAD/month', satisfaction: 95 }
                ]
            },
            {
                id: 'business',
                name: 'Entrepreneur',
                icon: '🚀',
                timeline: [
                    { year: 2025, title: 'Business School', description: 'Management training at HEM', income: '0 MAD', satisfaction: 70 },
                    { year: 2028, title: 'Junior Consultant', description: 'Big 4 consulting experience', income: '15,000 MAD/month', satisfaction: 65 },
                    { year: 2031, title: 'Startup Creation', description: 'Launching your own business', income: '20,000 MAD/month', satisfaction: 80 },
                    { year: 2038, title: 'Serial Entrepreneur', description: 'Multiple companies, investor', income: '100,000+ MAD/month', satisfaction: 95 }
                ]
            }
        ],
        income: 'Income',
        satisfaction: 'Satisfaction',
        probability: 'Success probability',
        insights: 'AI Insights',
        insightTexts: [
            '📈 This path has an 87% success rate for profiles similar to yours.',
            '⏰ The first 3 years are crucial to establish foundations.',
            '💡 Tip: Develop your professional network starting now.'
        ]
    },
    ar: {
        badge: 'محاكي الجدول الزمني',
        title: 'تصور',
        titleHighlight: 'مستقبلك',
        description: 'اختر مسارًا وشاهد كيف يمكن أن تتطور حياتك على مر السنين.',
        selectPath: 'اختر مسارًا',
        paths: [
            {
                id: 'engineering',
                name: 'مهندس معلوميات',
                icon: '💻',
                timeline: [
                    { year: 2025, title: 'مدرسة الهندسة', description: 'بداية دورة الهندسة في ENSIAS', income: '0 درهم', satisfaction: 70 },
                    { year: 2028, title: 'أول وظيفة', description: 'مطور مبتدئ في شركة ناشئة', income: '12,000 درهم/شهر', satisfaction: 75 },
                    { year: 2032, title: 'مطور أقدم', description: 'قائد تقني لفريق من 5 أشخاص', income: '25,000 درهم/شهر', satisfaction: 85 },
                    { year: 2038, title: 'مدير تقني / شريك مؤسس', description: 'الإدارة التقنية لشركة ناشئة', income: '60,000 درهم/شهر', satisfaction: 95 }
                ]
            },
            {
                id: 'medicine',
                name: 'طبيب متخصص',
                icon: '⚕️',
                timeline: [
                    { year: 2025, title: 'كلية الطب', description: 'بداية دراسات الطب', income: '0 درهم', satisfaction: 60 },
                    { year: 2032, title: 'طبيب متدرب', description: 'تخصص في أمراض القلب', income: '8,000 درهم/شهر', satisfaction: 70 },
                    { year: 2036, title: 'طبيب متخصص', description: 'طبيب قلب في عيادة خاصة', income: '45,000 درهم/شهر', satisfaction: 90 },
                    { year: 2042, title: 'رئيس قسم', description: 'قيادة قسم أمراض القلب', income: '80,000 درهم/شهر', satisfaction: 95 }
                ]
            },
            {
                id: 'business',
                name: 'رائد أعمال',
                icon: '🚀',
                timeline: [
                    { year: 2025, title: 'مدرسة التجارة', description: 'تدريب في الإدارة في HEM', income: '0 درهم', satisfaction: 70 },
                    { year: 2028, title: 'مستشار مبتدئ', description: 'خبرة استشارية في Big 4', income: '15,000 درهم/شهر', satisfaction: 65 },
                    { year: 2031, title: 'إنشاء شركة ناشئة', description: 'إطلاق عملك الخاص', income: '20,000 درهم/شهر', satisfaction: 80 },
                    { year: 2038, title: 'رائد أعمال متسلسل', description: 'عدة شركات، مستثمر', income: '100,000+ درهم/شهر', satisfaction: 95 }
                ]
            }
        ],
        income: 'الدخل',
        satisfaction: 'الرضا',
        probability: 'احتمالية النجاح',
        insights: 'رؤى الذكاء الاصطناعي',
        insightTexts: [
            '📈 هذا المسار لديه معدل نجاح 87٪ للملفات المشابهة لملفك.',
            '⏰ السنوات الثلاث الأولى حاسمة لوضع الأسس.',
            '💡 نصيحة: طور شبكتك المهنية من الآن.'
        ]
    }
}

const TimelineSimulator = ({ language = 'fr' }) => {
    const [selectedPath, setSelectedPath] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const t = translations[language]
    const isRTL = language === 'ar'

    const handlePathSelect = (path) => {
        setSelectedPath(path)
        setActiveStep(0)
    }

    return (
        <section className={`timeline-section section ${isRTL ? 'rtl' : ''}`} id="timeline">
            <div className="container">
                {/* Header */}
                <div className="timeline-header">
                    <span className="section-badge">{t.badge}</span>
                    <h2 className="timeline-title">
                        {t.title} <span className="text-gradient">{t.titleHighlight}</span>
                    </h2>
                    <p className="timeline-description">{t.description}</p>
                </div>

                {/* Path Selection */}
                <div className="path-selection">
                    <p className="path-label">{t.selectPath}</p>
                    <div className="path-options">
                        {t.paths.map((path) => (
                            <button
                                key={path.id}
                                className={`path-option glass ${selectedPath?.id === path.id ? 'active' : ''}`}
                                onClick={() => handlePathSelect(path)}
                            >
                                <span className="path-icon">{path.icon}</span>
                                <span className="path-name">{path.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeline Visualization */}
                {selectedPath && (
                    <div className="timeline-visualization animate-fade-in">
                        {/* Timeline Track */}
                        <div className="timeline-track">
                            <div className="track-line">
                                <div
                                    className="track-progress"
                                    style={{ width: `${((activeStep + 1) / selectedPath.timeline.length) * 100}%` }}
                                ></div>
                            </div>

                            <div className="track-points">
                                {selectedPath.timeline.map((step, index) => (
                                    <button
                                        key={index}
                                        className={`track-point ${index <= activeStep ? 'active' : ''} ${index === activeStep ? 'current' : ''}`}
                                        onClick={() => setActiveStep(index)}
                                    >
                                        <span className="point-year">{step.year}</span>
                                        <div className="point-dot">
                                            <div className="point-pulse"></div>
                                        </div>
                                        <span className="point-title">{step.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step Details */}
                        <div className="step-details glass-card">
                            <div className="step-header">
                                <div className="step-year-badge">{selectedPath.timeline[activeStep].year}</div>
                                <h3 className="step-title">{selectedPath.timeline[activeStep].title}</h3>
                                {selectedPath.successRate && (
                                    <div className="success-rate-badge">
                                        {selectedPath.successRate}% {t.probability || 'success rate'}
                                    </div>
                                )}
                            </div>

                            <p className="step-description">{selectedPath.timeline[activeStep].description}</p>

                            <div className="step-metrics">
                                <div className="metric">
                                    <span className="metric-label">{t.income}</span>
                                    <span className="metric-value">{selectedPath.timeline[activeStep].income}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">{t.satisfaction}</span>
                                    <div className="satisfaction-bar">
                                        <div
                                            className="satisfaction-fill"
                                            style={{ width: `${selectedPath.timeline[activeStep].satisfaction}%` }}
                                        ></div>
                                    </div>
                                    <span className="metric-value">{selectedPath.timeline[activeStep].satisfaction}%</span>
                                </div>
                            </div>

                            {/* Skills Section */}
                            {selectedPath.timeline[activeStep].skills && (
                                <div className="step-skills">
                                    <h4 className="skills-title">🎯 {t.skills || 'Compétences clés'}</h4>
                                    <div className="skills-tags">
                                        {selectedPath.timeline[activeStep].skills.map((skill, idx) => (
                                            <span key={idx} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tips Section */}
                            {selectedPath.timeline[activeStep].tips && (
                                <div className="step-tips">
                                    <h4 className="tips-title">💡 {t.tips || 'Conseils'}</h4>
                                    <ul className="tips-list">
                                        {selectedPath.timeline[activeStep].tips.map((tip, idx) => (
                                            <li key={idx} className="tip-item">{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* AI Insights */}
                            <div className="step-insights">
                                <h4 className="insights-title">🤖 {t.insights}</h4>
                                <ul className="insights-list">
                                    <li className="insight-item">
                                        📈 {language === 'fr'
                                            ? `Ce parcours a un taux de réussite de ${selectedPath.successRate || 85}% pour des profils similaires au vôtre.`
                                            : language === 'ar'
                                                ? `هذا المسار لديه معدل نجاح ${selectedPath.successRate || 85}٪ للملفات المشابهة لملفك.`
                                                : `This path has a ${selectedPath.successRate || 85}% success rate for profiles similar to yours.`}
                                    </li>
                                    <li className="insight-item">
                                        ⏰ {language === 'fr'
                                            ? `Vous êtes à l'étape ${activeStep + 1}/${selectedPath.timeline.length} de votre parcours.`
                                            : language === 'ar'
                                                ? `أنت في المرحلة ${activeStep + 1}/${selectedPath.timeline.length} من مسارك.`
                                                : `You are at step ${activeStep + 1}/${selectedPath.timeline.length} of your journey.`}
                                    </li>
                                    <li className="insight-item">
                                        🎯 {activeStep === selectedPath.timeline.length - 1
                                            ? (language === 'fr' ? 'Félicitations! Vous avez atteint votre objectif final.' : language === 'ar' ? 'تهانينا! لقد وصلت إلى هدفك النهائي.' : 'Congratulations! You\'ve reached your final goal.')
                                            : (language === 'fr' ? `Prochaine étape: ${selectedPath.timeline[activeStep + 1]?.title}` : language === 'ar' ? `الخطوة التالية: ${selectedPath.timeline[activeStep + 1]?.title}` : `Next milestone: ${selectedPath.timeline[activeStep + 1]?.title}`)}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="timeline-nav">
                            <button
                                className="nav-btn btn btn-secondary"
                                disabled={activeStep === 0}
                                onClick={() => setActiveStep(activeStep - 1)}
                            >
                                ← {isRTL ? 'التالي' : 'Précédent'}
                            </button>
                            <button
                                className="nav-btn btn btn-primary"
                                disabled={activeStep === selectedPath.timeline.length - 1}
                                onClick={() => setActiveStep(activeStep + 1)}
                            >
                                {isRTL ? 'السابق' : 'Suivant'} →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default TimelineSimulator
