import { useState, useEffect } from 'react'
import './SchoolsExplorer.css'
import { schoolsData } from '../../data/schoolsData'

const translations = {
    fr: {
        badge: 'Matrice de Connaissances',
        title: 'Explorez',
        titleHighlight: 'les écoles',
        description: 'Découvrez toutes les écoles, formations et opportunités qui correspondent à votre profil.',
        search: 'Rechercher une école...',
        filters: 'Filtres',
        domain: 'Domaine',
        city: 'Ville',
        type: 'Type',
        all: 'Tous',
        domains: {
            engineering: 'Ingénierie',
            business: 'Commerce',
            university: 'Université',
            medicine: 'Médecine',
            arts: 'Architecture',
            education: 'Éducation'
        },
        cities: ['Rabat, Maroc', 'Casablanca, Maroc', 'Marrakech, Maroc', 'Agadir, Maroc', 'Ifrane, Maroc', 'Ben Guerir, Maroc', 'Villeurbanne, France', 'Compiègne, France', 'Cambridge, USA'],
        types: {
            public: 'Public',
            private: 'Privé'
        },
        admission: 'Admission',
        duration: 'Durée',
        years: 'ans',
        avgScore: 'Moyenne requise',
        specialties: 'Spécialités',
        careers: 'Débouchés',
        viewDetails: 'Voir détails',
        compare: 'Comparer',
        noResults: 'Aucune école trouvée'
    },
    en: {
        badge: 'Knowledge Matrix',
        title: 'Explore',
        titleHighlight: 'schools',
        description: 'Discover all schools, programs, and opportunities that match your profile.',
        search: 'Search for a school...',
        filters: 'Filters',
        domain: 'Domain',
        city: 'City',
        type: 'Type',
        all: 'All',
        domains: {
            engineering: 'Engineering',
            business: 'Business',
            university: 'University',
            medicine: 'Medicine',
            arts: 'Architecture',
            education: 'Education'
        },
        cities: ['Rabat, Maroc', 'Casablanca, Maroc', 'Marrakech, Maroc', 'Agadir, Maroc', 'Ifrane, Maroc', 'Ben Guerir, Maroc', 'Villeurbanne, France', 'Compiègne, France', 'Cambridge, USA'],
        types: {
            public: 'Public',
            private: 'Private'
        },
        admission: 'Admission',
        duration: 'Duration',
        years: 'years',
        avgScore: 'Required average',
        specialties: 'Specialties',
        careers: 'Career paths',
        viewDetails: 'View details',
        compare: 'Compare',
        noResults: 'No schools found'
    },
    ar: {
        badge: 'مصفوفة المعرفة',
        title: 'استكشف',
        titleHighlight: 'المدارس',
        description: 'اكتشف جميع المدارس والبرامج والفرص التي تناسب ملفك الشخصي.',
        search: 'ابحث عن مدرسة...',
        filters: 'التصفية',
        domain: 'المجال',
        city: 'المدينة',
        type: 'النوع',
        all: 'الكل',
        domains: {
            engineering: 'الهندسة',
            business: 'التجارة',
            university: 'الجامعة',
            medicine: 'الطب',
            arts: 'الهندسة المعمارية',
            education: 'التعليم'
        },
        cities: ['الرباط، المغرب', 'الدار البيضاء، المغرب', 'مراكش، المغرب', 'أكادير، المغرب', 'إفران، المغرب', 'بنجرير، المغرب', 'فيلوربان، فرنسا', 'كومبيين، فرنسا', 'كامبريدج، أمريكا'],
        types: {
            public: 'عمومي',
            private: 'خاص'
        },
        admission: 'القبول',
        duration: 'المدة',
        years: 'سنوات',
        avgScore: 'المعدل المطلوب',
        specialties: 'التخصصات',
        careers: 'المهن',
        viewDetails: 'عرض التفاصيل',
        compare: 'مقارنة',
        noResults: 'لم يتم العثور على مدارس'
    }
}

const SchoolsExplorer = ({ language = 'fr' }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState({
        domain: 'all',
        city: 'all',
        type: 'all'
    })
    const [selectedSchool, setSelectedSchool] = useState(null)
    const [compareList, setCompareList] = useState([])
    const [showCompareModal, setShowCompareModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)

    const t = translations[language]
    const isRTL = language === 'ar'

    const filteredSchools = schoolsData.filter(school => {
        const matchesSearch =
            school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            school.fullName.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesDomain = filters.domain === 'all' || school.domain === filters.domain
        const matchesCity = filters.city === 'all' || school.city.includes(filters.city) || filters.city.includes(school.city)
        const matchesType = filters.type === 'all' || school.type === filters.type

        return matchesSearch && matchesDomain && matchesCity && matchesType
    })

    const toggleCompare = (school) => {
        if (compareList.find(s => s.id === school.id)) {
            setCompareList(compareList.filter(s => s.id !== school.id))
        } else if (compareList.length < 3) {
            setCompareList([...compareList, school])
        }
    }

    const openCompareModal = () => {
        if (compareList.length >= 2) {
            setShowCompareModal(true)
        }
    }

    const openDetailModal = (school) => {
        setSelectedSchool(school)
        setShowDetailModal(true)
    }

    return (
        <section className={`schools-explorer section ${isRTL ? 'rtl' : ''}`}>
            <div className="container">
                {/* Header */}
                <div className="explorer-header">
                    <span className="section-badge">{t.badge}</span>
                    <h2 className="explorer-title">
                        {t.title} <span className="text-gradient">{t.titleHighlight}</span>
                    </h2>
                    <p className="explorer-description">{t.description}</p>
                </div>

                {/* Search & Filters */}
                <div className="explorer-controls glass">
                    {/* Search */}
                    <div className="search-wrapper">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={t.search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="filters-row">
                        {/* Domain Filter */}
                        <div className="filter-group">
                            <label className="filter-label">{t.domain}</label>
                            <select
                                className="filter-select"
                                value={filters.domain}
                                onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                            >
                                <option value="all">{t.all}</option>
                                {Object.entries(t.domains).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                        </div>

                        {/* City Filter */}
                        <div className="filter-group">
                            <label className="filter-label">{t.city}</label>
                            <select
                                className="filter-select"
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            >
                                <option value="all">{t.all}</option>
                                {['Rabat, Maroc', 'Casablanca, Maroc', 'Marrakech, Maroc', 'Agadir, Maroc', 'Salé, Maroc', 'Ifrane, Maroc', 'Ben Guerir, Maroc', 'Villeurbanne, France', 'Compiègne, France', 'Cambridge, USA', 'Caen/Le Havre/Paris, France'].map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="filter-group">
                            <label className="filter-label">{t.type}</label>
                            <select
                                className="filter-select"
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="all">{t.all}</option>
                                {Object.entries(t.types).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Schools Grid */}
                <div className="schools-grid">
                    {filteredSchools.length === 0 ? (
                        <div className="no-results glass-card">
                            <span className="no-results-icon">🔍</span>
                            <p>{t.noResults}</p>
                        </div>
                    ) : (
                        filteredSchools.map((school, index) => (
                            <div
                                key={school.id}
                                className="school-card glass-card animate-fade-in-up"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    '--school-color': school.color
                                }}
                            >
                                {/* Header */}
                                <div className="school-header">
                                    <div className="school-logo" style={{ background: `${school.color}20` }}>
                                        {school.logo}
                                    </div>
                                    <div className="school-badges">
                                        <span className={`school-type-badge ${school.type}`}>
                                            {t.types[school.type]}
                                        </span>
                                        <span className="school-domain-badge">
                                            {t.domains[school.domain]}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <h3 className="school-name">{school.name}</h3>
                                <p className="school-fullname">{school.fullName}</p>
                                <p className="school-city">📍 {school.city}</p>

                                {/* Stats */}
                                <div className="school-stats">
                                    <div className="stat">
                                        <span className="stat-value">{school.averageScore}</span>
                                        <span className="stat-label">{t.avgScore}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{school.duration}</span>
                                        <span className="stat-label">{t.years}</span>
                                    </div>
                                </div>

                                {/* Specialties */}
                                <div className="school-specialties">
                                    {school.specialties.slice(0, 3).map((specialty, idx) => (
                                        <span key={idx} className="specialty-tag">{specialty}</span>
                                    ))}
                                    {school.specialties.length > 3 && (
                                        <span className="specialty-more">+{school.specialties.length - 3}</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="school-actions">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => openDetailModal(school)}
                                    >
                                        {t.viewDetails}
                                    </button>
                                    <button
                                        className={`btn btn-secondary btn-sm compare-btn ${compareList.find(s => s.id === school.id) ? 'active' : ''}`}
                                        onClick={() => toggleCompare(school)}
                                    >
                                        {compareList.find(s => s.id === school.id) ? '✓' : '+'} {t.compare}
                                    </button>
                                </div>

                                {/* Accent Line */}
                                <div className="school-accent" style={{ background: school.color }}></div>
                            </div>
                        ))
                    )}
                </div>

                {/* Compare Bar */}
                {
                    compareList.length > 0 && (
                        <div className="compare-bar glass animate-fade-in-up">
                            <div className="compare-schools">
                                {compareList.map(school => (
                                    <div key={school.id} className="compare-item">
                                        <span className="compare-logo">{school.logo}</span>
                                        <span className="compare-name">{school.name}</span>
                                        <button
                                            className="compare-remove"
                                            onClick={() => toggleCompare(school)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                className={`btn btn-primary ${compareList.length < 2 ? 'disabled' : ''}`}
                                onClick={openCompareModal}
                                disabled={compareList.length < 2}
                            >
                                {t.compare} ({compareList.length}/3)
                            </button>
                        </div>
                    )
                }

                {/* Comparison Modal */}
                {
                    showCompareModal && (
                        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
                            <div className="modal-content compare-modal glass-card" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2 className="modal-title">
                                        {language === 'fr' ? '📊 Comparaison des Écoles' :
                                            language === 'ar' ? '📊 مقارنة المدارس' : '📊 Schools Comparison'}
                                    </h2>
                                    <button className="modal-close" onClick={() => setShowCompareModal(false)}>×</button>
                                </div>

                                <div className="comparison-table-wrapper">
                                    <table className="comparison-table">
                                        <thead>
                                            <tr>
                                                <th className="criteria-header">
                                                    {language === 'fr' ? 'Critère' : language === 'ar' ? 'المعيار' : 'Criteria'}
                                                </th>
                                                {compareList.map(school => (
                                                    <th key={school.id} className="school-header" style={{ borderTop: `4px solid ${school.color}` }}>
                                                        <span className="th-logo">{school.logo}</span>
                                                        <span className="th-name">{school.name}</span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Nom complet' : language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>{school.fullName}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Ville' : language === 'ar' ? 'المدينة' : 'City'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>📍 {school.city}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Type' : language === 'ar' ? 'النوع' : 'Type'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <span className={`type-badge ${school.type}`}>
                                                            {t.types[school.type]}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Domaine' : language === 'ar' ? 'المجال' : 'Domain'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <span className="domain-badge">
                                                            {t.domains[school.domain] || school.domain}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Durée' : language === 'ar' ? 'المدة' : 'Duration'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <strong>{school.duration}</strong> {t.years}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Moyenne requise' : language === 'ar' ? 'المعدل المطلوب' : 'Required Average'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <span className="score-badge">{school.averageScore}/20</span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Admission' : language === 'ar' ? 'القبول' : 'Admission'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>{school.admissionMethod}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Diplôme' : language === 'ar' ? 'الشهادة' : 'Diploma'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>🎓 {school.diploma}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Spécialités' : language === 'ar' ? 'التخصصات' : 'Specialties'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <div className="specialties-list">
                                                            {school.specialties.slice(0, 4).map((spec, idx) => (
                                                                <span key={idx} className="mini-tag">{spec}</span>
                                                            ))}
                                                            {school.specialties.length > 4 && (
                                                                <span className="mini-tag more">+{school.specialties.length - 4}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Débouchés' : language === 'ar' ? 'الآفاق المهنية' : 'Career Paths'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <div className="careers-list">
                                                            {school.careers.slice(0, 3).map((career, idx) => (
                                                                <span key={idx} className="career-item">• {career}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowCompareModal(false)}>
                                        {language === 'fr' ? 'Fermer' : language === 'ar' ? 'إغلاق' : 'Close'}
                                    </button>
                                    <button className="btn btn-primary" onClick={() => {
                                        setCompareList([])
                                        setShowCompareModal(false)
                                    }}>
                                        {language === 'fr' ? 'Réinitialiser' : language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* School Detail Modal */}
                {
                    showDetailModal && selectedSchool && (
                        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                            <div className="modal-content detail-modal glass-card" onClick={e => e.stopPropagation()}>
                                <div className="modal-header" style={{ borderBottom: `3px solid ${selectedSchool.color}` }}>
                                    <div className="detail-header-info">
                                        <span className="detail-logo">{selectedSchool.logo}</span>
                                        <div>
                                            <h2 className="modal-title">{selectedSchool.name}</h2>
                                            <p className="detail-fullname">{selectedSchool.fullName}</p>
                                        </div>
                                    </div>
                                    <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
                                </div>

                                <div className="detail-content">
                                    <div className="detail-badges">
                                        <span className={`school-type-badge ${selectedSchool.type}`}>
                                            {t.types[selectedSchool.type]}
                                        </span>
                                        <span className="school-domain-badge">
                                            {t.domains[selectedSchool.domain] || selectedSchool.domain}
                                        </span>
                                    </div>

                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">📍 {language === 'fr' ? 'Ville' : 'City'}</span>
                                            <span className="detail-value">{selectedSchool.city}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">⏱️ {language === 'fr' ? 'Durée' : 'Duration'}</span>
                                            <span className="detail-value">{selectedSchool.duration} {t.years}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">📊 {language === 'fr' ? 'Moyenne requise' : 'Required Avg'}</span>
                                            <span className="detail-value score">{selectedSchool.averageScore}/20</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">📝 {language === 'fr' ? 'Admission' : 'Admission'}</span>
                                            <span className="detail-value">{selectedSchool.admissionMethod}</span>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>🎓 {language === 'fr' ? 'Diplôme' : 'Diploma'}</h4>
                                        <p>{selectedSchool.diploma}</p>
                                    </div>

                                    <div className="detail-section">
                                        <h4>🔬 {language === 'fr' ? 'Spécialités' : 'Specialties'}</h4>
                                        <div className="detail-tags">
                                            {selectedSchool.specialties.map((spec, idx) => (
                                                <span key={idx} className="specialty-tag">{spec}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>💼 {language === 'fr' ? 'Débouchés professionnels' : 'Career Paths'}</h4>
                                        <ul className="careers-detail-list">
                                            {selectedSchool.careers.map((career, idx) => (
                                                <li key={idx}>{career}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                                        {language === 'fr' ? 'Fermer' : language === 'ar' ? 'إغلاق' : 'Close'}
                                    </button>
                                    <button
                                        className={`btn btn-primary ${compareList.find(s => s.id === selectedSchool.id) ? 'active' : ''}`}
                                        onClick={() => toggleCompare(selectedSchool)}
                                    >
                                        {compareList.find(s => s.id === selectedSchool.id) ? '✓ ' : '+ '}
                                        {t.compare}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </section>
    )
}

export default SchoolsExplorer
