import React from 'react';
import './Blog.css';
import { blogPosts } from './blogData';

const Blog = ({ language = 'fr', onPostClick }) => {
    const isRTL = language === 'ar';

    return (
        <div className={`blog-section ${isRTL ? 'rtl' : ''}`}>
            <div className="container">
                <header className="blog-header">
                    <h1 className="blog-title animate-fade-in-down">
                        {language === 'fr' ? 'Guides & Conseils' : 'أدلة ونصائح'}
                    </h1>
                    <p className="blog-subtitle animate-fade-in-up delay-100">
                        {language === 'fr'
                            ? "Tout ce qu'il faut savoir pour réussir son orientation au Maroc"
                            : "كل ما تحتاج معرفته للنجاح في توجيهك في المغرب"}
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
                            <img src={post.image} alt={post.title[language]} className="blog-image" />
                            <div className="blog-content">
                                <span className="blog-category">{post.category}</span>
                                <h3 className="blog-card-title">{post.title[language]}</h3>
                                <p className="blog-excerpt">{post.excerpt[language]}</p>
                                <div className="blog-footer">
                                    <span className="blog-date">{post.date}</span>
                                    <button className="read-more-btn">
                                        {language === 'fr' ? 'Lire la suite →' : '← اقرأ المزيد'}
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
