import React from 'react';
import './HomeSections.css';

const translations = {
    fr: {
        title: 'Pourquoi choisir NEXUS Morocco ?',
        items: [
            "Plateforme d'orientation post-bac au Maroc adaptée aux étudiants (Tawjih et après bac)",
            "Évaluation complète des compétences et intérêts pour un choix de parcours précis",
            "Recommandations personnalisées pour les écoles, universités et formations spécialisées",
            "Support bilingue : Français & Arabe"
        ]
    },
    ar: {
        title: 'لماذا تختار NEXUS Morocco؟',
        items: [
            'منصة توجيه ما بعد الباك في المغرب مناسبة للطلاب (توجيهي وما بعد الباك)',
            'تقييم شامل للمهارات والاهتمامات لاختيار المسار الأكاديمي بدقة',
            'توصيات مخصصة للمدارس والجامعات والمسارات المتخصصة',
            'دعم باللغتين العربية والفرنسية'
        ]
    },
    en: {
        title: 'Why choose NEXUS Morocco?',
        items: [
            'Post-baccalaureate orientation platform in Morocco adapted for students (Tawjihi and after bac)',
            'Comprehensive assessment of skills and interests for precise career path selection',
            'Personalized recommendations for schools, universities, and specialized programs',
            'Bilingual support: French & Arabic'
        ]
    }
};

const WhyNexusSection = ({ language = 'fr' }) => {
    const t = translations[language] || translations.fr;
    const isRTL = language === 'ar';

    return (
        <section id={isRTL ? "pourquoi-nexus-ar" : "pourquoi-nexus"} className={`section why-nexus ${isRTL ? 'rtl' : ''}`}>
            <div className="container">
                <h2 className="section-title animate-fade-in-up">{t.title}</h2>
                <ul className="why-list">
                    {t.items.map((item, index) => (
                        <li key={index} className="why-item glass-card animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <span className="check-icon">✓</span>
                            <span className="item-text">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default WhyNexusSection;
