import React from 'react';
import './Blog.css';
import { blogPosts } from './blogData';

const BlogPost = ({ postId, language = 'fr', onBack }) => {
    const post = blogPosts.find(p => p.id === postId);
    const isRTL = language === 'ar';

    if (!post) return <div>Post not found</div>;

    return (
        <div className={`blog-post-container ${isRTL ? 'rtl' : ''}`}>
            <button onClick={onBack} className="back-btn animate-fade-in">
                <span>←</span> {language === 'fr' ? 'Retour au blog' : 'العودة للمدونة'}
            </button>

            <article className="animate-fade-in-up">
                <header className="post-header">
                    <span className="blog-category">{post.category}</span>
                    <h1 className="post-title">{post.title[language]}</h1>
                    <div className="post-meta">
                        <span>{post.date}</span>
                        <span>NEXUS Morocco</span>
                    </div>
                </header>

                <img src={post.image} alt={post.title[language]} className="post-image" />

                <div
                    className="post-content glass-card"
                    dangerouslySetInnerHTML={{ __html: post.content[language] }}
                />
            </article>
        </div>
    );
};

export default BlogPost;
