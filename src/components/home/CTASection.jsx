import React from 'react';
import './HomeSections.css';

const translations = {
    fr: {
        title: 'Commencez votre orientation post-bac dès maintenant !',
        cta: 'Inscrivez-vous sur NEXUS Morocco'
    },
    ar: {
        title: 'ابدأ توجيه ما بعد الباك الآن!',
        cta: 'سجل على منصة NEXUS Morocco'
    },
    en: {
        title: 'Start your post-baccalaureate orientation now!',
        cta: 'Sign up for NEXUS Morocco'
    }
};

const CTASection = ({ onLogin, language = 'fr' }) => {
    const t = translations[language] || translations.fr;
    const isRTL = language === 'ar';

    return (
        <section id={isRTL ? "inscription-ar" : "inscription"} className={`section cta-section ${isRTL ? 'rtl' : ''}`}>
            <div className="container cta-container">
                <div className="cta-content glass-card animate-fade-in-up">
                    <h2 className="cta-title">{t.title}</h2>
                    <button onClick={onLogin} className="btn btn-primary btn-lg cta-btn glow-effect">
                        {t.cta}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
