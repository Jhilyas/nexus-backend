import React from 'react';
import './Blog.css';
import { blogPosts } from './blogData';

const translations = {
    fr: {
        title: 'Guides & Conseils',
        subtitle: "Tout ce qu'il faut savoir pour réussir son orientation au Maroc",
        readMore: 'Lire la suite →'
    },
    ar: {
        title: 'أدلة ونصائح',
        subtitle: "كل ما تحتاج معرفته للنجاح في توجيهك في المغرب",
        readMore: '← اقرأ المزيد'
    },
    en: {
        title: 'Guides & Tips',
        subtitle: "Everything you need to know to succeed in your orientation in Morocco",
        readMore: 'Read more →'
    }
};

const Blog = ({ language = 'fr', onPostClick }) => {
    const t = translations[language] || translations.fr;
    const isRTL = language === 'ar';

    return (
        <div className={`blog-section ${isRTL ? 'rtl' : ''}`}>
            <div className="container">
                <header className="blog-header">
                    <h1 className="blog-title animate-fade-in-down">
                        {t.title}
                    </h1>
                    <p className="blog-subtitle animate-fade-in-up delay-100">
                        {t.subtitle}
                    </p>
                </header>

                <div className="blog-grid">
                    {blogPosts.map((post, index) => (
                        <article
                            key={post.id}
                            className="blog-card animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                            onClick={() => onPostClick(post.id)}
                        >
                            <img src={post.image} alt={post.title[language] || post.title.fr} className="blog-image" />
                            <div className="blog-content">
                                <span className="blog-category">{post.category}</span>
                                <h3 className="blog-card-title">{post.title[language] || post.title.fr}</h3>
                                <p className="blog-excerpt">{post.excerpt[language] || post.excerpt.fr}</p>
                                <div className="blog-footer">
                                    <span className="blog-date">{post.date}</span>
                                    <button className="read-more-btn">
                                        {t.readMore}
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
