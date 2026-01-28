import React, { useState } from 'react';
import './HomeSections.css';

const translations = {
    fr: {
        title: 'Questions Fréquentes (FAQ)',
        subtitle: 'Tout ce que vous devez savoir sur NEXUS et votre orientation Post-Bac',
        items: [
            {
                q: "Qu'est-ce que NEXUS Morocco et comment ça m'aide après le bac ?",
                a: "NEXUS Morocco est une plateforme d'orientation intelligente qui complète les résultats de Tawjihi. Nous utilisons l'IA pour analyser votre profil et vous suggérer les meilleures écoles, universités et carrières au Maroc adaptées à vos compétences et ambitions."
            },
            {
                q: "Quand utiliser NEXUS Morocco pour mon orientation ?",
                a: "Utilisez NEXUS <strong>avant</strong> vos démarches administratives. Notre plateforme vous aide à clarifier votre projet personnel et choisir les meilleures filières. Ensuite, vous pourrez utiliser les portails nationaux comme Tawjihi pour vos inscriptions officielles en toute confiance."
            },
            {
                q: "Comment fonctionne le test d'orientation IA ?",
                a: "Notre algorithme analyse vos réponses sur vos passions, style de travail et ambitions. Il croise ces données avec les réalités du marché du travail marocain pour vous proposer des parcours personnalisés (Ingénierie, Commerce, Médecine, etc.)."
            },
            {
                q: "Quels types d'écoles sont référencés sur NEXUS ?",
                a: "Nous référençons les grandes écoles publiques (ENSA, EST, ENCG, FST...) ainsi que les meilleures universités privées et internationales au Maroc (UIR, UM6P, Al Akhawayn...). Vous trouverez des détails sur les seuils, les concours et les frais."
            },
            {
                q: "L'accès à la plateforme est-il gratuit ?",
                a: "Oui, la version découverte est 100% gratuite. Elle vous donne accès aux tests de base, à l'exploration des écoles et à 10 interactions avec notre Mentor IA et Voice IA. Des plans Premium existent pour un accompagnement illimité."
            }
        ]
    },
    ar: {
        title: 'الأسئلة الشائعة (FAQ)',
        subtitle: 'كل ما تحتاج معرفته عن NEXUS وتوجيهك بعد البكالوريا',
        items: [
            {
                q: "ما هي منصة NEXUS Morocco وكيف تساعدني بعد الباك؟",
                a: "NEXUS Morocco هي منصة توجيه ذكية تكمل نتائج توجيهي. نستخدم الذكاء الاصطناعي لتحليل ملفك الشخصي واقتراح أفضل المدارس والجامعات والمسارات المهنية في المغرب التي تناسب مهاراتك وطموحاتك."
            },
            {
                q: "متى يجب استخدام NEXUS Morocco لتوجيهي؟",
                a: "استخدم NEXUS <strong>قبل</strong> الإجراءات الإدارية. تساعدك منصتنا على توضيح مشروعك الشخصي واختيار أفضل المسارات. بعد ذلك، يمكنك استخدام البوابات الوطنية مثل توجيهي لتسجيلاتك الرسمية بكل ثقة."
            },
            {
                q: "كيف يعمل اختبار التوجيه بالذكاء الاصطناعي؟",
                a: "تُحلل خوارزمياتنا إجاباتك حول شغفك، أسلوب عملك، وطموحاتك. ثم تقوم بمقارنة هذه البيانات مع واقع سوق الشغل المغربي لتقديم مسارات مخصصة لك (هندسة، تجارة، طب، إلخ)."
            },
            {
                q: "ما هي أنواع المدارس الموجودة على NEXUS؟",
                a: "نحن ندرج المدارس العليا العمومية (ENSA, EST, ENCG, FST...) وكذلك أفضل الجامعات الخاصة والدولية في المغرب (UIR, UM6P, Al Akhawayn...). ستجد تفاصيل حول العتبات، المباريات، والرسوم."
            },
            {
                q: "هل الدخول إلى المنصة مجاني؟",
                a: "نعم، نسخة الاستكشاف مجانية 100%. تمنحك الوصول إلى الاختبارات الأساسية، استكشاف المدارس، و10 محادثات مع الموجه الذكي (AI Mentor). توجد خطط مدفوعة للمرافق غير المحدودة."
            }
        ]
    },
    en: {
        title: 'Frequently Asked Questions (FAQ)',
        subtitle: 'Everything you need to know about NEXUS and your Post-Bac orientation',
        items: [
            {
                q: "What is NEXUS Morocco and how does it help me after bac?",
                a: "NEXUS Morocco is an intelligent guidance platform that complements Tawjihi results. We use AI to analyze your profile and suggest the best schools, universities, and careers in Morocco suited to your skills and ambitions."
            },
            {
                q: "When should I use NEXUS Morocco for my orientation?",
                a: "Use NEXUS <strong>before</strong> your administrative procedures. Our platform helps you clarify your personal project and choose the best paths. Then, you can use national portals like Tawjihi for your official registrations with confidence."
            },
            {
                q: "How does the AI orientation test work?",
                a: "Our algorithm analyzes your answers about your passions, work style, and ambitions. It cross-references this data with Moroccan job market realities to offer you personalized paths (Engineering, Business, Medicine, etc.)."
            },
            {
                q: "What types of schools are listed on NEXUS?",
                a: "We list major public schools (ENSA, EST, ENCG, FST...) as well as the best private and international universities in Morocco (UIR, UM6P, Al Akhawayn...). You will find details on thresholds, competitions, and fees."
            },
            {
                q: "Is platform access free?",
                a: "Yes, the discovery version is 100% free. It gives you access to basic tests, school exploration, and 10 interactions with our AI Mentor and Voice AI. Premium plans exist for unlimited support."
            }
        ]
    }
};

const FAQSection = ({ language = 'fr' }) => {
    const t = translations[language] || translations.fr;
    const isRTL = language === 'ar';
    const [openIndex, setOpenIndex] = useState(null);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className={`section faq-section ${isRTL ? 'rtl' : ''}`}>
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title animate-fade-in-up">{t.title}</h2>
                    <p className="section-description animate-fade-in-up delay-100">
                        {t.subtitle}
                    </p>
                </div>

                <div className="faq-container glass-card">
                    {t.items.map((item, index) => (
                        <div
                            key={index}
                            className={`faq-item ${openIndex === index ? 'active' : ''}`}
                            onClick={() => toggleAccordion(index)}
                        >
                            <div className="faq-question">
                                <h3>{item.q}</h3>
                                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
                            </div>
                            <div className="faq-answer">
                                <p dangerouslySetInnerHTML={{ __html: item.a }}></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
