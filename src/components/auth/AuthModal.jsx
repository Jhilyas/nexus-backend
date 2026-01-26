import { useState } from 'react'
import { auth, supabase } from '../../services/supabase' // Import Supabase
import './AuthModal.css'

const translations = {
    fr: {
        login: 'Connexion',
        register: 'Inscription',
        email: 'Email',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        name: 'Nom complet',
        bacYear: 'Année du Bac',
        bacType: 'Type de Bac',
        bacScore: 'Note du Bac',
        submit: 'Continuer',
        or: 'ou',
        googleLogin: 'Continuer avec Google',
        noAccount: "Pas encore de compte ?",
        hasAccount: 'Déjà un compte ?',
        switchRegister: "S'inscrire",
        switchLogin: 'Se connecter',
        error: 'Une erreur est survenue',
        success: 'Bienvenue !',
        bacTypes: [
            'Sciences Mathématiques A',
            'Sciences Mathématiques B',
            'Sciences Physiques',
            'Sciences de la Vie et de la Terre',
            'Sciences Économiques',
            'Lettres et Sciences Humaines',
            'Bac Technique',
            'Bac Professionnel',
            'Bac International'
        ]
    },
    ar: {
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        name: 'الاسم الكامل',
        bacYear: 'سنة البكالوريا',
        bacType: 'نوع البكالوريا',
        bacScore: 'معدل البكالوريا',
        submit: 'متابعة',
        or: 'أو',
        googleLogin: 'المتابعة مع Google',
        noAccount: 'ليس لديك حساب؟',
        hasAccount: 'لديك حساب بالفعل؟',
        switchRegister: 'إنشاء حساب',
        switchLogin: 'تسجيل الدخول',
        error: 'حدث خطأ',
        success: 'مرحباً!',
        bacTypes: [
            'علوم رياضية أ',
            'علوم رياضية ب',
            'علوم فيزيائية',
            'علوم الحياة والأرض',
            'علوم اقتصادية',
            'آداب وعلوم إنسانية',
            'بكالوريا تقنية',
            'بكالوريا مهنية',
            'بكالوريا دولية'
        ]
    },
    en: {
        login: 'Login',
        register: 'Sign Up',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        name: 'Full Name',
        bacYear: 'Bac Year',
        bacType: 'Bac Type',
        bacScore: 'Bac Score',
        submit: 'Continue',
        or: 'or',
        googleLogin: 'Continue with Google',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        switchRegister: 'Sign up',
        switchLogin: 'Log in',
        error: 'An error occurred',
        success: 'Welcome!',
        bacTypes: [
            'Sciences Math A',
            'Sciences Math B',
            'Physical Sciences',
            'Life & Earth Sciences',
            'Economic Sciences',
            'Literature & Humanities',
            'Technical Bac',
            'Professional Bac',
            'International Bac'
        ]
    }
}

const AuthModal = ({ isOpen, onClose, onSuccess, language = 'fr' }) => {
    const [mode, setMode] = useState('login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        bacYear: new Date().getFullYear(),
        bacType: '',
        bacScore: ''
    })

    const t = translations[language]
    const isRTL = language === 'ar'

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (mode === 'register' && formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match')
            }

            if (mode === 'register') {
                // Real Supabase Signup
                const { user, session } = await auth.signUp(
                    formData.email,
                    formData.password,
                    formData.name
                );

                if (!user) throw new Error(t.error);

                // Trigger Welcome Email (Edge Function)
                await supabase.functions.invoke('send-welcome-email', {
                    body: { email: formData.email, name: formData.name }
                });

                onSuccess(user);
                onClose();
            } else {
                // Real Supabase Login
                const { user, session } = await auth.signIn(
                    formData.email,
                    formData.password
                );

                if (!user) throw new Error(t.error);

                onSuccess(user);
                onClose();
            }
        } catch (err) {
            setError(err.message || t.error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div
                className={`auth-modal glass animate-scale-in ${isRTL ? 'rtl' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button className="auth-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Logo */}
                <div className="auth-logo">
                    <div className="logo-icon">
                        <div className="logo-orbit"></div>
                        <div className="logo-core"></div>
                    </div>
                    <span className="logo-text">NEXUS</span>
                </div>

                {/* Tabs */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => setMode('login')}
                    >
                        {t.login}
                    </button>
                    <button
                        className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                        onClick={() => setMode('register')}
                    >
                        {t.register}
                    </button>
                </div>

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error animate-fade-in">
                            ⚠️ {error}
                        </div>
                    )}

                    {mode === 'register' && (
                        <div className="input-group">
                            <label className="input-label">{t.name}</label>
                            <input
                                type="text"
                                name="name"
                                className="input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">{t.email}</label>
                        <input
                            type="email"
                            name="email"
                            className="input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t.password}</label>
                        <input
                            type="password"
                            name="password"
                            className="input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    {mode === 'register' && (
                        <>
                            <div className="input-group">
                                <label className="input-label">{t.confirmPassword}</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="input"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label className="input-label">{t.bacType}</label>
                                    <select
                                        name="bacType"
                                        className="input"
                                        value={formData.bacType}
                                        onChange={handleChange}
                                    >
                                        <option value="">--</option>
                                        {t.bacTypes.map((type, idx) => (
                                            <option key={idx} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">{t.bacScore}</label>
                                    <input
                                        type="number"
                                        name="bacScore"
                                        className="input"
                                        value={formData.bacScore}
                                        onChange={handleChange}
                                        min="0"
                                        max="20"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            t.submit
                        )}
                    </button>

                    {/* Divider */}
                    <div className="auth-divider">
                        <span>{t.or}</span>
                    </div>

                    {/* Google Login */}
                    <button type="button" className="btn btn-secondary btn-lg auth-google">
                        <svg className="google-icon" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {t.googleLogin}
                    </button>

                    {/* Switch Mode */}
                    <p className="auth-switch">
                        {mode === 'login' ? t.noAccount : t.hasAccount}{' '}
                        <button
                            type="button"
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        >
                            {mode === 'login' ? t.switchRegister : t.switchLogin}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default AuthModal
