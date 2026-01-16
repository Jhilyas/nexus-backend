import { useState, useEffect } from 'react'
import './SchoolsExplorer.css'

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
            medicine: 'Médecine',
            arts: 'Arts'
        },
        cities: ['Rabat', 'Casablanca', 'Meknès', 'Benguerir'],
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
            medicine: 'Medicine',
            arts: 'Arts'
        },
        cities: ['Rabat', 'Casablanca', 'Meknès', 'Benguerir'],
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
            medicine: 'الطب',
            arts: 'الفنون'
        },
        cities: ['الرباط', 'الدار البيضاء', 'مكناس', 'بنجرير'],
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

const schoolsData = [
    {
        id: 1,
        name: 'ENSIAS',
        fullName: 'École Nationale Supérieure d\'Informatique et d\'Analyse des Systèmes',
        city: 'Rabat',
        type: 'public',
        domain: 'engineering',
        specialties: ['Computer Science', 'Data Science', 'Cybersecurity', 'Software Engineering'],
        admissionMethod: 'Concours National Commun',
        averageScore: 16.5,
        duration: 3,
        diploma: 'Ingénieur d\'État',
        careers: ['Software Engineer', 'Data Scientist', 'Security Analyst', 'Tech Lead'],
        logo: '🖥️',
        color: '#667eea'
    },
    {
        id: 2,
        name: 'EMI',
        fullName: 'École Mohammadia d\'Ingénieurs',
        city: 'Rabat',
        type: 'public',
        domain: 'engineering',
        specialties: ['Civil Engineering', 'Industrial Engineering', 'Computer Science', 'Electrical'],
        admissionMethod: 'Concours National Commun',
        averageScore: 17.0,
        duration: 3,
        diploma: 'Ingénieur d\'État',
        careers: ['Civil Engineer', 'Industrial Engineer', 'Project Manager', 'Consultant'],
        logo: '🏗️',
        color: '#f59e0b'
    },
    {
        id: 3,
        name: 'INPT',
        fullName: 'Institut National des Postes et Télécommunications',
        city: 'Rabat',
        type: 'public',
        domain: 'engineering',
        specialties: ['Telecommunications', 'Network Engineering', 'IoT', 'Cloud Computing'],
        admissionMethod: 'Concours National Commun',
        averageScore: 16.8,
        duration: 3,
        diploma: 'Ingénieur d\'État',
        careers: ['Network Engineer', 'Telecom Specialist', 'IoT Developer', 'DevOps'],
        logo: '📡',
        color: '#10b981'
    },
    {
        id: 4,
        name: 'ENCG Casablanca',
        fullName: 'École Nationale de Commerce et de Gestion',
        city: 'Casablanca',
        type: 'public',
        domain: 'business',
        specialties: ['Marketing', 'Finance', 'Management', 'International Business'],
        admissionMethod: 'TAFEM',
        averageScore: 14.0,
        duration: 5,
        diploma: 'Diplôme Grande École',
        careers: ['Marketing Manager', 'Financial Analyst', 'Business Consultant', 'CEO'],
        logo: '📊',
        color: '#8b5cf6'
    },
    {
        id: 5,
        name: 'FMP Rabat',
        fullName: 'Faculté de Médecine et de Pharmacie de Rabat',
        city: 'Rabat',
        type: 'public',
        domain: 'medicine',
        specialties: ['General Medicine', 'Pharmacy', 'Dentistry', 'Specializations'],
        admissionMethod: 'Concours',
        averageScore: 16.0,
        duration: 7,
        diploma: 'Doctorat en Médecine',
        careers: ['Doctor', 'Specialist', 'Surgeon', 'Pharmacist'],
        logo: '⚕️',
        color: '#ef4444'
    },
    {
        id: 6,
        name: 'ENSAM Meknès',
        fullName: 'École Nationale Supérieure des Arts et Métiers',
        city: 'Meknès',
        type: 'public',
        domain: 'engineering',
        specialties: ['Mechanical Engineering', 'Industrial Engineering', 'Production', 'Energy'],
        admissionMethod: 'Concours National Commun',
        averageScore: 16.2,
        duration: 3,
        diploma: 'Ingénieur d\'État',
        careers: ['Mechanical Engineer', 'Production Manager', 'Quality Engineer', 'R&D'],
        logo: '⚙️',
        color: '#f97316'
    },
    {
        id: 7,
        name: 'UM6P',
        fullName: 'Université Mohammed VI Polytechnique',
        city: 'Benguerir',
        type: 'private',
        domain: 'engineering',
        specialties: ['Computer Science', 'Mining', 'Agriculture Tech', 'AI & Robotics'],
        admissionMethod: 'Dossier + Entretien',
        averageScore: 15.5,
        duration: 5,
        diploma: 'Ingénieur',
        careers: ['Tech Lead', 'Research Scientist', 'Entrepreneur', 'AI Engineer'],
        logo: '🔬',
        color: '#06b6d4'
    },
    {
        id: 8,
        name: 'HEM',
        fullName: 'Hautes Études de Management',
        city: 'Casablanca',
        type: 'private',
        domain: 'business',
        specialties: ['Business Administration', 'Entrepreneurship', 'Marketing', 'Finance'],
        admissionMethod: 'Concours HEM',
        averageScore: 13.0,
        duration: 5,
        diploma: 'Master Grande École',
        careers: ['Entrepreneur', 'CEO', 'Consultant', 'Manager'],
        logo: '🎓',
        color: '#ec4899'
    }
];

const SchoolsExplorer = ({ language = 'fr' }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState({
        domain: 'all',
        city: 'all',
        type: 'all'
    })
    const [selectedSchool, setSelectedSchool] = useState(null)
    const [compareList, setCompareList] = useState([])

    const t = translations[language]
    const isRTL = language === 'ar'

    const filteredSchools = schoolsData.filter(school => {
        const matchesSearch =
            school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            school.fullName.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesDomain = filters.domain === 'all' || school.domain === filters.domain
        const matchesCity = filters.city === 'all' || school.city === filters.city
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
                                {['Rabat', 'Casablanca', 'Meknès', 'Benguerir'].map((city) => (
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
                                        onClick={() => setSelectedSchool(school)}
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
                {compareList.length > 0 && (
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
                        <button className="btn btn-primary">
                            {t.compare} ({compareList.length}/3)
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}

export default SchoolsExplorer
