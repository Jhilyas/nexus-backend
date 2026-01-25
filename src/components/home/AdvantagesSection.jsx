import React from 'react';
import './HomeSections.css';

const translations = {
    fr: {
        title: 'Avantages de NEXUS Morocco',
        description: 'NEXUS Morocco est la plateforme de référence pour l’orientation post-bac au Maroc. Grâce à nos outils intelligents, vous pouvez :',
        items: [
            'Optimiser votre parcours académique selon vos compétences et passions',

            'Accéder à des recommandations pour les meilleures écoles et universités marocaines',
            'Recevoir un accompagnement personnalisé pour réussir votre orientation post-bac'
        ]
    },
    ar: {
        title: 'مميزات NEXUS Morocco',
        description: 'NEXUS Morocco هي المنصة المرجعية لتوجيه ما بعد الباك في المغرب. باستخدام أدواتنا الذكية، يمكنك:',
        items: [
            'تحسين مسارك الأكاديمي وفق مهاراتك واهتماماتك',

            'الوصول إلى توصيات لأفضل المدارس والجامعات المغربية',
            'الحصول على دعم شخصي للنجاح في توجيه ما بعد الباك'
        ]
    }
};

const AdvantagesSection = ({ language = 'fr' }) => {
    const t = translations[language];
    const isRTL = language === 'ar';

    return (
        <section id={isRTL ? "avantages-ar" : "avantages"} className={`section advantages ${isRTL ? 'rtl' : ''}`}>
            <div className="container">
                <h2 className="section-title animate-fade-in-up">{t.title}</h2>
                <p className="section-description animate-fade-in-up">{t.description}</p>
                <div className="advantages-grid">
                    {t.items.map((item, index) => (
                        <div key={index} className="advantage-card glass-card animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="advantage-icon">✦</div>
                            <p className="advantage-text">{item}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AdvantagesSection;
