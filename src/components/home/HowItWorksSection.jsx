import React from 'react';
import './HomeSections.css';

const translations = {
    fr: {
        title: 'Comment fonctionne NEXUS Morocco ?',
        steps: [
            'Évaluez vos compétences et centres d’intérêt via notre test en ligne',
            'Découvrez les parcours scolaires et universitaires adaptés à votre profil',
            'Recevez un plan personnalisé avec les écoles et formations recommandées',
            'Inscrivez-vous aux programmes et débutez votre orientation post-bac'
        ]
    },
    ar: {
        title: 'كيف تعمل منصة NEXUS Morocco؟',
        steps: [
            'قم بتقييم مهاراتك واهتماماتك عبر الاختبار الإلكتروني',
            'اكتشف المسارات الدراسية والجامعية المناسبة لملفك الشخصي',
            'احصل على خطة مخصصة تشمل المدارس والمسارات الموصى بها',
            'سجل في البرامج وابدأ توجيه ما بعد الباك الخاص بك'
        ]
    }
};

const HowItWorksSection = ({ language = 'fr' }) => {
    const t = translations[language];
    const isRTL = language === 'ar';

    return (
        <section id={isRTL ? "comment-ca-marche-ar" : "comment-ca-marche"} className={`section how-it-works ${isRTL ? 'rtl' : ''}`}>
            <div className="container">
                <h2 className="section-title animate-fade-in-up">{t.title}</h2>
                <div className="steps-container">
                    {t.steps.map((step, index) => (
                        <div key={index} className="step-card glass-card animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                            <div className="step-number">{index + 1}</div>
                            <p className="step-text">{step}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
