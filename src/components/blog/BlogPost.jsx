import React from 'react';
import './Blog.css';
import { blogPosts } from './blogData';

const translations = {
    fr: {
        backToGuides: 'Retour aux guides'
    },
    ar: {
        backToGuides: 'العودة للدليل'
    },
    en: {
        backToGuides: 'Back to guides'
    }
};

const BlogPost = ({ postId, language = 'fr', onBack }) => {
    const post = blogPosts.find(p => p.id === postId);
    const t = translations[language] || translations.fr;
    const isRTL = language === 'ar';

    if (!post) return <div>Post not found</div>;

    // Get content with fallback to French
    const title = post.title[language] || post.title.fr;
    const content = post.content[language] || post.content.fr;

    return (
        <div className={`blog-post-container ${isRTL ? 'rtl' : ''}`}>
            <button onClick={onBack} className="back-btn animate-fade-in">
                <span>←</span> {t.backToGuides}
            </button>

            <article className="animate-fade-in-up">
                <header className="post-header">
                    <span className="blog-category">{post.category}</span>
                    <h1 className="post-title">{title}</h1>
                    <div className="post-meta">
                        <span>{post.date}</span>
                        <span>NEXUS Morocco</span>
                    </div>
                </header>

                <img src={post.image} alt={title} className="post-image" />

                <div
                    className="post-content glass-card"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </article>
        </div>
    );
};

export default BlogPost;
